#!/usr/bin/env node
/**
 * 从主仓的数据库种子生成演示数据（纯前端假后端的底料）。
 * 用法：node preview/build-demo-data.mjs [主仓根目录，默认 D:/LibiaoLink]
 * 输入：<主仓>/database/seeds/{dicts,demo-projects,task-nodes,task-templates,blueprint,role-permissions}.mjs
 * 输出：src/demo/data.generated.ts（本仓提交；构建机 / GitHub Actions 不需要主仓在场）
 * 说明：种子里的项目经理用户名 → 虚构中文名（MANAGER_NAMES），公开演示不出现真实姓名。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const mainRoot = path.resolve(process.argv[2] ?? "D:/LibiaoLink");
const seedsDir = path.join(mainRoot, "database", "seeds");

/** 演示用虚构姓名：用户名 → 展示名（不使用真实姓名）。 */
const MANAGER_NAMES = {
  panxing: "张伟",
  wmj: "李娜",
  lan: "王强",
  shaochenyu: "刘洋",
  xulinjie: "徐林杰",
  yicaonan: "曹楠",
  yuhong: "于宏",
};

const load = async (name) => import(pathToFileURL(path.join(seedsDir, name)).href);

const dictsSeed = await load("dicts.mjs");
const projectsSeed = await load("demo-projects.mjs");
const nodesSeed = await load("task-nodes.mjs");
const templatesSeed = await load("task-templates.mjs");
const blueprintSeed = await load("blueprint.mjs");
const matrixSeed = await load("role-permissions.mjs");

const regionItems = [];
const seenRegion = new Set();
for (const item of dictsSeed.DICTS.find((dict) => dict.type.code === "region").items) {
  seenRegion.add(item.code);
  regionItems.push({ code: item.code, name: item.name, sort: item.sort });
}
for (const item of projectsSeed.REGIONS) {
  if (!seenRegion.has(item.code)) {
    seenRegion.add(item.code);
    regionItems.push({ code: item.code, name: item.name, sort: item.sort });
  }
}

const projectTypeItems = dictsSeed.DICTS.find((dict) => dict.type.code === "projectType").items;
const usernames = new Set();
for (const project of projectsSeed.PROJECTS) {
  for (const username of String(project.manager).split("+")) {
    if (username.trim() !== "") {
      usernames.add(username.trim());
    }
  }
}
const users = Array.from(usernames).sort().map((username) => ({
  username,
  displayName: MANAGER_NAMES[username] ?? username,
}));

const permissionKeys = new Set();
for (const key of JSON.stringify(matrixSeed.MATRIX).match(/"[a-z]+\.[a-z]+"/g) ?? []) {
  permissionKeys.add(key.slice(1, -1));
}

const data = {
  regions: regionItems,
  projectTypes: projectTypeItems.map((item) => ({
    code: item.code,
    name: item.name,
    sort: item.sort,
    metadata: item.metadata ?? {},
  })),
  users,
  projects: projectsSeed.PROJECTS.map((project) => ({
    code: project.code,
    name: project.name,
    region: project.region,
    projectType: project.projectType,
    stageKey: project.stageKey,
    status: project.status,
    managers: String(project.manager).split("+").map((item) => item.trim()).filter((item) => item !== ""),
  })),
  stages: blueprintSeed.DEFAULT_STAGES.map((stage) => ({ key: stage.key ?? stage.stageKey, name: stage.name })),
  stageNodes: nodesSeed.STAGE_NODE_SEED.map((group) => ({
    stageKey: group.stageKey,
    nodes: group.nodes.map((node, index) => ({
      title: node.title,
      titleEn: node.titleEn ?? null,
      seq: (index + 1) * 10,
    })),
  })),
  stageTemplates: templatesSeed.STAGE_TEMPLATE_SEED.map((group) => ({
    stageKey: group.stageKey,
    templates: group.templates.map((template) => ({ name: template.name, nodes: template.nodes })),
  })),
  permissionKeys: Array.from(permissionKeys).sort(),
};

const typeBlock = [
  "/** 生成物：由 preview/build-demo-data.mjs 生成，请勿手改（改主仓种子后重跑生成器）。 */",
  "export type GeneratedData = {",
  "  regions: Array<{ code: string; name: string; sort: number }>;",
  "  projectTypes: Array<{ code: string; name: string; sort: number; metadata: Record<string, unknown> }>;",
  "  users: Array<{ username: string; displayName: string }>;",
  "  projects: Array<{",
  "    code: string;",
  "    name: string;",
  "    region: string;",
  "    projectType: string;",
  "    stageKey: string;",
  "    status: string;",
  "    managers: string[];",
  "  }>;",
  "  stages: Array<{ key: string; name: string }>;",
  "  stageNodes: Array<{ stageKey: string; nodes: Array<{ title: string; titleEn: string | null; seq: number }> }>;",
  "  stageTemplates: Array<{ stageKey: string; templates: Array<{ name: string; nodes: string[] }> }>;",
  "  permissionKeys: string[];",
  "};",
  "",
  "export const generated: GeneratedData = " + JSON.stringify(data, null, 2) + ";",
  "",
].join("\n");

mkdirSync(path.join(repoRoot, "src", "demo"), { recursive: true });
const outFile = path.join(repoRoot, "src", "demo", "data.generated.ts");
writeFileSync(outFile, typeBlock, "utf8");
console.log(
  "演示数据已生成：" +
    outFile +
    "（项目 " + String(data.projects.length) + " · 地区 " + String(data.regions.length) +
    " · 用户 " + String(data.users.length) + " · 权限键 " + String(data.permissionKeys.length) + "）",
);
