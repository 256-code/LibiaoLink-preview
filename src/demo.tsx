/**
 * 演示模式（GitHub Pages 预览站专用；主仓 frontend/ 中不存在本文件）。
 * - 无后端、无 SSO：/auth/me 由本地伪造，任何人打开链接即可浏览与操作原型；
 * - 数据仍是前端内存态演示数据，刷新即重置为初始示例；
 * - 提示带只在入口页（主页）渲染，内页不出现，避免影响观感。
 * 开关：VITE_DEMO_MODE（默认开启，见仓库根 .env）。
 */
import type { MeResponse } from "./types";

/** 演示模式开关：预览仓构建默认开启，只有 VITE_DEMO_MODE=false 才关闭。 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

/** 演示账号：只存在于浏览器内存，没有对应后端会话。 */
export const DEMO_ME: MeResponse = {
  user: {
    name: "demo",
    displayName: "演示用户",
    email: "demo@libiaolink.invalid",
    id: "demo-user",
    owner: "demo",
  },
  claims: {
    demo: true,
    note: "GitHub Pages 预览环境：未接后端，令牌声明为占位值（主仓由 /auth/me 返回真实声明）",
  },
  expiresAt: null,
};

/** /auth/me 的本地伪响应：App.tsx 的登录校验据此直接进入已登录态。 */
export function demoMeResponse(): Response {
  return new Response(JSON.stringify(DEMO_ME), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/** 演示提示带：只在入口页（主页）渲染，见 App.tsx 的 hub 分支。 */
export function DemoBanner() {
  return (
    <div
      role="note"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800"
    >
      演示环境：无需登录，数据为示例数据，刷新后重置
    </div>
  );
}
