/**
 * 演示模式（GitHub Pages 预览站专用；主仓 frontend/ 中不存在本目录）。
 * - 无后端、无 SSO：所有请求交给浏览器内的假后端（见 ./server.ts），任何人打开链接即可浏览与操作；
 * - 数据是内存态演示数据（项目 / 任务 / 字典来自主仓种子，见 preview/build-demo-data.mjs），刷新即重置；
 * - 提示带只在入口页（主页）渲染，内页不出现，避免影响观感。
 * 开关：VITE_DEMO_MODE（默认开启，见仓库根 .env）。
 */

import { installDemoUploadBridge } from "./upload";

export * from "./server";

// 模块副作用：装上上传桥接（拦截原生 fetch 的分片 PUT），只装一次。
installDemoUploadBridge();

/** 演示模式开关：预览仓构建默认开启，只有 VITE_DEMO_MODE=false 才关闭。 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

/** 演示提示带：只在入口页（主页）渲染，见 App.tsx 的 hub 分支。 */
export function DemoBanner() {
  return (
    <div
      role="note"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800"
    >
      演示环境：无需登录，数据为示例数据（假后端在浏览器内），刷新后重置
    </div>
  );
}
