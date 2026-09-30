/**
 * 演示数据扩展（主仓 Push 195 之后新接的接口：文件库 / 日报与问题 / 干系人 / 工作台聚合）。
 * - 与 database.ts 同口径：确定性生成（同一项目每次一样）、只存浏览器内存、刷新即重置；
 * - 文件字节只在会话内存在：上传走 window.fetch 拦截（见 ./upload.ts），种子文件没有真实字节；
 * - 姓名一律虚构（生成器里的映射），联系电话 / 邮箱均为示例值。
 */
import * as db from "./database";

const DAY_MS = 86400000;

/** 稳定伪随机：同一文本 → 同一序列（与 database.ts 同算法）。 */
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

function pick(items: readonly string[], random: () => number): string {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

function dayText(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function isoText(ms: number): string {
  return new Date(ms).toISOString();
}

/** 演示用户画像：工作台「我的任务 / 我的问题」按人员目录第一位（王强）的口径聚合。 */
export const DEMO_PERSONA_ID = db.users[0].id;


/* ---------------- 文件库（文件 / 版本 / 上传） ---------------- */

export type DemoFile = {
  id: string;
  projectId: string;
  taskId: string | null;
  docType: string | null;
  name: string;
  status: string;
  mime: string | null;
  sizeBytes: number;
  seq: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  recycled: boolean;
  bytes: ArrayBuffer | null;
};

const filesByProject = new Map<string, Map<string, DemoFile>>();
const fileProject = new Map<string, string>();

/** 种子文件：把任务行上的成果文件摘要展开成文件库条目（没有真实字节）。 */
function seedProjectFiles(projectId: string): Map<string, DemoFile> {
  const existing = filesByProject.get(projectId);
  if (existing !== undefined) {
    return existing;
  }
  const table = new Map<string, DemoFile>();
  const project = db.projects.find((item) => item.id === projectId);
  if (project !== undefined) {
    const random = randomOf(projectId + "-files");
    for (const task of db.tasksOf(projectId)) {
      for (const brief of task.files) {
        table.set(brief.id, {
          id: brief.id,
          projectId,
          taskId: task.id,
          docType: brief.docType,
          name: brief.name,
          status: brief.status,
          mime: brief.name.endsWith(".pdf") ? "application/pdf" : null,
          sizeBytes: 120000 + Math.floor(random() * 2600000),
          seq: 1,
          version: 1,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          recycled: false,
          bytes: null,
        });
      }
    }
  }
  filesByProject.set(projectId, table);
  for (const file of table.values()) {
    fileProject.set(file.id, projectId);
  }
  return table;
}


/** 项目文件列表（默认最新在前；不含回收站）。 */
export function filesOf(projectId: string): DemoFile[] {
  return [...seedProjectFiles(projectId).values()].filter((file) => !file.recycled).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

/** 任务详情「文件」清单（与真机 GET /projects/{id}/tasks/{taskId} 的 files 同形）：从文件库按 taskId 取，
 *  这样本次会话里上传的文件在抽屉重取清单后立刻可见（种子文件缺少真实字节，预览给占位内容）。 */
export function taskFilesOf(projectId: string, taskId: string): Array<{ id: string; name: string; status: string; docType: string | null }> {
  return filesOf(projectId)
    .filter((file) => file.taskId === taskId)
    .map((file) => ({ id: file.id, name: file.name, status: file.status, docType: file.docType }));
}

export function fileById(fileId: string): DemoFile | undefined {
  const projectId = fileProject.get(fileId);
  if (projectId !== undefined) {
    return filesByProject.get(projectId)?.get(fileId);
  }
  return undefined;
}

let uploadSeq = 0;

/** 新建上传条目（intent=version）：先建元数据，字节由上传桥接在 complete 前塞进来。 */
export function createUploadFile(input: {
  projectId: string;
  taskId: string | null;
  name: string;
  mime: string | null;
  sizeBytes: number;
}): DemoFile {
  uploadSeq += 1;
  const now = isoText(Date.now());
  const file: DemoFile = {
    id: "up-" + String(Date.now()) + "-" + String(uploadSeq),
    projectId: input.projectId,
    taskId: input.taskId,
    docType: null,
    name: input.name,
    status: "draft",
    mime: input.mime,
    sizeBytes: input.sizeBytes,
    seq: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
    recycled: false,
    bytes: null,
  };
  seedProjectFiles(input.projectId).set(file.id, file);
  fileProject.set(file.id, input.projectId);
  return file;
}

/** 分片直传的落点：上传桥接（见 ./upload.ts）把 PUT 的字节暂存在这里，complete 时登记进文件。 */
const pendingBytes = new Map<string, ArrayBuffer>();

export function putUploadBytes(fileId: string, bytes: ArrayBuffer): void {
  pendingBytes.set(fileId, bytes);
}

/** 上传完成：登记字节 + 版本号（模拟对象存储直传后的落库）。 */
export function completeUpload(file: DemoFile, bytes: ArrayBuffer | null): void {
  const uploaded = pendingBytes.get(file.id);
  if (uploaded !== undefined) {
    bytes = uploaded;
    pendingBytes.delete(file.id);
  }
  file.bytes = bytes;
  file.seq += 1;
  file.updatedAt = isoText(Date.now());
}

/** 文件预览 / 下载用的浏览器地址：有真实字节用 Blob，种子文件给占位内容。 */
export function objectUrlOf(file: DemoFile): string {
  const blob = file.bytes === null ? placeholderBlob(file) : new Blob([file.bytes], { type: file.mime ?? "application/octet-stream" });
  return URL.createObjectURL(blob);
}

/** 图片种子文件给一张 SVG 占位图（缩略图 / 浮层预览都像样）；其它类型给一份说明文本。 */
function placeholderBlob(file: DemoFile): Blob {
  if ((file.mime ?? "").startsWith("image/") || /[.](png|jpe?g|gif|webp|svg|avif)$/i.test(file.name)) {
    const svg = [
      "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"200\" viewBox=\"0 0 320 200\">",
      "<rect width=\"320\" height=\"200\" fill=\"#e4e4e7\"/>",
      "<rect x=\"16\" y=\"16\" width=\"288\" height=\"168\" fill=\"#f4f4f5\" stroke=\"#d4d4d8\"/>",
      "<text x=\"160\" y=\"104\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"15\" fill=\"#52525b\">演示占位图</text>",
      "</svg>",
    ].join("");
    return new Blob([svg], { type: "image/svg+xml" });
  }
  const text = "演示环境：" + file.name + " 是示例数据，假后端里没有真实文件字节；上传的文件在本次会话内可以正常预览与下载。";
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}


/* ---------------- 日报与问题（A3） ---------------- */

export type DemoReport = {
  id: string;
  projectId: string;
  date: string;
  state: string;
  headcount: number | null;
  doneWork: string;
  plan: string | null;
  foundIssue: string | null;
  issueCategories: string[];
  suggestion: string | null;
  stageKeys: string[];
  authorName: string;
  submittedAt: string | null;
  createdAt: string;
  version: number;
  issueIds: string[];
};

export type DemoIssue = {
  id: string;
  projectId: string;
  taskId: string | null;
  title: string;
  categories: string[];
  state: string;
  reporterName: string;
  raisedAt: string;
  solution: string | null;
  sourceReportId: string | null;
  createdAt: string;
  version: number;
};

const ISSUE_CATEGORIES = ["机械部", "采购部", "规划部", "项目部", "物流原因", "供应商原因", "客户原因", "客观原因", "生产原因", "其它原因"];
const ISSUE_TITLES = ["现场电源容量与图纸不符，需重新确认配电方案", "到货包装有磕碰，待供应商补发配件", "客户临时调整输送线走向，等待确认版本", "雨季施工窗口紧张，需协调加班安装", "设备基础标高误差超差，需复测"];

const reportsByProject = new Map<string, DemoReport[]>();
const issuesByProject = new Map<string, DemoIssue[]>();


/** 日报种子：近几天各一篇（含一篇带「现场发现问题」→ 自动派生的问题），做过的活取项目里已完成的任务名。 */
function seedReports(projectId: string): { reports: DemoReport[]; issues: DemoIssue[] } {
  const cachedReports = reportsByProject.get(projectId);
  const cachedIssues = issuesByProject.get(projectId);
  if (cachedReports !== undefined && cachedIssues !== undefined) {
    return { reports: cachedReports, issues: cachedIssues };
  }
  const project = db.projects.find((item) => item.id === projectId);
  const reports: DemoReport[] = [];
  const issues: DemoIssue[] = [];
  if (project === undefined) {
    reportsByProject.set(projectId, reports);
    issuesByProject.set(projectId, issues);
    return { reports, issues };
  }
  const tasks = db.tasksOf(projectId);
  const random = randomOf(projectId + "-reports");
  const author = project.managerNames.filter((name): name is string => name !== null)[0] ?? "演示用户";
  const doneTitles = tasks.filter((task) => task.status === "done").map((task) => task.title);
  const stageKeys = [...new Set(tasks.filter((task) => task.status !== "pending").map((task) => task.stageKey).filter((key): key is string => key !== null))].slice(0, 2);
  const offsets = [1, 3, 6];
  offsets.forEach((offset, index) => {
    const dayMs = Date.now() - offset * DAY_MS;
    const date = dayText(dayMs);
    const done = doneTitles.length === 0 ? "现场勘查与资料准备" : doneTitles[(index * 3 + 1) % doneTitles.length];
    const second = doneTitles.length === 0 ? "现场安全巡查" : doneTitles[(index * 5 + 2) % doneTitles.length];
    const hasIssue = index === 0;
    const report: DemoReport = {
      id: "rp-" + projectId + "-" + String(index + 1),
      projectId,
      date,
      state: index === 2 ? "draft" : "submitted",
      headcount: 3 + Math.floor(random() * 8),
      doneWork: done + "；" + second + "（演示数据）",
      plan: pick(["继续按计划推进当前阶段任务，材料到场后进行下一道工序", "明日复测安装尺寸并提交阶段验收资料", "跟进供应商到货情况，安排现场交接"], random),
      foundIssue: hasIssue ? pick(ISSUE_TITLES, random) : null,
      issueCategories: hasIssue ? [pick(ISSUE_CATEGORIES, random)] : [],
      suggestion: hasIssue ? "已同步项目经理与供应商，按现场实际情况调整排期" : null,
      stageKeys,
      authorName: author,
      submittedAt: index === 2 ? null : isoText(dayMs + 10 * 3600000),
      createdAt: isoText(dayMs + 9 * 3600000),
      version: 1,
      issueIds: [],
    };
    if (hasIssue) {
      const issue: DemoIssue = {
        id: "is-" + projectId + "-1",
        projectId,
        taskId: tasks[Math.min(tasks.length - 1, 2)]?.id ?? null,
        title: report.foundIssue ?? "现场问题",
        categories: [...report.issueCategories],
        state: "open",
        reporterName: author,
        raisedAt: date,
        solution: null,
        sourceReportId: report.id,
        createdAt: report.createdAt,
        version: 1,
      };
      report.issueIds.push(issue.id);
      issues.push(issue);
    }
    reports.push(report);
  });
  const extra: DemoIssue = {
    id: "is-" + projectId + "-2",
    projectId,
    taskId: tasks[Math.min(tasks.length - 1, 5)]?.id ?? null,
    title: pick(ISSUE_TITLES, random),
    categories: [pick(ISSUE_CATEGORIES, random)],
    state: "in_progress",
    reporterName: project.managerNames.filter((name): name is string => name !== null)[1] ?? author,
    raisedAt: dayText(Date.now() - 4 * DAY_MS),
    solution: "已安排现场整改，等待复检",
    sourceReportId: null,
    createdAt: isoText(Date.now() - 4 * DAY_MS),
    version: 1,
  };
  issues.push(extra);
  reportsByProject.set(projectId, reports);
  issuesByProject.set(projectId, issues);
  return { reports, issues };
}

export function reportsOf(projectId: string): DemoReport[] {
  return seedReports(projectId).reports;
}

export function issuesOf(projectId: string): DemoIssue[] {
  return seedReports(projectId).issues;
}


export function reportById(projectId: string, reportId: string): DemoReport | undefined {
  return reportsOf(projectId).find((report) => report.id === reportId);
}

export function issueById(projectId: string, issueId: string): DemoIssue | undefined {
  return issuesOf(projectId).find((issue) => issue.id === issueId);
}

/** 日报列表视图（契约 DailyReport 子集；补填状态由日期推导）。 */
export function reportView(report: DemoReport) {
  return {
    id: report.id,
    date: report.date,
    state: report.state === "submitted" && report.date < dayText(Date.now() - DAY_MS) ? "supplement" : report.state,
    headcount: report.headcount,
    doneWork: report.doneWork,
    plan: report.plan,
    foundIssue: report.foundIssue,
    issueCategories: [...report.issueCategories],
    suggestion: report.suggestion,
    stageKeys: [...report.stageKeys],
    photos: [],
    issuePhotos: [],
    authorName: report.authorName,
    submittedAt: report.submittedAt,
    createdAt: report.createdAt,
    version: report.version,
  };
}

export function issueView(issue: DemoIssue) {
  return {
    id: issue.id,
    title: issue.title,
    categories: [...issue.categories],
    state: issue.state,
    reporterName: issue.reporterName,
    raisedAt: issue.raisedAt,
    solution: issue.solution,
    photos: [],
    sourceReportId: issue.sourceReportId,
    createdAt: issue.createdAt,
    version: issue.version,
  };
}

export function createReport(projectId: string, input: Record<string, unknown>): DemoReport {
  const now = new Date();
  const report: DemoReport = {
    id: "rp-" + projectId + "-x" + String(now.getTime() % 1000000),
    projectId,
    date: String(input.date ?? dayText(Date.now())),
    state: input.state === "draft" ? "draft" : "submitted",
    headcount: typeof input.headcount === "number" ? input.headcount : null,
    doneWork: String(input.doneWork ?? ""),
    plan: input.plan === undefined || input.plan === null ? null : String(input.plan),
    foundIssue: input.foundIssue === undefined || input.foundIssue === null || input.foundIssue === "" ? null : String(input.foundIssue),
    issueCategories: Array.isArray(input.issueCategories) ? input.issueCategories.map((item) => String(item)) : [],
    suggestion: input.suggestion === undefined || input.suggestion === null ? null : String(input.suggestion),
    stageKeys: Array.isArray(input.stageKeys) ? input.stageKeys.map((item) => String(item)) : [],
    authorName: "演示用户",
    submittedAt: input.state === "draft" ? null : now.toISOString(),
    createdAt: now.toISOString(),
    version: 1,
    issueIds: [],
  };
  if (report.foundIssue !== null && report.state !== "draft") {
    const issue: DemoIssue = {
      id: "is-" + projectId + "-x" + String(now.getTime() % 1000000),
      projectId,
      taskId: null,
      title: report.foundIssue,
      categories: report.issueCategories.length === 0 ? [ISSUE_CATEGORIES[ISSUE_CATEGORIES.length - 1]] : [...report.issueCategories],
      state: "open",
      reporterName: "演示用户",
      raisedAt: report.date,
      solution: null,
      sourceReportId: report.id,
      createdAt: now.toISOString(),
      version: 1,
    };
    report.issueIds.push(issue.id);
    issuesOf(projectId).push(issue);
  }
  reportsOf(projectId).push(report);
  return report;
}


export function deleteReport(projectId: string, reportId: string): string[] {
  const reports = reportsOf(projectId);
  const index = reports.findIndex((report) => report.id === reportId);
  if (index < 0) {
    return [];
  }
  const [removed] = reports.splice(index, 1);
  const issues = issuesOf(projectId);
  const cascaded = issues.filter((issue) => issue.sourceReportId === reportId).map((issue) => issue.id);
  for (const issueId of cascaded) {
    const issueIndex = issues.findIndex((issue) => issue.id === issueId);
    if (issueIndex >= 0) {
      issues.splice(issueIndex, 1);
    }
  }
  if (removed !== undefined) {
    for (const issueId of cascaded) {
      removed.issueIds = removed.issueIds.filter((id) => id !== issueId);
    }
  }
  return cascaded;
}

export function deleteIssue(projectId: string, issueId: string): { cascadedReportId: string | null; cascadedIssueIds: string[] } {
  const issues = issuesOf(projectId);
  const index = issues.findIndex((issue) => issue.id === issueId);
  if (index < 0) {
    return { cascadedReportId: null, cascadedIssueIds: [] };
  }
  const [removed] = issues.splice(index, 1);
  let cascadedReportId: string | null = null;
  const cascadedIssueIds: string[] = [];
  if (removed !== undefined && removed.sourceReportId !== null) {
    cascadedReportId = removed.sourceReportId;
    const reports = reportsOf(projectId);
    const reportIndex = reports.findIndex((report) => report.id === removed.sourceReportId);
    if (reportIndex >= 0) {
      reports.splice(reportIndex, 1);
    }
  }
  return { cascadedReportId, cascadedIssueIds };
}

/* ---------------- 干系人（A5） ---------------- */

export type DemoStakeholder = {
  id: string;
  name: string;
  companyType: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  wechat: string | null;
  email: string | null;
  remark: string | null;
  role: string | null;
  createdByName: string | null;
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
};

const STAKEHOLDER_NAMES = ["陈立", "林悦", "周航", "许晨", "高远", "何静", "罗强", "蒋涛", "沈岩", "唐宁", "范宇", "邓佳"];
const COMPANY_TYPES = ["libiao", "supplier", "general_contractor", "customer"];
const COMPANY_SUFFIX: Record<string, string[]> = {
  libiao: ["立镖机器人"],
  supplier: ["海川机电", "恒立传动", "精工钣金", "联信电控"],
  general_contractor: ["中建安装", "城建总包", "华东建工"],
  customer: ["北欧物流集团", "莱茵供应链", "星洲仓储"],
};
const STAKEHOLDER_TITLES = ["现场负责人", "采购经理", "电气工程师", "项目经理", "技术总监", "仓储运营主管"];

const stakeholders: DemoStakeholder[] = [];


/** 干系人种子：12 位（虚构姓名 + 示例联系方式），按确定性规则挂到前 30 个项目上。 */
export function seedStakeholders(): void {
  if (stakeholders.length > 0) {
    return;
  }
  const random = randomOf("stakeholders");
  const projects = db.projects.slice(0, 30);
  STAKEHOLDER_NAMES.forEach((name, index) => {
    const companyType = COMPANY_TYPES[index % COMPANY_TYPES.length];
    const companies = COMPANY_SUFFIX[companyType];
    const linked: string[] = [];
    const linkCount = 1 + Math.floor(random() * 3);
    for (let step = 0; step < linkCount; step += 1) {
      const project = projects[Math.floor(random() * projects.length)];
      if (project !== undefined && !linked.includes(project.id)) {
        linked.push(project.id);
      }
    }
    const createdAt = isoText(Date.now() - (index + 3) * DAY_MS);
    stakeholders.push({
      id: "sh-" + String(index + 1).padStart(2, "0"),
      name,
      companyType,
      company: companies[index % companies.length],
      title: STAKEHOLDER_TITLES[index % STAKEHOLDER_TITLES.length],
      phone: "138-0000-" + String(1000 + index).slice(1),
      wechat: "wx-demo-" + String(index + 1).padStart(2, "0"),
      email: "demo" + String(index + 1) + "@example.com",
      remark: index % 4 === 0 ? "演示台账条目（虚构信息）" : null,
      role: STAKEHOLDER_TITLES[(index + 2) % STAKEHOLDER_TITLES.length],
      createdByName: "演示用户",
      projectIds: linked,
      createdAt,
      updatedAt: isoText(Date.now() - index * 3 * 3600000),
    });
  });
}

export function stakeholderView(item: DemoStakeholder) {
  return {
    id: item.id,
    name: item.name,
    companyType: item.companyType,
    company: item.company,
    title: item.title,
    phone: item.phone,
    wechat: item.wechat,
    email: item.email,
    remark: item.remark,
    role: item.role,
    createdBy: null,
    createdByName: item.createdByName,
    projects: item.projectIds
      .map((projectId) => db.projects.find((project) => project.id === projectId))
      .filter((project): project is NonNullable<typeof project> => project !== undefined)
      .map((project) => ({ id: project.id, code: project.code, name: project.name })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function stakeholderList(): DemoStakeholder[] {
  seedStakeholders();
  return stakeholders;
}

export function stakeholderById(id: string): DemoStakeholder | undefined {
  seedStakeholders();
  return stakeholders.find((item) => item.id === id);
}

export function createStakeholder(input: Record<string, unknown>): DemoStakeholder {
  seedStakeholders();
  const now = isoText(Date.now());
  const text = (value: unknown): string | null => (value === undefined || value === null || value === "" ? null : String(value));
  const item: DemoStakeholder = {
    id: "sh-x" + String(Date.now() % 1000000),
    name: String(input.name ?? "未命名"),
    companyType: String(input.companyType ?? "customer"),
    company: text(input.company),
    title: text(input.title),
    phone: text(input.phone),
    wechat: text(input.wechat),
    email: text(input.email),
    remark: text(input.remark),
    role: text(input.role),
    createdByName: "演示用户",
    projectIds: Array.isArray(input.projectIds) ? input.projectIds.map((value) => String(value)) : [],
    createdAt: now,
    updatedAt: now,
  };
  stakeholders.unshift(item);
  return item;
}


export function updateStakeholder(item: DemoStakeholder, patch: Record<string, unknown>): void {
  const keys = ["name", "companyType", "company", "title", "phone", "wechat", "email", "remark", "role"] as const;
  for (const key of keys) {
    if (!(key in patch)) {
      continue;
    }
    const value = patch[key];
    if (value === null) {
      (item as unknown as Record<string, unknown>)[key] = key === "name" || key === "companyType" ? (item as unknown as Record<string, unknown>)[key] : null;
      continue;
    }
    (item as unknown as Record<string, unknown>)[key] = String(value);
  }
  item.updatedAt = isoText(Date.now());
}

export function deleteStakeholder(id: string): boolean {
  seedStakeholders();
  const index = stakeholders.findIndex((item) => item.id === id);
  if (index < 0) {
    return false;
  }
  stakeholders.splice(index, 1);
  return true;
}

/* ---------------- 工作台（A6-01 / A6-03） ---------------- */

const WORKSPACE_GROUP_CAP = 40;

/** 工作台聚合：演示口径 = 会话用户视作人员目录第一位（王强，见 DEMO_PERSONA_ID）。
 *  任务命中条件与真机一致（2026-09-30 复评）：负责人含我 或 所属项目的项目经理含我、且任务未完成；
 *  分组按预计完成日期：今天 / 未来 / 已逾期 / 未排期。演示数据量大，每组截前 40 条（真机不截）。 */
export function workspace() {
  const me = DEMO_PERSONA_ID;
  const myName = db.userNameOf(me) ?? "演示用户";
  const today = dayText(Date.now());
  const groups: Record<string, unknown[]> = { today: [], upcoming: [], overdue: [], unscheduled: [] };
  for (const project of db.projects) {
    const isMyProject = project.managerIds.includes(me);
    for (const task of db.tasksOf(project.id)) {
      if (task.status === "done" || task.displayStatus === "done" || task.displayStatus === "early_done") {
        continue;
      }
      if (!isMyProject && !task.ownerIds.includes(me)) {
        continue;
      }
      const group = task.plannedEnd === null ? "unscheduled" : task.plannedEnd < today ? "overdue" : task.plannedEnd === today ? "today" : "upcoming";
      if (groups[group].length >= WORKSPACE_GROUP_CAP) {
        continue;
      }
      groups[group].push({
        id: task.id,
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
        stageKey: task.stageKey,
        title: task.title,
        titleEn: task.titleEn,
        displayStatus: task.displayStatus,
        progress: task.progress,
        plannedStart: task.plannedStart,
        plannedEnd: task.plannedEnd,
        actualEnd: task.actualEnd,
        ownerIds: [...task.ownerIds],
        ownerNames: task.ownerIds.map((id) => db.userNameOf(id) ?? null),
        priority: task.priority,
      });
    }
  }
  const handling: unknown[] = [];
  const raised: unknown[] = [];
  for (const project of db.projects) {
    for (const issue of issuesOf(project.id)) {
      const item = {
        id: issue.id,
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
        taskId: issue.taskId,
        title: issue.title,
        categories: [...issue.categories],
        state: issue.state,
        reporterId: me,
        reporterName: issue.reporterName,
        ownerDepartment: null,
        ownerId: issue.state === "done" ? null : me,
        ownerName: issue.state === "done" ? null : myName,
        raisedAt: issue.raisedAt,
        updatedAt: issue.createdAt,
        version: issue.version,
      };
      if (raised.length < WORKSPACE_GROUP_CAP) {
        raised.push(item);
      }
      if (issue.state !== "done" && handling.length < WORKSPACE_GROUP_CAP) {
        handling.push(item);
      }
    }
  }
  return { today, myTasks: groups, myIssues: { handling, raised } };
}

