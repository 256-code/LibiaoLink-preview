/**
 * 假后端：主仓 Push 195 之后新接接口的路由（文件库 / 日报与问题 / 干系人 / 工作台）。
 * 与 server.ts 同一套语义：读接口给演示数据、写接口改内存、乐观锁 version 冲突返回 409；
 * 返回 null = 本模块不认识该请求，交回 server.ts 继续匹配或走 404。
 */
import * as db from "./database";
import * as store from "./store";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fail(status: number, code: string, message: string): Response {
  return json({ code, message, details: [], traceId: "demo-" + String(Date.now()) }, status);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function fileView(file: store.DemoFile) {
  return {
    id: file.id,
    projectId: file.projectId,
    nodeId: null,
    taskId: file.taskId,
    docType: file.docType,
    name: file.name,
    status: file.recycled ? "recycled" : file.status,
    currentVersionId: file.seq === 0 ? null : "v-" + file.id + "-" + String(file.seq),
    version: file.version,
    createdBy: "demo-user",
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    finalizedAt: file.status === "final" ? file.updatedAt : null,
    finalizedBy: file.status === "final" ? "demo-user" : null,
    recycledAt: file.recycled ? file.updatedAt : null,
    recycledBy: file.recycled ? "demo-user" : null,
    recycledFromStatus: file.recycled ? "draft" : null,
  };
}

function versionView(file: store.DemoFile) {
  return {
    id: "v-" + file.id + "-" + String(file.seq),
    fileId: file.id,
    seq: file.seq,
    sizeBytes: file.sizeBytes,
    contentHash: "demo" + String(file.sizeBytes % 100000000).padStart(8, "0"),
    mime: file.mime,
    uploadedBy: "demo-user",
    uploadedAt: file.updatedAt,
    changeRequestId: null,
  };
}

function fileDetail(file: store.DemoFile) {
  return { ...fileView(file), currentVersion: file.seq === 0 ? null : versionView(file) };
}


/** 文件库：上传三步（建档 → 取分片地址 → 完成）+ 详情 / 改名 / 回收站 / 预览 / 下载签名 / 项目文件列表。 */
function fileRoutes(method: string, parts: string[], body: Record<string, unknown>): Response | null {
  if (parts[0] !== "api" || parts[1] !== "v1" || parts[2] !== "files") {
    return null;
  }
  const fileId = parts[3] ?? "";
  if (parts.length === 4 && fileId === "uploads" && method === "POST") {
    const projectId = String(body.projectId ?? "");
    if (db.projects.every((project) => project.id !== projectId)) {
      return fail(404, "NOT_FOUND", "项目不存在");
    }
    const file = store.createUploadFile({
      projectId,
      taskId: stringOrNull(body.taskId),
      name: String(body.name ?? "未命名文件"),
      mime: stringOrNull(body.mime),
      sizeBytes: numberOrNull(body.sizeBytes) ?? 0,
    });
    const now = new Date();
    return json({
      file: fileView(file),
      upload: {
        id: "ul-" + file.id,
        fileId: file.id,
        intent: "version",
        partSizeBytes: 5 * 1024 * 1024,
        totalParts: 1,
        status: "open",
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 86400000).toISOString(),
      },
      duplicateHint: null,
    });
  }
  if (parts.length === 7 && parts[4] === "uploads" && parts[6] === "parts" && method === "POST") {
    const numbers = Array.isArray(body.partNumbers) ? body.partNumbers : [1];
    return json({
      parts: numbers.map((value) => ({ partNumber: Number(value), url: "/__demo-upload/" + fileId })),
    });
  }
  if (parts.length === 7 && parts[4] === "uploads" && parts[6] === "complete" && method === "POST") {
    const file = store.fileById(fileId);
    if (file === undefined) {
      return fail(404, "NOT_FOUND", "文件不存在");
    }
    store.completeUpload(file, null);
    return json({ file: fileView(file), version: versionView(file), changeRequest: null });
  }
  if (parts.length === 4 && method === "GET") {
    const file = store.fileById(fileId);
    return file === undefined ? fail(404, "NOT_FOUND", "文件不存在") : json(fileDetail(file));
  }
  if (parts.length === 4 && method === "PATCH") {
    const file = store.fileById(fileId);
    if (file === undefined) {
      return fail(404, "NOT_FOUND", "文件不存在");
    }
    const version = numberOrNull(body.version);
    if (version !== null && version !== file.version) {
      return fail(409, "VERSION_CONFLICT", "文件已被他人修改，请刷新后重试");
    }
    const name = String(body.name ?? "").trim();
    if (name === "") {
      return fail(400, "VALIDATION_FAILED", "文件名不能为空");
    }
    file.name = name;
    file.version += 1;
    file.updatedAt = new Date().toISOString();
    return json(fileView(file));
  }
  if (parts.length === 4 && method === "DELETE") {
    const file = store.fileById(fileId);
    if (file === undefined) {
      return fail(404, "NOT_FOUND", "文件不存在");
    }
    file.recycled = true;
    file.updatedAt = new Date().toISOString();
    return json({ file: { id: file.id } });
  }

  if (parts.length === 5 && parts[4] === "recycle" && method === "POST") {
    const file = store.fileById(fileId);
    if (file === undefined) {
      return fail(404, "NOT_FOUND", "文件不存在");
    }
    const version = numberOrNull(body.version);
    if (version !== null && version !== file.version) {
      return fail(409, "VERSION_CONFLICT", "文件已被他人修改，请刷新后重试");
    }
    file.recycled = true;
    file.updatedAt = new Date().toISOString();
    return json({ file: { id: file.id } });
  }
  if (parts.length === 5 && parts[4] === "preview" && method === "GET") {
    const file = store.fileById(fileId);
    if (file === undefined) {
      return fail(404, "NOT_FOUND", "文件不存在");
    }
    const name = file.name.toLowerCase();
    const isImage = (file.mime ?? "").startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"].some((ext) => name.endsWith(ext));
    const isPdf = file.mime === "application/pdf" || name.endsWith(".pdf");
    const canPreview = file.bytes !== null || isImage;
    if (!canPreview) {
      return json({
        fileId: file.id,
        versionId: file.seq === 0 ? null : "v-" + file.id + "-" + String(file.seq),
        status: "failed",
        target: null,
        url: null,
        expiresAt: null,
        pipelineVersion: null,
        reason: isPdf ? "演示数据不含原文件（种子文件只有元数据）；上传的文件可以正常预览" : "该类型不支持预览",
        generatedAt: null,
      });
    }
    return json({
      fileId: file.id,
      versionId: file.seq === 0 ? null : "v-" + file.id + "-" + String(file.seq),
      status: "ready",
      target: isImage ? "image" : "pdf",
      url: store.objectUrlOf(file),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      pipelineVersion: "demo-1",
      reason: null,
      generatedAt: new Date().toISOString(),
    });
  }
  if (parts.length === 7 && parts[4] === "versions" && parts[6] === "download-url" && method === "GET") {
    const file = store.fileById(fileId);
    if (file === undefined) {
      return fail(404, "NOT_FOUND", "文件不存在");
    }
    return json({
      url: store.objectUrlOf(file),
      fileName: file.name,
      sizeBytes: file.sizeBytes,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
  }
  return null;
}


/** 日报与问题（A3）：列表 / 新建 / 编辑 / 删除（成对删除口径与真机一致）。 */
function reportRoutes(method: string, parts: string[], query: URLSearchParams, body: Record<string, unknown>): Response | null {
  if (parts[0] !== "api" || parts[1] !== "v1" || parts[2] !== "projects") {
    return null;
  }
  const projectId = parts[3] ?? "";
  if (parts.length === 5 && parts[4] === "files" && method === "GET") {
    const limit = Number(query.get("limit") ?? "200");
    const page = Number(query.get("page") ?? "1");
    const items = store.filesOf(projectId).map(fileView);
    const start = (page - 1) * limit;
    return json({ items: items.slice(start, start + limit), page, limit, total: items.length });
  }
  if (parts.length === 5 && parts[4] === "reports") {
    if (method === "GET") {
      const limit = Number(query.get("limit") ?? "200");
      const items = store.reportsOf(projectId).map(store.reportView);
      return json({ items: items.slice(0, limit), page: 1, limit, total: items.length });
    }
    if (method === "POST") {
      return json(store.reportView(store.createReport(projectId, body)), 201);
    }
  }
  if (parts.length === 6 && parts[4] === "reports" && method === "PATCH") {
    const report = store.reportById(projectId, parts[5] ?? "");
    if (report === undefined) {
      return fail(404, "NOT_FOUND", "日报不存在");
    }
    const version = numberOrNull(body.version);
    if (version !== null && version !== report.version) {
      return fail(409, "VERSION_CONFLICT", "日报已被他人修改，请刷新后重试");
    }
    if (typeof body.state === "string") {
      report.state = body.state;
      report.submittedAt = body.state === "draft" ? null : new Date().toISOString();
    }
    if ("headcount" in body) {
      report.headcount = numberOrNull(body.headcount);
    }
    if (typeof body.doneWork === "string") {
      report.doneWork = body.doneWork;
    }
    if ("plan" in body) {
      report.plan = stringOrNull(body.plan);
    }
    if ("suggestion" in body) {
      report.suggestion = stringOrNull(body.suggestion);
    }
    if (Array.isArray(body.stageKeys)) {
      report.stageKeys = stringList(body.stageKeys);
    }
    if ("foundIssue" in body) {
      report.foundIssue = stringOrNull(body.foundIssue);
    }
    if (Array.isArray(body.issueCategories)) {
      report.issueCategories = stringList(body.issueCategories);
    }
    report.version += 1;
    return json(store.reportView(report));
  }
  if (parts.length === 6 && parts[4] === "reports" && method === "DELETE") {
    const cascaded = store.deleteReport(projectId, parts[5] ?? "");
    return json({ id: parts[5] ?? "", deleted: true, cascadedIssueIds: cascaded });
  }
  if (parts.length === 5 && parts[4] === "issues" && method === "GET") {
    const limit = Number(query.get("limit") ?? "200");
    const items = store.issuesOf(projectId).map(store.issueView);
    return json({ items: items.slice(0, limit), page: 1, limit, total: items.length });
  }
  if (parts.length === 6 && parts[4] === "issues" && method === "PATCH") {
    const issue = store.issueById(projectId, parts[5] ?? "");
    if (issue === undefined) {
      return fail(404, "NOT_FOUND", "问题不存在");
    }
    const version = numberOrNull(body.version);
    if (version !== null && version !== issue.version) {
      return fail(409, "VERSION_CONFLICT", "问题已被他人修改，请刷新后重试");
    }
    if (typeof body.state === "string") {
      issue.state = body.state;
    }
    if (typeof body.title === "string" && body.title.trim() !== "") {
      issue.title = body.title.trim();
    }
    if (Array.isArray(body.categories)) {
      issue.categories = stringList(body.categories);
    }
    if ("solution" in body) {
      issue.solution = stringOrNull(body.solution);
    }
    issue.version += 1;
    return json(store.issueView(issue));
  }
  if (parts.length === 6 && parts[4] === "issues" && method === "DELETE") {
    const result = store.deleteIssue(projectId, parts[5] ?? "");
    return json({ id: parts[5] ?? "", deleted: true, cascadedReportId: result.cascadedReportId, cascadedIssueIds: result.cascadedIssueIds });
  }
  return null;
}


/** 干系人台账（A5）：列表（关键词 / 公司分类 / 项目筛选）/ 新增 / 更新 / 删除。 */
function stakeholderRoutes(method: string, parts: string[], query: URLSearchParams, body: Record<string, unknown>): Response | null {
  if (parts[0] !== "api" || parts[1] !== "v1" || parts[2] !== "stakeholders") {
    return null;
  }
  if (parts.length === 3 && method === "GET") {
    const limit = Number(query.get("limit") ?? "50");
    const page = Number(query.get("page") ?? "1");
    const keyword = (query.get("q") ?? "").trim().toLowerCase();
    const companyTypes = (query.get("filter[companyType]") ?? "").split(",").filter((item) => item !== "");
    const projectId = query.get("filter[projectId]");
    let items = store.stakeholderList();
    if (companyTypes.length > 0) {
      items = items.filter((item) => companyTypes.includes(item.companyType));
    }
    if (projectId !== null && projectId !== "") {
      items = items.filter((item) => item.projectIds.includes(projectId));
    }
    if (keyword !== "") {
      items = items.filter((item) => [item.name, item.company ?? "", item.title ?? ""].join(" ").toLowerCase().includes(keyword));
    }
    const sorted = items.slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const start = (page - 1) * limit;
    return json({ items: sorted.slice(start, start + limit).map(store.stakeholderView), page, limit, total: sorted.length });
  }
  if (parts.length === 3 && method === "POST") {
    if (String(body.name ?? "").trim() === "") {
      return fail(400, "VALIDATION_FAILED", "姓名不能为空");
    }
    return json(store.stakeholderView(store.createStakeholder(body)), 201);
  }
  if (parts.length === 4 && method === "PATCH") {
    const item = store.stakeholderById(parts[3] ?? "");
    if (item === undefined) {
      return fail(404, "NOT_FOUND", "干系人不存在");
    }
    store.updateStakeholder(item, body);
    return json(store.stakeholderView(item));
  }
  if (parts.length === 4 && method === "DELETE") {
    const ok = store.deleteStakeholder(parts[3] ?? "");
    return ok ? json({ id: parts[3] ?? "", deleted: true }) : fail(404, "NOT_FOUND", "干系人不存在");
  }
  return null;
}

/** 演示版假后端扩展路由入口：不认识就返回 null，交给 server.ts 的兜底 404。 */
export function demoRoute(method: string, parts: string[], query: URLSearchParams, body: Record<string, unknown>): Response | null {
  const head = parts.join("/");
  if (head === "api/v1/workspace" && method === "GET") {
    return json(store.workspace());
  }
  return fileRoutes(method, parts, body) ?? reportRoutes(method, parts, query, body) ?? stakeholderRoutes(method, parts, query, body);
}

