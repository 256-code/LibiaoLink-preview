import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { installDemoMode } from "./demo";
import "./app.css";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("页面缺少 #root 容器");
}

// 预览站：先装演示模式（提示带），再做首屏渲染。
installDemoMode();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
