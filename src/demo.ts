/**
 * 演示模式（GitHub Pages 预览站专用；主仓 frontend/ 中不存在本文件）。
 * - 无后端、无 SSO：/auth/me 由本地伪造，任何人打开链接即可浏览与操作原型；
 * - 数据仍是前端内存态演示数据，刷新即重置为初始示例；
 * - 顶栏挂一条提示带、账号菜单显示演示说明，避免访问者误以为需要登录。
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

/** 顶部提示带：直接挂到 body 顶部，不改动页面布局代码（滚动时随页面走，不影响内页交互）。 */
function mountDemoBanner(): void {
  const bar = document.createElement("div");
  bar.setAttribute("role", "note");
  bar.textContent = "演示环境：无需登录，数据为示例数据，刷新后重置";
  bar.style.cssText = [
    "background:#78350F",
    "color:#FEF3C7",
    "font-size:12px",
    "line-height:1.8",
    "padding:2px 12px",
    "text-align:center",
    "letter-spacing:0.02em",
  ].join(";");
  document.body.prepend(bar);
}

/** 安装演示模式：入口 main.tsx 调用一次。 */
export function installDemoMode(): void {
  if (!DEMO_MODE) {
    return;
  }
  mountDemoBanner();
}
