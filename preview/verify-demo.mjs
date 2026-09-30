#!/usr/bin/env node
/**
 * 演示版（纯前端假后端）本机走查脚本（预览仓专用，不属于主仓 frontend/）。
 * 无头 Chrome + CDP 逐页巡视：入口页 / 项目空间 / 工作台三标签 / 任务模板 / 项目详情六视图，
 * 采集 console.warn（[demo] 假后端未覆盖）、console.error、未捕获异常、HTTP 4xx-5xx，
 * 并在项目详情打开任务抽屉、上传一张示例图片，验证「浏览器内上传链路」与图片预览；每页截图到 OUT_DIR。
 * 用法：node preview/verify-demo.mjs（前置：本仓 npm run dev -- --port 4321 --strictPort）
 * 环境变量：DEMO_BASE / CHROME_PATH / CDP_PORT / OUT_DIR
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE_RAW = process.env.DEMO_BASE ?? "http://localhost:4321/LibiaoLink-preview/";
const BASE = BASE_RAW.endsWith("/") ? BASE_RAW : BASE_RAW + "/";
const PORT = Number(process.env.CDP_PORT ?? 9555);
const OUT = process.env.OUT_DIR ?? join(process.cwd(), ".verify-out");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const j = (value) => JSON.stringify(value);

mkdirSync(OUT, { recursive: true });
const problems = [];

const profile = mkdtempSync(join(tmpdir(), "libiaolink-demo-verify-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + String(PORT), "--user-data-dir=" + profile, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "about:blank"], { stdio: "ignore" });

async function waitTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const list = await (await fetch("http://127.0.0.1:" + String(PORT) + "/json/list")).json();
      const found = list.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
      if (found) {
        return found;
      }
    } catch (error) {
      // Chrome 还没起来，继续等
    }
    await sleep(500);
  }
  throw new Error("Chrome 调试端口未就绪");
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.console = [];
    this.logs = [];
    this.exceptions = [];
    this.responses = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve());
      this.ws.addEventListener("error", () => reject(new Error("CDP WebSocket 连接失败")));
    });
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(typeof event.data === "string" ? event.data : String(event.data));
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const item = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) {
          item.reject(new Error(JSON.stringify(msg.error)));
        } else {
          item.resolve(msg.result);
        }
        return;
      }
      const params = msg.params ?? {};
      if (msg.method === "Runtime.consoleAPICalled") {
        const text = params.args.map((arg) => (arg.value !== undefined ? String(arg.value) : String(arg.description ?? arg.type))).join(" ");
        this.console.push({ type: params.type, text });
      } else if (msg.method === "Runtime.exceptionThrown") {
        this.exceptions.push(JSON.stringify(params.exceptionDetails).slice(0, 400));
      } else if (msg.method === "Log.entryAdded") {
        const entry = params.entry;
        this.logs.push(entry.level + " | " + entry.source + " | " + entry.text + " | " + (entry.url ?? ""));
      } else if (msg.method === "Network.responseReceived") {
        this.responses.push({ status: params.response.status, url: params.response.url });
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("CDP 调用超时：" + method));
      }, 45000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  mark() {
    return { c: this.console.length, e: this.exceptions.length, l: this.logs.length, r: this.responses.length };
  }
  since(mark) {
    return {
      console: this.console.slice(mark.c),
      exceptions: this.exceptions.slice(mark.e),
      logs: this.logs.slice(mark.l),
      badResponses: this.responses.slice(mark.r).filter((item) => item.status >= 400),
    };
  }
}

let page = null;
const ev = async (expression) => {
  const reply = await page.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (reply.exceptionDetails !== undefined) {
    throw new Error("页面表达式抛异常：" + JSON.stringify(reply.exceptionDetails).slice(0, 240));
  }
  return reply.result.value;
};
async function waitFor(expression, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await ev(expression)) === true) {
      return true;
    }
    await sleep(250);
  }
  return false;
}
async function screenshot(name) {
  const shot = await page.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name + ".png"), Buffer.from(shot.data, "base64"));
}
function audit(label, items) {
  const found = [];
  for (const item of items.console) {
    if (item.type === "error") { found.push("console.error: " + item.text); }
    if (item.type === "warning" && item.text.indexOf("[demo]") >= 0) { found.push("假后端未覆盖: " + item.text); }
  }
  for (const text of items.exceptions) { found.push("未捕获异常: " + text); }
  for (const item of items.badResponses) { found.push("HTTP " + String(item.status) + " " + item.url); }
  for (const text of items.logs) {
    if (text.indexOf("error |") === 0) { found.push("浏览器日志: " + text.slice(0, 220)); }
  }
  for (const line of found) { problems.push(label + " → " + line); }
  return found;
}
async function openHash(hash, waitMs = 2600) {
  await page.send("Page.navigate", { url: "about:blank" });
  await sleep(250);
  await page.send("Page.navigate", { url: BASE + hash });
  await sleep(waitMs);
}
async function visit(name, hash, options = {}) {
  const mark = page.mark();
  await openHash(hash, options.waitMs ?? 2600);
  if (options.ready !== undefined) {
    const ok = await waitFor("document.querySelector(" + JSON.stringify(options.ready) + ") !== null", 15000);
    if (!ok) { problems.push(name + " → 等待元素超时：" + options.ready); }
    await sleep(700);
  }
  const info = await ev("(function(){return {title: document.title, nodes: document.body.querySelectorAll('*').length, text: (document.body.innerText || '').slice(0, 120)};})()");
  await screenshot(name);
  const found = audit(name + " [" + hash + "]", page.since(mark));
  console.log("== " + name + " " + hash + " → title=" + j(info.title) + " · 节点=" + String(info.nodes) + (found.length === 0 ? " 通过" : " 问题 " + String(found.length)));
  for (const line of found) { console.log("   ! " + line); }
  return info;
}

try {
  const target = await waitTarget();
  page = new Cdp(target.webSocketDebuggerUrl);
  await page.ready;
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Log.enable");
  await page.send("Network.enable");
  await page.send("DOM.enable");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 1500, height: 1000, deviceScaleFactor: 1, mobile: false });

  console.log("演示版走查开始：" + BASE + "（截图目录 " + OUT + "）");

  // ---------- ① 静态页面 ----------
  await visit("01-主页", "#/");
  const noteText = await ev("(function(){var n=document.querySelector('[role=note]');return n===null?null:n.innerText;})()");
  console.log("   主页提示带: " + j(noteText));
  if (noteText === null) { problems.push("主页 → 演示提示带缺失"); }

  await visit("02-项目空间", "#/projects", { ready: "[role=link][aria-label^=\"打开项目\"]" });
  const listHasBanner = await ev("document.querySelector('[role=note]') !== null");
  if (listHasBanner === true) { problems.push("项目空间 → 演示提示带应只在主页出现"); }

  await visit("03-工作台-我的任务", "#/my-tasks", { ready: "[data-workspace-page]" });
  await visit("04-工作台-我提出的问题", "#/my-tasks?tab=raised", { ready: "[data-workspace-issues]" });
  await visit("05-工作台-我的计划", "#/my-tasks?tab=plan", { ready: "[data-workspace-page]" });
  await visit("06-任务模板", "#/templates");

  // ---------- ② 工作台交互：展开折叠面板 + 切换标签 ----------
  await openHash("#/my-tasks", 2600);
  await waitFor("document.querySelector('[data-workspace-page]') !== null", 15000);
  await sleep(500);
  const panels = await ev("document.querySelectorAll('[data-workspace-panel]').length");
  const total = await ev("(function(){var n=document.querySelector('[data-workspace-task-total]');return n===null?null:n.innerText;})()");
  console.log("== 07-工作台交互 → 折叠面板块数=" + String(panels) + " · 汇总行=" + j(total));
  if (!(panels > 0)) { problems.push("工作台 → 「我的任务」折叠面板为空"); }
  const toggled = await ev("(function(){var b=document.querySelector('[data-workspace-panel-toggle]');if(b===null){return false;}b.click();return true;})()");
  if (toggled !== true) { problems.push("工作台 → 找不到折叠面板展开按钮"); }
  if (toggled === true) {
    const rows = await waitFor("document.querySelectorAll('[data-workspace-task]').length > 0", 8000);
    await screenshot("07-工作台-展开任务表");
    console.log("   展开后面板任务行: " + String(await ev("document.querySelectorAll('[data-workspace-task]').length")) + (rows ? " 通过" : " 未出现任务行"));
    if (!rows) { problems.push("工作台 → 展开面板后没有任务行"); }
  }
  const raisedClicked = await ev("(function(){var tabs=document.querySelectorAll('[data-workspace-tab]');for(var i=0;i<tabs.length;i+=1){if((tabs[i].innerText||'').indexOf('我提出的问题')>=0){tabs[i].click();return true;}}return false;})()");
  if (raisedClicked === true) {
    await sleep(1800);
    const hashNow = await ev("window.location.hash");
    const issueTotal = await ev("(function(){var n=document.querySelector('[data-workspace-issue-total]');return n===null?null:n.innerText;})()");
    const issuePanels = await ev("document.querySelectorAll('[data-workspace-issues] [data-workspace-panel]').length");
    await screenshot("08-工作台-我提出的问题");
    console.log("   切标签后 hash=" + j(hashNow) + " · 汇总=" + j(issueTotal) + " · 折叠面板=" + String(issuePanels));
    if (String(hashNow).indexOf("tab=raised") < 0) { problems.push("工作台 → 切「我提出的问题」后地址未写 ?tab=raised"); }
    if (!(issuePanels > 0)) { problems.push("工作台 → 「我提出的问题」没有折叠面板"); }
    const issueToggled = await ev("(function(){var p=document.querySelector('[data-workspace-issues] [data-workspace-panel-toggle]');if(p===null){return false;}p.click();return true;})()");
    if (issueToggled === true) {
      const issueRows = await waitFor("document.querySelectorAll('[data-workspace-issue]').length > 0", 8000);
      await screenshot("08b-工作台-我提出的问题-展开");
      console.log("   展开后问题行: " + String(await ev("document.querySelectorAll('[data-workspace-issue]').length")) + (issueRows ? " 通过" : " 未出现"));
      if (!issueRows) { problems.push("工作台 → 展开面板后没有「我提出的」问题行"); }
    } else {
      problems.push("工作台 → 「我提出的问题」折叠面板没有展开按钮");
    }
  } else {
    problems.push("工作台 → 找不到「我提出的问题」标签");
  }

  // ---------- ③ 项目详情六视图 ----------
  await openHash("#/projects", 2600);
  await waitFor("document.querySelector('[role=link][aria-label^=\"打开项目\"]') !== null", 15000);
  const cardClicked = await ev("(function(){var c=document.querySelector('[role=link][aria-label^=\"打开项目\"]');if(c===null){return false;}c.click();return true;})()");
  await sleep(2200);
  const href = await ev("window.location.hash");
  console.log("== 09-项目详情入口 → 卡片点击=" + String(cardClicked) + " · hash=" + j(href));
  if (cardClicked !== true || String(href).indexOf("/project/") < 0) {
    problems.push("项目空间 → 点击项目卡片没有进入详情");
  } else {
    const id = String(href).split("/project/")[1].split("?")[0];
    await visit("10-项目总览", "#/project/" + id);
    await visit("11-项目-甘特图", "#/project/" + id + "?view=gantt");
    await visit("12-项目-负责人", "#/project/" + id + "?view=owners");
    await visit("13-项目-任务进展", "#/project/" + id + "?view=progress");
    await visit("14-项目-日报填写", "#/project/" + id + "?view=daily");
    await visit("15-项目-日报记录", "#/project/" + id + "?view=daily&sub=records");
    await visit("16-项目-问题追踪", "#/project/" + id + "?view=daily&sub=issues");
    await visit("17-项目-问题看板", "#/project/" + id + "?view=daily&sub=board");
    await visit("18-项目-干系人", "#/project/" + id + "?view=stakeholders", { ready: "[data-stakeholder-row]" });
    const stakeholderRows = await ev("document.querySelectorAll('[data-stakeholder-row]').length");
    console.log("   干系人行: " + String(stakeholderRows));
    if (!(stakeholderRows > 0)) { problems.push("项目详情-干系人 → 没有干系人行"); }

    // ---------- ④ 任务抽屉：真实鼠标打开 + 上传示例图片 + 预览 ----------
    const mark = page.mark();
    await openHash("#/project/" + id, 3200);
    const rowInfo = await ev("(function(){var rows=document.querySelectorAll('[role=button]');for(var i=0;i<rows.length;i+=1){if(rows[i].getAttribute('title')==='点击查看任务详情'){var r=rows[i].getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};}}return null;})()");
    console.log("== 19-任务抽屉 → 任务行落点=" + j(rowInfo));
    let drawerOk = false;
    if (rowInfo === null) {
      problems.push("项目总览 → 找不到任务行（title=点击查看任务详情）");
    } else {
      await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rowInfo.x, y: rowInfo.y, button: "none" });
      await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x: rowInfo.x, y: rowInfo.y, button: "left", clickCount: 1 });
      await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rowInfo.x, y: rowInfo.y, button: "left", clickCount: 1 });
      drawerOk = await waitFor("document.querySelector('aside[role=dialog]') !== null", 8000);
    }
    console.log("   抽屉打开=" + String(drawerOk));
    if (!drawerOk) {
      problems.push("项目总览 → 点击任务行未打开抽屉");
    } else {
      await sleep(1200);
      await screenshot("19-任务抽屉");
      const drawer = await ev("(function(){var d=document.querySelector('aside[role=dialog]');return d===null?null:{hasUpload:d.querySelector('[data-file-upload-input]')!==null,files:d.querySelectorAll('[data-drawer-file-item]').length};})()");
      console.log("   抽屉：上传入口=" + String(drawer !== null && drawer.hasUpload) + " · 文件行=" + String(drawer === null ? -1 : drawer.files));
      if (drawer === null || drawer.hasUpload !== true) { problems.push("任务抽屉 → 没有上传入口"); }

      const pngPath = join(OUT, "演示上传-示例.png");
      writeFileSync(pngPath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
      const doc = await page.send("DOM.getDocument", { depth: 0 });
      const inputNode = await page.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "aside[role=dialog] [data-file-upload-input]" });
      if (inputNode.nodeId === 0) {
        problems.push("任务抽屉 → 找不到 file input 节点");
      } else {
        const filesBefore = await ev("document.querySelectorAll('aside[role=dialog] [data-drawer-file-item]').length");
        await page.send("DOM.setFileInputFiles", { files: [pngPath], nodeId: inputNode.nodeId });
        const uploaded = await waitFor("(function(){var d=document.querySelector('aside[role=dialog]');return d!==null && d.innerText.indexOf('演示上传-示例.png')>=0;})()", 20000);
        const filesAfter = await ev("document.querySelectorAll('aside[role=dialog] [data-drawer-file-item]').length");
        await sleep(1200);
        await screenshot("20-任务抽屉-上传后");
        console.log("   上传示例图片：列表出现=" + String(uploaded) + " · 文件行 " + String(filesBefore) + "→" + String(filesAfter));
        if (!uploaded) { problems.push("任务抽屉 → 上传示例图片后列表没出现文件名"); }
        const countLabel = await ev("(function(){var d=document.querySelector('aside[role=dialog]');if(d===null){return null;}var t=(d.innerText||'');var i=t.indexOf('共 ');if(i<0){return null;}var j=i+2;var digits='';while(j<t.length&&'0123456789'.indexOf(t.charAt(j))>=0){digits+=t.charAt(j);j+=1;}return digits===''?null:Number(digits);})()");
        console.log("   抽屉「共 N 份」标签: " + j(countLabel) + "（清单行数 " + String(filesAfter) + "）");
        if (countLabel !== filesAfter) { problems.push("任务抽屉 → 「共 N 份」与实际清单行数不一致：" + String(countLabel) + " vs " + String(filesAfter)); }
        const thumbState = await ev("(function(){var items=document.querySelectorAll('aside[role=dialog] [data-drawer-file-item]');for(var i=0;i<items.length;i+=1){if((items[i].innerText||'').indexOf('演示上传-示例.png')>=0){var img=items[i].querySelector('img');return {hasThumb:img!==null,thumbSrc:img===null?null:String(img.getAttribute('src')||'').slice(0,16)};}}return null;})()");
        console.log("   上传文件缩略图: " + j(thumbState));
        if (thumbState === null || thumbState.hasThumb !== true || String(thumbState.thumbSrc).indexOf("blob:") !== 0) {
          problems.push("任务抽屉 → 上传图片没有生成 blob 缩略图（字节没进内存库）");
        }
        const previewClicked = await ev("(function(){var items=document.querySelectorAll('aside[role=dialog] [data-drawer-file-item]');for(var i=0;i<items.length;i+=1){if((items[i].innerText||'').indexOf('演示上传-示例.png')>=0){var b=items[i].querySelector('[data-file-preview-open]');if(b===null){b=items[i].querySelector('[data-file-thumb]');}if(b!==null){b.click();return true;}}}return false;})()");
        if (previewClicked === true) {
          await sleep(2600);
          const previewState = await ev("(function(){var f=document.querySelector('[data-file-preview]');if(f===null){return null;}var img=f.querySelector('img');return {kind:f.getAttribute('data-file-preview-kind'),imgSrc:img===null?null:String(img.getAttribute('src')||'').slice(0,16)};})()");
          await screenshot("21-图片预览");
          console.log("   图片预览浮层: " + j(previewState));
          if (previewState === null || previewState.kind !== "image" || String(previewState.imgSrc).indexOf("blob:") !== 0) { problems.push("任务抽屉 → 上传图片的预览浮层没拿到 blob 大图"); }
        } else {
          problems.push("任务抽屉 → 上传后的文件行没有预览入口");
        }
      }
    }
    audit("19/20-任务抽屉上传", page.since(mark));
  }
} catch (error) {
  problems.push("脚本异常: " + (error && error.message ? error.message : String(error)));
} finally {
  if (chrome.exitCode === null && chrome.signalCode === null) { chrome.kill(); }
  await sleep(600);
  try { rmSync(profile, { recursive: true, force: true }); } catch (error) { /* 清理失败不影响结论 */ }
  console.log("");
  if (problems.length === 0) {
    console.log("结论：未发现异常（0 项）。");
  } else {
    console.log("结论：共 " + String(problems.length) + " 项问题：");
    for (const line of problems) { console.log("  - " + line); }
  }
  process.exit(problems.length === 0 ? 0 : 1);
}
