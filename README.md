# LibiaoLink 前端预览站

LibiaoLink（立镖全链路信息平台）前端的**公开预览副本**：只含主仓 `frontend/` 的代码，产物由 GitHub Pages 托管。

- 预览地址：https://256-code.github.io/LibiaoLink-preview/
- 无需登录：站点跑在演示模式下，`/auth/me` 由浏览器本地伪造（`src/demo.ts`），任何人打开链接即可浏览与操作原型。
- 数据是前端内存态示例数据：新增 / 编辑只改浏览器内存，**刷新即重置**；不连后端，不写任何服务器。
- 顶部的演示提示带、账号菜单里的「演示模式，无需登录」只在本仓存在。

## 与主仓的关系

主仓：[256-code/LibiaoLink](https://github.com/256-code/LibiaoLink)（改动落在其 `frontend/`）。本仓 = 主仓前端快照 + 演示模式补丁。

代码差异只有两类：

- 新增 `src/demo.ts`（演示模式：伪会话 + 提示带）；
- 改动 `src/api.ts`、`src/main.tsx`、`src/components/AppHeader.tsx`、`index.html`、`vite.config.ts`，即 `preview/demo-mode.patch`。

## 同步主仓最新前端

```bash
node preview/sync-from-main.mjs            # 默认读 D:/LibiaoLink
node preview/sync-from-main.mjs <主仓路径>
```

脚本先复制主仓 `frontend/` 源码（排除 `node_modules/`、`dist/`、`.env*`、`README.md`、`.gitignore`），再套用 `preview/demo-mode.patch`。
补丁冲突（上游改动与演示补丁打架）时脚本报错退出，需要手动解决并更新补丁。

## 本地开发与构建

```bash
npm ci
npm run dev        # http://localhost:3000（演示模式默认开启）
npm run build      # 产物在 dist/，基路径取 .env 的 VITE_BASE
npm run preview    # 本地预览构建产物
```

- `VITE_DEMO_MODE`：演示模式开关，默认开启；置 `false` 会恢复主仓的登录校验行为。
- `VITE_BASE`：部署基路径，GitHub Pages 项目站必须是 `/LibiaoLink-preview/`。

## 部署

推送到 `main` 会触发 `.github/workflows/deploy-pages.yml`：`npm ci` → `npm run build` → 发布 `dist/` 到 GitHub Pages。
