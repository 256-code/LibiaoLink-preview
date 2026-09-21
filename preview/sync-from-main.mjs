#!/usr/bin/env node
/**
 * 从主仓同步最新前端源码，并套用演示模式补丁。
 * 用法：node preview/sync-from-main.mjs [主仓根目录，默认 D:/LibiaoLink]
 * 步骤：1) 复制主仓 frontend/ 源码到本仓根目录（排除依赖、构建产物与本地配置）
 *       2) git apply preview/demo-mode.patch（上游改动与补丁冲突时会报错退出）
 * 本脚本不自动提交：跑完请先 git status / npm run build 检查，再提交推送。
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const mainRoot = path.resolve(process.argv[2] ?? "D:/LibiaoLink");
const sourceDir = path.join(mainRoot, "frontend");

// 本仓自己的文件：永远不被上游覆盖
const EXCLUDE = new Set(["node_modules", "dist", ".env", ".env.local", ".env.example", "README.md", ".gitignore"]);

function shouldSkip(rel) {
  const top = rel.split("/")[0];
  return EXCLUDE.has(top) || rel.endsWith(".local") || rel.endsWith(".log");
}

// 逐文件复制：不用 fs.cpSync（Windows 上目标已存在时 cpSync 会崩），也更方便按规则跳过。
let copied = 0;
for (const entry of readdirSync(sourceDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) {
    continue;
  }
  const from = path.join(entry.parentPath ?? entry.path, entry.name);
  const rel = path.relative(sourceDir, from).split(path.sep).join("/");
  if (shouldSkip(rel)) {
    continue;
  }
  const to = path.join(repoRoot, rel);
  mkdirSync(path.dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied += 1;
}
console.log("已复制 " + copied + " 个文件：" + sourceDir + " → " + repoRoot);

try {
  execFileSync("git", ["apply", "preview/demo-mode.patch"], { cwd: repoRoot, stdio: "inherit" });
  console.log("已套用演示模式补丁 preview/demo-mode.patch");
} catch {
  console.error("演示模式补丁套用失败：上游改动与补丁冲突，请手动解决，并同步更新 preview/demo-mode.patch。");
  process.exit(1);
}

execFileSync("git", ["status", "--short"], { cwd: repoRoot, stdio: "inherit" });
console.log("下一步：npm ci && npm run build 验证通过后，提交并推送 main。");
