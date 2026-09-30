/**
 * 纯前端假后端（演示模式专用，不发起任何网络请求）。
 * - apiFetch 在演示模式下把请求交给 demoFetch，按契约路径返回本地数据；
 * - 读接口从 database.ts 的演示数据取，写接口改内存（乐观锁 version / 409 冲突口径与真机一致）；
 * - 只覆盖前端真实调用的接口，未覆盖的路径返回 404 + 控制台提示（便于发现漏接）。
 */
import type { DemoNode, DemoProject, DemoTask, DemoTemplate } from "./database";
import * as db from "./database";
import { demoRoute } from "./routes";
import * as store from "./store";

export const DEMO_ME = {
  user: {
    name: "demo",
    displayName: "演示用户",
    email: "demo@libiaolink.invalid",
    id: "demo-user",
    owner: "demo",
  },
  claims: {
    demo: true,
    note: "GitHub Pages 预览环境：假后端跑在浏览器里，令牌声明为占位值（主仓由 /auth/me 返回真实声明）",
  },
  expiresAt: null,
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fail(status: number, code: string, message: string, details: Array<Record<string, unknown>> = []): Response {
  return json({ code, message, details, traceId: "demo-" + String(Date.now()) }, status);
}

function todayText(): string {
  return new Date().toISOString().slice(0, 10);
}

function displayStatusOf(task: DemoTask): string {
  if (task.status === "done") {
    if (task.actualEnd !== null && task.plannedEnd !== null && task.actualEnd < task.plannedEnd) {
      return "early_done";
    }
    return "done";
  }
  if (task.status === "overdue" || task.status === "early_done") {
    return task.status;
  }
  if (task.plannedEnd !== null && task.plannedEnd < todayText()) {
    return "overdue";
  }
  return task.status;
}

function taskView(task: DemoTask): DemoTask {
  task.displayStatus = displayStatusOf(task);
  return task;
}

function taskListItem(task: DemoTask) {
  const view = { ...taskView(task) };
  // 文件摘要按文件库现算（含本次会话上传 / 移入回收站的文件），与抽屉清单同源：
  // 否则「共 N 份」会用任务快照里的种子数量，和上传后的清单行数对不上。
  const files = store.taskFilesOf(task.projectId, task.id);
  const draft = files.filter((file) => file.status !== "final").length;
  return {
    ...view,
    ownerNames: view.ownerIds.map((id) => db.userNameOf(id) ?? null),
    fileSummary: { total: files.length, draft, final: files.length - draft },
  };
}

function projectView(project: DemoProject) {
  return {
    id: project.id,
    code: project.code,
    seqNo: project.seqNo,
    name: project.name,
    customer: project.customer,
    region: project.region,
    projectType: project.projectType,
    managerIds: [...project.managerIds],
    managerNames: [...project.managerNames],
    stageKey: project.stageKey,
    status: project.status,
    description: project.description,
    version: project.version,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

type FilterState = {
  regions: string[];
  projectTypes: string[];
  managerIds: string[];
  timeFrom: string | null;
  timeTo: string | null;
  q: string;
  sortKey: string;
  sortDesc: boolean;
};

function listOf(value: string | null): string[] {
  if (value === null || value.trim() === "") {
    return [];
  }
  return value.split(",").map((item) => item.trim()).filter((item) => item !== "");
}

function parseFilters(query: URLSearchParams): FilterState {
  const sort = query.get("sort") ?? "createdAt:desc";
  const parts = sort.split(":");
  return {
    regions: listOf(query.get("filter[region]")),
    projectTypes: listOf(query.get("filter[projectType]")),
    managerIds: listOf(query.get("filter[managerId]")),
    timeFrom: query.get("filter[timeFrom]"),
    timeTo: query.get("filter[timeTo]"),
    q: (query.get("q") ?? "").trim(),
    sortKey: parts[0] ?? "createdAt",
    sortDesc: (parts[1] ?? "desc") === "desc",
  };
}

function projectMatches(project: DemoProject, filters: FilterState): boolean {
  if (filters.regions.length > 0 && !filters.regions.includes(project.region)) {
    return false;
  }
  if (filters.projectTypes.length > 0 && !filters.projectTypes.includes(project.projectType)) {
    return false;
  }
  if (filters.managerIds.length > 0 && !project.managerIds.some((id) => filters.managerIds.includes(id))) {
    return false;
  }
  const activity = project.updatedAt.slice(0, 10);
  if (filters.timeFrom !== null && activity < filters.timeFrom) {
    return false;
  }
  if (filters.timeTo !== null && activity > filters.timeTo) {
    return false;
  }
  if (filters.q !== "") {
    const names = project.managerNames.filter((name): name is string => name !== null);
    const haystack = [project.code, project.name, project.region, project.projectType].concat(names).join(" ");
    if (!haystack.toLowerCase().includes(filters.q.toLowerCase())) {
      return false;
    }
  }
  return true;
}

function sortedProjects(filters: FilterState): DemoProject[] {
  const items = db.projects.filter((project) => projectMatches(project, filters));
  const key = filters.sortKey === "updatedAt" ? "updatedAt" : "createdAt";
  return items.slice().sort((left, right) => {
    const order = left[key].localeCompare(right[key]);
    return filters.sortDesc ? -order : order;
  });
}

function countsOf(projects: DemoProject[], field: "region" | "projectType"): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const project of projects) {
    const key = project[field];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function managerCounts(projects: DemoProject[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const project of projects) {
    for (const id of project.managerIds) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
  return counts;
}

function usageOf(type: "region" | "projectType", code: string): number {
  return db.projects.filter((project) => (type === "region" ? project.region : project.projectType) === code).length;
}

function dictView(type: "region" | "projectType") {
  return {
    type,
    items: db.dictItems[type].map((item) => ({
      code: item.code,
      name: item.name,
      sort: item.sort,
      enabled: item.enabled,
      usageCount: usageOf(type, item.code),
      metadata: item.metadata,
    })),
  };
}

function summaryOf(projectId: string) {
  const tasks = db.tasksOf(projectId).map((task) => ({ ...taskView(task) }));
  const done = tasks.filter((task) => task.displayStatus === "done" || task.displayStatus === "early_done").length;
  const overdue = tasks.filter((task) => task.displayStatus === "overdue").length;
  const started = tasks.filter((task) => task.displayStatus !== "pending");
  const latestStage = started.length === 0 ? null : started[started.length - 1].stageKey;
  let slowestStage: string | null = null;
  let slowestRatio = 2;
  for (const stageKey of db.STAGE_ORDER) {
    const stageTasks = tasks.filter((task) => task.stageKey === stageKey);
    if (stageTasks.length === 0) {
      continue;
    }
    const stageDone = stageTasks.filter((task) => task.displayStatus === "done" || task.displayStatus === "early_done").length;
    const ratio = stageDone / stageTasks.length;
    if (ratio < slowestRatio && ratio < 1) {
      slowestRatio = ratio;
      slowestStage = stageKey;
    }
  }
  return { projectId, slowestStage, latestStage, overdue, done, total: tasks.length };
}

function nodeView(node: DemoNode) {
  return {
    id: node.id,
    stageKey: node.stageKey,
    seq: node.seq,
    title: node.title,
    titleEn: node.titleEn,
    version: node.version,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

function templateView(template: DemoTemplate) {
  const nodes = template.nodeIds
    .map((nodeId) => db.nodes.find((node) => node.id === nodeId))
    .filter((node): node is DemoNode => node !== undefined)
    .map((node) => ({ nodeId: node.id, seq: node.seq, title: node.title, titleEn: node.titleEn }));
  return {
    id: template.id,
    name: template.name,
    stageKey: template.stageKey,
    nodes,
    version: template.version,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

function findProject(id: string): DemoProject | undefined {
  return db.projects.find((project) => project.id === id);
}

function ifMatchVersion(init: RequestInit): number | null {
  const raw = new Headers(init.headers).get("If-Match");
  if (raw === null || raw.trim() === "" || Number.isNaN(Number(raw))) {
    return null;
  }
  return Number(raw);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** 演示版假后端入口：apiFetch 在演示模式下直接调它，不经网络。 */
export async function demoFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const url = new URL(input, window.location.origin);
  const parts = url.pathname.split("/").filter((part) => part !== "");
  const head = parts.join("/");
  const query = url.searchParams;
  let body: Record<string, unknown> = {};
  if (typeof init.body === "string" && init.body !== "") {
    body = JSON.parse(init.body) as Record<string, unknown>;
  }

  if (head === "auth/me") {
    return json(DEMO_ME);
  }
  if (head.startsWith("auth/")) {
    return json({ ok: true });
  }

  if (head === "api/v1/dicts" && method === "GET") {
    return json({ items: [dictView("region"), dictView("projectType")] });
  }
  if (parts.length === 6 && parts[0] === "api" && parts[4] !== "" && parts[5] === "items" && parts[3] === "dicts" && method === "POST") {
    const type = parts[4] === "projectType" ? "projectType" : "region";
    const code = String(body.code ?? "");
    if (code === "" || db.dictItems[type].some((item) => item.code === code)) {
      return fail(409, "DICT_ITEM_EXISTS", "该条目已存在");
    }
    const current = db.dictItems[type];
    current.push({
      code,
      name: String(body.name ?? code),
      sort: numberOrNull(body.sort) ?? (current.length + 1) * 10,
      enabled: body.enabled !== false,
      metadata: (body.metadata as Record<string, unknown>) ?? {},
    });
    return json(dictView(type));
  }
  if (parts.length === 7 && parts[0] === "api" && parts[3] === "dicts" && parts[5] === "items" && method === "DELETE") {
    const type = parts[4] === "projectType" ? "projectType" : "region";
    const code = decodeURIComponent(parts[6]);
    if (usageOf(type, code) > 0) {
      return fail(409, "DICT_ITEM_IN_USE", "该条目仍有项目在用，不能删除");
    }
    db.dictItems[type] = db.dictItems[type].filter((item) => item.code !== code);
    return json(dictView(type));
  }

  if (head === "api/v1/permissions/me" && method === "GET") {
    return json({
      permissions: {
        userId: DEMO_ME.user.id,
        roleCodes: ["admin"],
        dataScopes: ["all"],
        permissionKeys: db.PERMISSION_KEYS,
      },
    });
  }

  if (head === "api/v1/users" && method === "GET") {
    const limit = Number(query.get("limit") ?? "200");
    // 演示模式隐私口径：真实用户名不对外（公开预览站），工号换成占位 id，关联仍走 id。
    const items = db.users.map((user) => ({ ...user, username: user.id, email: user.id + "@libiaolink.invalid" }));
    return json({ items, page: 1, limit, total: items.length });
  }

  if (head === "api/v1/users/me/preferences") {
    if (method === "GET") {
      return json(db.preferences);
    }
    if (method === "PATCH") {
      if (Array.isArray(body.taskTableHiddenColumns)) {
        db.preferences.taskTableHiddenColumns = stringList(body.taskTableHiddenColumns);
      }
      if (Array.isArray(body.homeSavedFilters)) {
        db.preferences.homeSavedFilters = body.homeSavedFilters;
      }
      if (typeof body.focusMode === "boolean") {
        db.preferences.focusMode = body.focusMode;
      }
      if (typeof body.workspaceOpenProjects === "object" && body.workspaceOpenProjects !== null) {
        const value = body.workspaceOpenProjects as { tasks?: unknown; raised?: unknown };
        db.preferences.workspaceOpenProjects = { tasks: stringList(value.tasks), raised: stringList(value.raised) };
      }
      db.preferences.updatedAt = new Date().toISOString();
      return json(db.preferences);
    }
  }

  if (head === "api/v1/projects") {
    if (method === "GET") {
      const filters = parseFilters(query);
      const items = sortedProjects(filters);
      const limit = Number(query.get("limit") ?? "200");
      return json({ items: items.map(projectView), page: 1, limit, total: items.length });
    }
    if (method === "POST") {
      const code = String(body.code ?? "").trim();
      if (code === "" || db.projects.some((project) => project.code === code)) {
        return fail(409, "PROJECT_CODE_EXISTS", "项目编号已存在", [{ code: "DUPLICATE", message: "项目编号已存在", path: "code" }]);
      }
      const managerIds = stringList(body.managerIds);
      const stamp = new Date().toISOString();
      const created: DemoProject = {
        id: code.toLowerCase(),
        code,
        seqNo: db.projects.reduce((max, project) => Math.max(max, project.seqNo), 0) + 1,
        name: String(body.name ?? ""),
        customer: textOrNull(body.customer),
        region: String(body.region ?? ""),
        projectType: String(body.projectType ?? ""),
        managerIds,
        managerNames: managerIds.map((id) => db.userNameOf(id) ?? null),
        stageKey: "presale",
        status: "active",
        description: null,
        version: 1,
        createdAt: stamp,
        updatedAt: stamp,
      };
      db.projects.unshift(created);
      return json(projectView(created), 201);
    }
  }

  if (head === "api/v1/projects/facets" && method === "GET") {
    const items = sortedProjects(parseFilters(query));
    const status: Record<string, number> = {};
    const stageKey: Record<string, number> = {};
    for (const project of items) {
      status[project.status] = (status[project.status] ?? 0) + 1;
      stageKey[project.stageKey] = (stageKey[project.stageKey] ?? 0) + 1;
    }
    return json({
      total: items.length,
      region: countsOf(items, "region"),
      projectType: countsOf(items, "projectType"),
      managerId: managerCounts(items),
      stageKey,
      status,
    });
  }

  if (parts.length >= 4 && head.startsWith("api/v1/projects/")) {
    const projectId = decodeURIComponent(parts[3]);
    const project = findProject(projectId);
    const rest = parts.slice(4);

    if (rest.length === 0) {
      if (project === undefined) {
        return fail(404, "PROJECT_NOT_FOUND", "项目不存在");
      }
      if (method === "GET") {
        return json(projectView(project));
      }
      if (method === "PATCH") {
        if (numberOrNull(body.version) !== project.version) {
          return fail(409, "VERSION_CONFLICT", "项目已被他人修改，请刷新后重试");
        }
        const code = String(body.code ?? project.code).trim();
        if (code !== project.code && db.projects.some((item) => item.code === code)) {
          return fail(409, "PROJECT_CODE_EXISTS", "项目编号已存在", [{ code: "DUPLICATE", message: "项目编号已存在", path: "code" }]);
        }
        const managerIds = Array.isArray(body.managerIds) ? stringList(body.managerIds) : project.managerIds;
        project.code = code;
        project.name = String(body.name ?? project.name);
        project.region = String(body.region ?? project.region);
        project.projectType = String(body.projectType ?? project.projectType);
        project.managerIds = managerIds;
        project.managerNames = managerIds.map((id) => db.userNameOf(id) ?? null);
        project.version += 1;
        project.updatedAt = new Date().toISOString();
        return json(projectView(project));
      }
      if (method === "DELETE") {
        const version = ifMatchVersion(init);
        if (version === null) {
          return fail(400, "VALIDATION_FAILED", "缺少 If-Match 版本", [{ code: "REQUIRED", message: "缺少 If-Match", path: "If-Match" }]);
        }
        if (version !== project.version) {
          return fail(409, "VERSION_CONFLICT", "项目已被他人修改，请刷新后重试");
        }
        const snapshot = projectView(project);
        db.projects.splice(db.projects.indexOf(project), 1);
        db.setTasks(project.id, []);
        return json(snapshot);
      }
    }

    if (project === undefined) {
      return fail(404, "PROJECT_NOT_FOUND", "项目不存在");
    }
    if (rest.length === 1 && rest[0] === "summary" && method === "GET") {
      return json(summaryOf(project.id));
    }

    if (rest.length === 1 && rest[0] === "tasks") {
      if (method === "GET") {
        const items = db.tasksOf(project.id).slice().sort((left, right) => left.sortIndex - right.sortIndex);
        return json({ items: items.map(taskListItem), page: 1, limit: Number(query.get("limit") ?? "200"), total: items.length });
      }
      if (method === "POST") {
        const list = db.tasksOf(project.id);
        const maxSort = list.reduce((max, task) => Math.max(max, task.sortIndex), 0);
        const ownerIds = stringList(body.ownerIds);
        const stamp = new Date().toISOString();
        const created: DemoTask = {
          id: db.nextTaskId(project.id),
          projectId: project.id,
          stageKey: textOrNull(body.stageKey),
          sortIndex: numberOrNull(body.sortIndex) ?? maxSort + 10,
          nodeId: textOrNull(body.nodeId) ?? textOrNull(body.taskNodeId),
          sourceNodeId: textOrNull(body.sourceNodeId),
          title: String(body.title ?? ""),
          titleEn: textOrNull(body.titleEn),
          ownerIds,
          status: "pending",
          displayStatus: "pending",
          progress: 0,
          plannedStart: textOrNull(body.plannedStart),
          plannedEnd: textOrNull(body.plannedEnd),
          actualEnd: null,
          estimatedDays: numberOrNull(body.estimatedDays),
          headcount: numberOrNull(body.headcount),
          priority: textOrNull(body.priority),
          deliverableTypes: stringList(body.deliverableTypes),
          note: textOrNull(body.note),
          onTime: null,
          changeLinks: [],
          version: 1,
          createdAt: stamp,
          updatedAt: stamp,
          files: [],
        };
        list.push(created);
        return json(taskView(created), 201);
      }
    }

    if (rest.length === 1 && rest[0] === "tasks/from-template" && method === "POST") {
      const template = db.templates.find((item) => item.id === String(body.templateId ?? ""));
      if (template === undefined) {
        return fail(404, "TEMPLATE_NOT_FOUND", "任务模板不存在");
      }
      const wanted = stringList(body.nodeIds);
      const nodeIds = wanted.length > 0 ? wanted : template.nodeIds;
      const skipExisting = body.skipExisting !== false;
      const list = db.tasksOf(project.id);
      let maxSort = list.reduce((max, task) => Math.max(max, task.sortIndex), 0);
      const ownerIds = stringList(body.ownerIds);
      const stamp = new Date().toISOString();
      const created: DemoTask[] = [];
      const skipped: Array<{ nodeId: string; taskId: string }> = [];
      for (const nodeId of nodeIds) {
        const node = db.nodes.find((item) => item.id === nodeId);
        if (node === undefined) {
          continue;
        }
        const existing = list.find((task) => task.nodeId === nodeId);
        if (existing !== undefined) {
          if (skipExisting) {
            skipped.push({ nodeId, taskId: existing.id });
          }
          continue;
        }
        maxSort += 10;
        const task: DemoTask = {
          id: db.nextTaskId(project.id) + "-" + String(created.length + 1),
          projectId: project.id,
          stageKey: node.stageKey,
          sortIndex: maxSort,
          nodeId: node.id,
          sourceNodeId: node.id,
          title: node.title,
          titleEn: node.titleEn,
          ownerIds,
          status: "pending",
          displayStatus: "pending",
          progress: 0,
          plannedStart: null,
          plannedEnd: null,
          actualEnd: null,
          estimatedDays: null,
          headcount: null,
          priority: textOrNull(body.priority),
          deliverableTypes: [],
          note: null,
          onTime: null,
          changeLinks: [],
          version: 1,
          createdAt: stamp,
          updatedAt: stamp,
          files: [],
        };
        list.push(task);
        created.push(task);
      }
      return json({ created: created.map(taskView), skipped });
    }

    if (rest.length >= 2 && rest[0] === "tasks") {
      const taskId = decodeURIComponent(rest[1]);
      const list = db.tasksOf(project.id);
      const task = list.find((item) => item.id === taskId);
      if (task === undefined) {
        return fail(404, "TASK_NOT_FOUND", "任务不存在");
      }
      if (rest.length === 2 && method === "GET") {
        return json({ ...taskView(task), ownerNames: task.ownerIds.map((id) => db.userNameOf(id) ?? null), files: store.taskFilesOf(project.id, taskId) });
      }
      if (rest.length === 2 && method === "PATCH") {
        if (numberOrNull(body.version) !== task.version) {
          return fail(409, "VERSION_CONFLICT", "任务已被他人修改，请刷新后重试");
        }
        if (Array.isArray(body.ownerIds)) {
          task.ownerIds = stringList(body.ownerIds);
        }
        if (numberOrNull(body.sortIndex) !== null) {
          task.sortIndex = numberOrNull(body.sortIndex) as number;
        }
        if (typeof body.status === "string" && body.status !== "") {
          task.status = body.status;
          if (body.status === "done") {
            task.progress = 100;
            task.actualEnd = task.actualEnd ?? todayText();
          }
        }
        if ("plannedStart" in body) {
          task.plannedStart = textOrNull(body.plannedStart);
        }
        if ("plannedEnd" in body) {
          task.plannedEnd = textOrNull(body.plannedEnd);
        }
        if ("estimatedDays" in body) {
          task.estimatedDays = numberOrNull(body.estimatedDays);
        }
        if ("headcount" in body) {
          task.headcount = numberOrNull(body.headcount);
        }
        if ("priority" in body) {
          task.priority = textOrNull(body.priority);
        }
        if ("note" in body) {
          task.note = textOrNull(body.note);
        }
        if (Array.isArray(body.deliverableTypes)) {
          task.deliverableTypes = stringList(body.deliverableTypes);
        }
        if (task.status === "done" && task.plannedEnd !== null && task.actualEnd !== null) {
          task.onTime = task.actualEnd <= task.plannedEnd;
        }
        task.version += 1;
        task.updatedAt = new Date().toISOString();
        return json(taskView(task));
      }
      if (rest.length === 3 && rest[2] === "progress" && method === "PATCH") {
        if (numberOrNull(body.version) !== task.version) {
          return fail(409, "VERSION_CONFLICT", "任务已被他人修改，请刷新后重试");
        }
        const progress = numberOrNull(body.progress) ?? task.progress;
        task.progress = progress;
        if (progress >= 100) {
          task.status = "done";
          task.actualEnd = textOrNull(body.actualEnd) ?? todayText();
        } else if (progress > 0) {
          task.status = "active";
          task.actualEnd = null;
        } else {
          task.status = "pending";
          task.actualEnd = null;
        }
        if (textOrNull(body.note) !== null) {
          task.note = textOrNull(body.note);
        }
        task.version += 1;
        task.updatedAt = new Date().toISOString();
        return json(taskView(task));
      }
      if (rest.length === 2 && method === "DELETE") {
        const version = ifMatchVersion(init) ?? numberOrNull(body.version);
        if (version !== null && version !== task.version) {
          return fail(409, "VERSION_CONFLICT", "任务已被他人修改，请刷新后重试");
        }
        list.splice(list.indexOf(task), 1);
        return json({ id: task.id, deleted: true });
      }
    }
  }

  if (head === "api/v1/task-nodes") {
    if (method === "GET") {
      const stage = query.get("stage");
      const items = db.nodes.filter((node) => stage === null || node.stageKey === stage).sort((left, right) => left.seq - right.seq);
      return json({ items: items.map(nodeView), total: items.length });
    }
    if (method === "POST") {
      const stageKey = String(body.stageKey ?? "");
      const title = String(body.title ?? "").trim();
      if (db.nodes.some((node) => node.stageKey === stageKey && node.title === title)) {
        return fail(409, "NODE_ALREADY_EXISTS", "同阶段已有同名节点");
      }
      const stamp = new Date().toISOString();
      const created: DemoNode = {
        id: db.nextNodeId(stageKey),
        stageKey,
        seq: db.nodes.filter((node) => node.stageKey === stageKey).reduce((max, node) => Math.max(max, node.seq), 0) + 10,
        title,
        titleEn: textOrNull(body.titleEn),
        version: 1,
        createdAt: stamp,
        updatedAt: stamp,
      };
      db.nodes.push(created);
      return json(nodeView(created), 201);
    }
  }

  if (parts.length === 5 && head.startsWith("api/v1/task-nodes/")) {
    const node = db.nodes.find((item) => item.id === decodeURIComponent(parts[4]));
    if (node === undefined) {
      return fail(404, "NODE_NOT_FOUND", "节点不存在");
    }
    if (method === "PATCH") {
      if (numberOrNull(body.version) !== node.version) {
        return fail(409, "VERSION_CONFLICT", "节点已被他人修改，请刷新后重试");
      }
      if (typeof body.title === "string" && body.title.trim() !== "") {
        node.title = body.title.trim();
      }
      if ("titleEn" in body) {
        node.titleEn = textOrNull(body.titleEn);
      }
      node.version += 1;
      node.updatedAt = new Date().toISOString();
      return json(nodeView(node));
    }
    if (method === "DELETE") {
      const version = numberOrNull(body.version);
      if (version !== null && version !== node.version) {
        return fail(409, "VERSION_CONFLICT", "节点已被他人修改，请刷新后重试");
      }
      db.nodes.splice(db.nodes.indexOf(node), 1);
      return json({ id: node.id, deleted: true });
    }
  }

  if (head === "api/v1/task-templates") {
    if (method === "GET") {
      const stage = query.get("stage");
      const items = db.templates.filter((template) => stage === null || template.stageKey === stage);
      return json({ items: items.map(templateView), total: items.length });
    }
    if (method === "POST") {
      const stageKey = String(body.stageKey ?? "");
      const stamp = new Date().toISOString();
      const created: DemoTemplate = {
        id: db.nextTemplateId(stageKey),
        name: String(body.name ?? ""),
        stageKey,
        nodeIds: stringList(body.nodeIds),
        version: 1,
        createdAt: stamp,
        updatedAt: stamp,
      };
      db.templates.unshift(created);
      return json(templateView(created), 201);
    }
  }

  if (parts.length === 5 && head.startsWith("api/v1/task-templates/")) {
    const template = db.templates.find((item) => item.id === decodeURIComponent(parts[4]));
    if (template === undefined) {
      return fail(404, "TEMPLATE_NOT_FOUND", "任务模板不存在");
    }
    if (method === "PATCH") {
      if (numberOrNull(body.version) !== template.version) {
        return fail(409, "VERSION_CONFLICT", "模板已被他人修改，请刷新后重试");
      }
      if (typeof body.name === "string" && body.name.trim() !== "") {
        template.name = body.name.trim();
      }
      if (Array.isArray(body.nodeIds)) {
        template.nodeIds = stringList(body.nodeIds);
      }
      template.version += 1;
      template.updatedAt = new Date().toISOString();
      return json(templateView(template));
    }
    if (method === "DELETE") {
      const version = numberOrNull(body.version);
      if (version !== null && version !== template.version) {
        return fail(409, "VERSION_CONFLICT", "模板已被他人修改，请刷新后重试");
      }
      db.templates.splice(db.templates.indexOf(template), 1);
      return json({ id: template.id, deletedAt: new Date().toISOString() });
    }
  }

  const extra = demoRoute(method, parts, query, body);
  if (extra !== null) {
    return extra;
  }

  console.warn("[demo] 假后端未覆盖的请求：" + method + " " + url.pathname);
  return fail(404, "NOT_FOUND", "演示版未覆盖该接口：" + url.pathname);
}
