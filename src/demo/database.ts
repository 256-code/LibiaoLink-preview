/**
 * 演示数据（纯前端假后端的数据底座）。
 * - 项目 / 地区 / 字典 / 节点 / 模板来自主仓 database/seeds，由 preview/build-demo-data.mjs 生成为 data.generated.json；
 * - 任务、文件、变更关联按「项目当前阶段 + 状态」确定性推导（同一项目每次相同），只存在浏览器内存里，刷新即重置；
 * - 演示姓名一律虚构（用户名 → 姓名映射见生成器的 MANAGER_NAMES），不出现真实姓名。
 */
import { generated } from "./data.generated";

export type DemoUser = {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  status: string;
};

export type DemoDictItem = {
  code: string;
  name: string;
  sort: number;
  enabled: boolean;
  metadata: Record<string, unknown>;
};

export type DemoProject = {
  id: string;
  code: string;
  seqNo: number;
  name: string;
  customer: string | null;
  region: string;
  projectType: string;
  managerIds: string[];
  managerNames: Array<string | null>;
  stageKey: string;
  status: string;
  description: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type DemoTaskFile = { id: string; name: string; status: string; docType: string | null };

export type DemoTask = {
  id: string;
  projectId: string;
  stageKey: string | null;
  sortIndex: number;
  nodeId: string | null;
  sourceNodeId: string | null;
  title: string;
  titleEn: string | null;
  ownerIds: string[];
  status: string;
  displayStatus: string;
  progress: number;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualEnd: string | null;
  estimatedDays: number | null;
  headcount: number | null;
  priority: string | null;
  deliverableTypes: string[];
  note: string | null;
  onTime: boolean | null;
  changeLinks: Array<{ id: string; reason: string | null; appliedAt: string }>;
  version: number;
  createdAt: string;
  updatedAt: string;
  files: DemoTaskFile[];
};

export type DemoNode = {
  id: string;
  stageKey: string;
  seq: number;
  title: string;
  titleEn: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type DemoTemplate = {
  id: string;
  name: string;
  stageKey: string;
  nodeIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type DemoPreferences = {
  taskTableHiddenColumns: string[];
  homeSavedFilters: unknown[];
  focusMode: boolean;
  workspaceOpenProjects: { tasks: string[]; raised: string[] };
  updatedAt: string | null;
};

const DAY_MS = 86400000;
const MINUTE_MS = 60000;

export const STAGE_ORDER: string[] = generated.stages.map((stage) => stage.key);
export const STAGE_NAMES: Record<string, string> = Object.fromEntries(generated.stages.map((stage) => [stage.key, stage.name]));
export const PERMISSION_KEYS: string[] = generated.permissionKeys;

/** 稳定伪随机：同一文本 → 同一序列（演示数据每次刷新长得一样）。 */
function hashText(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619) >>> 0;
  }
  return value === 0 ? 1 : value;
}

function randomOf(seedText: string): () => number {
  let seed = hashText(seedText);
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

/** 毫秒 → YYYY-MM-DD（任务日期口径：客户端 cnDateFromIso 只认这种格式）。 */
function dayText(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export const users: DemoUser[] = generated.users.map((user, index) => ({
  id: "u-" + String(index + 1).padStart(2, "0"),
  username: user.username,
  displayName: user.displayName,
  email: user.username + "@libiaolink.invalid",
  status: "active",
}));

const userByName = new Map(users.map((user) => [user.username, user]));
const userNameById = new Map(users.map((user) => [user.id, user.displayName]));

/** 负责人 / 经理姓名解析（写响应不带姓名时客户端按目录兜底）。 */
export function userNameOf(id: string): string | undefined {
  return userNameById.get(id);
}

const baseMs = Date.now();

export const projects: DemoProject[] = generated.projects.map((project, index) => {
  const createdAtMs = baseMs - index * 3 * MINUTE_MS;
  const managerIds = project.managers.map((username) => userByName.get(username)?.id ?? users[0].id);
  return {
    id: project.code.toLowerCase(),
    code: project.code,
    seqNo: index + 1,
    name: project.name,
    customer: null,
    region: project.region,
    projectType: project.projectType,
    managerIds,
    managerNames: managerIds.map((id) => userNameById.get(id) ?? null),
    stageKey: project.stageKey,
    status: project.status,
    description: null,
    version: 1,
    createdAt: new Date(createdAtMs).toISOString(),
    updatedAt: new Date(createdAtMs + 30 * MINUTE_MS).toISOString(),
  };
});

export const dictItems: { region: DemoDictItem[]; projectType: DemoDictItem[] } = {
  region: generated.regions.map((item) => ({ code: item.code, name: item.name, sort: item.sort, enabled: true, metadata: {} })),
  projectType: generated.projectTypes.map((item) => ({
    code: item.code,
    name: item.name,
    sort: item.sort,
    enabled: true,
    metadata: item.metadata as Record<string, unknown>,
  })),
};

export const nodes: DemoNode[] = generated.stageNodes.flatMap((group) =>
  group.nodes.map((node) => ({
    id: "n-" + group.stageKey + "-" + String(node.seq),
    stageKey: group.stageKey,
    seq: node.seq,
    title: node.title,
    titleEn: node.titleEn,
    version: 1,
    createdAt: new Date(baseMs).toISOString(),
    updatedAt: new Date(baseMs).toISOString(),
  })),
);

const nodeIdOf = new Map(nodes.map((node) => [node.stageKey + "|" + node.title, node.id]));

export const templates: DemoTemplate[] = generated.stageTemplates.flatMap((group, groupIndex) =>
  group.templates.map((template, templateIndex) => ({
    id: "tp-" + group.stageKey + "-" + String(templateIndex + 1),
    name: template.name,
    stageKey: group.stageKey,
    nodeIds: template.nodes.map((title) => nodeIdOf.get(group.stageKey + "|" + title)).filter((id): id is string => id !== undefined),
    version: 1,
    createdAt: new Date(baseMs - (groupIndex * 10 + templateIndex + 1) * 1000).toISOString(),
    updatedAt: new Date(baseMs - (groupIndex * 10 + templateIndex + 1) * 1000).toISOString(),
  })),
);

export const preferences: DemoPreferences = {
  taskTableHiddenColumns: [],
  homeSavedFilters: [],
  focusMode: false,
  workspaceOpenProjects: { tasks: [], raised: [] },
  updatedAt: null,
};

const DOC_TYPES = ["图纸", "物料清单", "作业指导书", "测试报告", "验收报告", "质保书"];
const PRIORITIES = ["高", "中", "中", "低"];
const CHANGE_REASONS = ["客户变更", "现场条件调整", "设计优化", "供应商交期"];
const FILE_KINDS = ["图纸", "清单", "方案", "报告"];

function buildTask(project: DemoProject, stageKey: string, node: { title: string; titleEn: string | null; seq: number }, stageIndex: number, nodeIndex: number, stageCount: number, sortIndex: number, random: () => number): DemoTask {
  const createdMs = Date.parse(project.createdAt);
  const stageStartMs = createdMs + stageIndex * 14 * DAY_MS;
  const startMs = stageStartMs + nodeIndex * 2 * DAY_MS;
  const estimatedDays = 3 + Math.floor(random() * 7);
  const endMs = startMs + (estimatedDays - 1) * DAY_MS;
  const currentStageIndex = Math.max(0, STAGE_ORDER.indexOf(project.stageKey));
  let status = "pending";
  let progress = 0;
  let actualEnd: string | null = null;
  if (project.status === "done" || stageIndex < currentStageIndex) {
    status = "done";
    progress = 100;
    actualEnd = dayText(endMs - (random() < 0.25 ? DAY_MS : 0));
  } else if (stageIndex === currentStageIndex) {
    const doneRatio = project.status === "paused" ? 0.25 : 0.6;
    const doneCount = Math.floor(stageCount * doneRatio * 100) / 100;
    if (nodeIndex + 1 <= doneCount) {
      status = "done";
      progress = 100;
      actualEnd = dayText(endMs - (random() < 0.25 ? DAY_MS : 0));
    } else if (nodeIndex === Math.ceil(doneCount)) {
      status = "active";
      progress = pick([25, 50, 75], random);
    }
  }
  const todayMs = Date.now();
  let displayStatus = status;
  if (status !== "done" && endMs < todayMs) {
    displayStatus = "overdue";
  }
  if (status === "done" && actualEnd !== null && Date.parse(actualEnd + "T00:00:00Z") < endMs) {
    displayStatus = "early_done";
  }
  const ownerCount = 1 + Math.floor(random() * 2);
  const ownerIds: string[] = [];
  for (let index = 0; index < ownerCount; index += 1) {
    const candidate = users[(nodeIndex + index * 3 + stageIndex) % users.length].id;
    if (!ownerIds.includes(candidate)) {
      ownerIds.push(candidate);
    }
  }
  const fileCount = status === "pending" ? Math.floor(random() * 2) : Math.floor(random() * 3) + 1;
  const files: DemoTaskFile[] = [];
  for (let index = 0; index < fileCount; index += 1) {
    files.push({
      id: "f-" + project.id + "-" + stageKey + "-" + String(node.seq) + "-" + String(index + 1),
      name: node.title + "-" + FILE_KINDS[index % FILE_KINDS.length] + "-v" + String(index + 1) + ".pdf",
      status: index === 0 && status === "done" ? "final" : "draft",
      docType: DOC_TYPES[index % DOC_TYPES.length],
    });
  }
  const changeCount = status === "done" && random() < 0.3 ? 1 : 0;
  const changeLinks = [];
  for (let index = 0; index < changeCount; index += 1) {
    changeLinks.push({
      id: "ch-" + project.id + "-" + stageKey + "-" + String(node.seq),
      reason: pick(CHANGE_REASONS, random),
      appliedAt: new Date(startMs + DAY_MS).toISOString(),
    });
  }
  const deliverableCount = Math.floor(random() * 3);
  const deliverableTypes: string[] = [];
  for (let index = 0; index < deliverableCount; index += 1) {
    const candidate = DOC_TYPES[(nodeIndex + index) % DOC_TYPES.length];
    if (!deliverableTypes.includes(candidate)) {
      deliverableTypes.push(candidate);
    }
  }
  return {
    id: "t-" + project.id + "-" + String(sortIndex + 1).padStart(2, "0"),
    projectId: project.id,
    stageKey,
    sortIndex: (sortIndex + 1) * 10,
    nodeId: "n-" + stageKey + "-" + String(node.seq),
    sourceNodeId: "n-" + stageKey + "-" + String(node.seq),
    title: node.title,
    titleEn: node.titleEn,
    ownerIds,
    status,
    displayStatus,
    progress,
    plannedStart: dayText(startMs),
    plannedEnd: dayText(endMs),
    actualEnd,
    estimatedDays,
    headcount: 1 + Math.floor(random() * 5),
    priority: pick(PRIORITIES, random),
    deliverableTypes,
    note: status === "active" && random() < 0.5 ? "现场已开工，等待验收资料" : null,
    onTime: status === "done" && actualEnd !== null ? actualEnd <= dayText(endMs) : null,
    changeLinks,
    version: 1,
    createdAt: new Date(startMs).toISOString(),
    updatedAt: new Date(Math.min(Date.now(), endMs)).toISOString(),
    files,
  };
}

const taskCache = new Map<string, DemoTask[]>();

/** 某个项目的任务（懒生成 + 缓存）：按项目当前阶段推进，前面的阶段全完成、后面的阶段待开始。 */
export function tasksOf(projectId: string): DemoTask[] {
  const cached = taskCache.get(projectId);
  if (cached !== undefined) {
    return cached;
  }
  const project = projects.find((item) => item.id === projectId);
  if (project === undefined) {
    return [];
  }
  const random = randomOf(project.id);
  const list: DemoTask[] = [];
  STAGE_ORDER.forEach((stageKey, stageIndex) => {
    const group = generated.stageNodes.find((item) => item.stageKey === stageKey);
    if (group === undefined) {
      return;
    }
    group.nodes.forEach((node, nodeIndex) => {
      list.push(buildTask(project, stageKey, node, stageIndex, nodeIndex, group.nodes.length, list.length, random));
    });
  });
  taskCache.set(projectId, list);
  return list;
}

export function setTasks(projectId: string, list: DemoTask[]): void {
  taskCache.set(projectId, list);
}

export function nextTaskId(projectId: string): string {
  const list = tasksOf(projectId);
  return "t-" + projectId + "-x" + String(list.length + 1) + "-" + String(Date.now() % 100000);
}

export function nextNodeId(stageKey: string): string {
  return "n-" + stageKey + "-x" + String(Date.now() % 100000);
}

export function nextTemplateId(stageKey: string): string {
  return "tp-" + stageKey + "-x" + String(Date.now() % 100000);
}
