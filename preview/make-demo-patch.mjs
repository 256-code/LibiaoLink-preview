#!/usr/bin/env node
/**
 * 生成 preview/demo-mode.patch（演示模式补丁）：主仓 frontend 的原始文件当 a 侧、本仓工作区当 b 侧。
 * 用法：node preview/make-demo-patch.mjs [主仓根目录，默认 D:/LibiaoLink]
 * 时机：改了演示模式（src/demo/** 或下面 FILES 里任一文件）之后重跑；sync-from-main.mjs 复制完上游源码会套这份补丁。
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const upstreamDir = path.join(path.resolve(process.argv[2] ?? "D:/LibiaoLink"), "frontend");
/** 演示模式动过的文件（其余文件与上游一字不差）。 */
const FILES = ["index.html", "vite.config.ts", "src/api.ts", "src/App.tsx", "src/components/AppHeader.tsx"];

// 两侧文件摆成 a/ 与 b/ 两个临时目录，用 git diff --no-index 出带 a/ b/ 前缀的补丁（git apply -p1 可直接套）。
const work = mkdtempSync(path.join(os.tmpdir(), "libiaolink-demo-patch-"));

for (const rel of FILES) {
  for (const [root, side] of [[upstreamDir, "a"], [repoRoot, "b"]]) {
    const target = path.join(work, side, rel);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, rel), target);
  }
}
let patch = "";
try {
  patch = execFileSync("git", ["diff", "--no-index", "--no-prefix", "--", "a", "b"], { cwd: work, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (error) {
  patch = error.stdout ?? "";
}

if (patch.trim() === "") {
  console.error("没有差异：本仓演示文件与主仓 frontend 完全一致（确认主仓是最新、且演示改动确实落在 FILES 里）。");
  process.exit(1);
}
writeFileSync(path.join(here, "demo-mode.patch"), patch, "utf8");
console.log("已写入 preview/demo-mode.patch（" + String(patch.split(String.fromCharCode(10)).length - 1) + " 行）：sync-from-main.mjs 会在复制上游源码后套它。");

