# LibiaoLink 前端预览站

LibiaoLink（立镖全链路信息平台）前端的 **公开预览副本**：只含主仓 `frontend/` 的代码 + 浏览器内假后端，产物由 GitHub Pages 托管。

- 预览地址：https://256-code.github.io/LibiaoLink-preview/
- 无需登录：站在演示模式下，`/auth/me` 与全部 `/api/v1` 请求都由 **浏览器内的假后端** 应答（`src/demo/server.ts`），任何人打开链接即可浏览与操作。
- 数据是内存态示例数据（由主仓种子生成）：新增 / 编辑 / 删除只改浏览器内存，**刷新即重置**；不连任何后端、不写服务器。
- 演示提示带只在主页显示；账号菜单里的「演示模式，无需登录」只在本仓存在。
- 人员工号在演示模式下统一显示为 `u-01` 这类占位（真实用户名不出网）。

## 与主仓的关系

主仓：[256-code/LibiaoLink](https://github.com/256-code/LibiaoLink)（改动落在其 `frontend/`）。本仓 = 主仓前端快照 + 演示模式补丁 + 演示数据；主仓不动。

代码差异只有两类：

- 新增 `src/demo/`：演示模式开关与提示带（`index.tsx`）、假后端路由（`server.ts`，覆盖前端实际调用的全部接口）、内存数据（`database.ts`）、由主仓种子生成的数据（`data.generated.ts`）；
- 改动 `src/api.ts`（`apiFetch` / `redirectToLogin` 分流到假后端）、`src/App.tsx`、`src/components/AppHeader.tsx`、`index.html`、`vite.config.ts`（基路径）：即 `preview/demo-mode.patch`。

## 同步主仓最新前端

```bash
node preview/sync-from-main.mjs            # 默认读 D:/LibiaoLink
node preview/sync-from-main.mjs <主仓路径>
```

脚本三步走：1) 复制主仓 `frontend/` 源码（排除 `node_modules/`、`dist/`、`.env*`、`README.md`、`.gitignore`）；2) 清理上游已删除、本仓还留着的旧文件（如早期的 `src/data/managers.ts`，留着会编译报错）；3) 套用 `preview/demo-mode.patch`。

补丁冲突（上游改动与演示补丁打架）时脚本报错退出：手动解决后重生成补丁。

改动演示模式本身时用 `--copy-only` 跳过套补丁：

```bash
node preview/sync-from-main.mjs --copy-only    # 只复制 + 清理，不套补丁
# …改 src/demo/** 或上面那 5 个文件…
node preview/make-demo-patch.mjs              # 重生成 preview/demo-mode.patch
npm run build                                 # typecheck + 构建
```

`make-demo-patch.mjs` 用「主仓原始文件 vs 本仓工作区」逐文件出 diff（a/ b/ 前缀，`git apply -p1` 可直接套），只覆盖上面那 5 个文件；生成完建议在干净副本上试套一次。

## 演示数据

`src/demo/data.generated.ts` 由主仓种子生成（地区 / 项目类型字典、用户、100 个示例项目、阶段节点、模板、权限键）：

```bash
node preview/build-demo-data.mjs               # 默认读 D:/LibiaoLink
```

主仓种子（`database/seeds/*.mjs`）改了重跑一次即可；任务列表由 `src/demo/database.ts` 按项目当前阶段确定性生成，写操作只进内存。

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

