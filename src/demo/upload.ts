/**
 * 上传桥接（演示模式专用）：文件上传链路里「PUT 预签名地址」那一步走的是原生 fetch，
 * 预览站没有对象存储，这里把同源的 /__demo-upload/{fileId} 请求拦下来，把字节塞进内存库。
 * 安装一次即可（见 ./index.tsx 的模块副作用）；非演示环境不会加载本模块。
 */
import { putUploadBytes } from "./store";

const UPLOAD_PREFIX = "/__demo-upload/";

export function installDemoUploadBridge(): void {
  if (typeof window === "undefined") {
    return;
  }
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const path = raw.startsWith("http") ? new URL(raw).pathname : raw;
    if (!path.startsWith(UPLOAD_PREFIX)) {
      return original(input, init);
    }
    const fileId = decodeURIComponent(path.slice(UPLOAD_PREFIX.length));
    let bytes: ArrayBuffer | null = null;
    if (init.body instanceof Blob) {
      bytes = await init.body.arrayBuffer();
    } else if (init.body instanceof ArrayBuffer) {
      bytes = init.body;
    }
    if (bytes !== null) {
      putUploadBytes(fileId, bytes);
    }
    return new Response("", { status: 200, headers: { ETag: "\"demo-\"" + String(bytes?.byteLength ?? 0) + "\"" } });
  };
}

