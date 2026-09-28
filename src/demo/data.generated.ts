/** 生成物：由 preview/build-demo-data.mjs 生成，请勿手改（改主仓种子后重跑生成器）。 */
export type GeneratedData = {
  regions: Array<{ code: string; name: string; sort: number }>;
  projectTypes: Array<{ code: string; name: string; sort: number; metadata: Record<string, unknown> }>;
  users: Array<{ username: string; displayName: string }>;
  projects: Array<{
    code: string;
    name: string;
    region: string;
    projectType: string;
    stageKey: string;
    status: string;
    managers: string[];
  }>;
  stages: Array<{ key: string; name: string }>;
  stageNodes: Array<{ stageKey: string; nodes: Array<{ title: string; titleEn: string | null; seq: number }> }>;
  stageTemplates: Array<{ stageKey: string; templates: Array<{ name: string; nodes: string[] }> }>;
  permissionKeys: string[];
};

export const generated: GeneratedData = {
  "regions": [
    {
      "code": "华东",
      "name": "华东",
      "sort": 10
    },
    {
      "code": "华北",
      "name": "华北",
      "sort": 20
    },
    {
      "code": "华南",
      "name": "华南",
      "sort": 30
    },
    {
      "code": "华中",
      "name": "华中",
      "sort": 40
    },
    {
      "code": "西南",
      "name": "西南",
      "sort": 50
    },
    {
      "code": "西北",
      "name": "西北",
      "sort": 60
    },
    {
      "code": "东北",
      "name": "东北",
      "sort": 70
    },
    {
      "code": "海外",
      "name": "海外",
      "sort": 80
    },
    {
      "code": "英国",
      "name": "英国",
      "sort": 90
    },
    {
      "code": "美国",
      "name": "美国",
      "sort": 100
    },
    {
      "code": "中国",
      "name": "中国",
      "sort": 110
    },
    {
      "code": "希腊",
      "name": "希腊",
      "sort": 120
    },
    {
      "code": "法国",
      "name": "法国",
      "sort": 130
    },
    {
      "code": "韩国",
      "name": "韩国",
      "sort": 140
    },
    {
      "code": "日本",
      "name": "日本",
      "sort": 150
    },
    {
      "code": "澳大利亚",
      "name": "澳大利亚",
      "sort": 160
    },
    {
      "code": "俄罗斯",
      "name": "俄罗斯",
      "sort": 170
    },
    {
      "code": "波兰",
      "name": "波兰",
      "sort": 180
    },
    {
      "code": "德国",
      "name": "德国",
      "sort": 190
    },
    {
      "code": "荷兰",
      "name": "荷兰",
      "sort": 200
    },
    {
      "code": "西班牙",
      "name": "西班牙",
      "sort": 210
    },
    {
      "code": "意大利",
      "name": "意大利",
      "sort": 220
    },
    {
      "code": "比利时",
      "name": "比利时",
      "sort": 230
    },
    {
      "code": "匈牙利",
      "name": "匈牙利",
      "sort": 240
    },
    {
      "code": "罗马尼亚",
      "name": "罗马尼亚",
      "sort": 250
    },
    {
      "code": "塞尔维亚",
      "name": "塞尔维亚",
      "sort": 260
    },
    {
      "code": "捷克",
      "name": "捷克",
      "sort": 270
    },
    {
      "code": "立陶宛",
      "name": "立陶宛",
      "sort": 280
    },
    {
      "code": "拉脱维亚",
      "name": "拉脱维亚",
      "sort": 290
    },
    {
      "code": "爱沙尼亚",
      "name": "爱沙尼亚",
      "sort": 300
    },
    {
      "code": "乌克兰",
      "name": "乌克兰",
      "sort": 310
    },
    {
      "code": "土耳其",
      "name": "土耳其",
      "sort": 320
    },
    {
      "code": "以色列",
      "name": "以色列",
      "sort": 330
    },
    {
      "code": "沙特阿拉伯",
      "name": "沙特阿拉伯",
      "sort": 340
    },
    {
      "code": "阿联酋",
      "name": "阿拉伯联合酋长国",
      "sort": 350
    },
    {
      "code": "卡塔尔",
      "name": "卡塔尔",
      "sort": 360
    },
    {
      "code": "印度",
      "name": "印度",
      "sort": 370
    },
    {
      "code": "泰国",
      "name": "泰国",
      "sort": 380
    },
    {
      "code": "越南",
      "name": "越南",
      "sort": 390
    },
    {
      "code": "马来西亚",
      "name": "马来西亚",
      "sort": 400
    },
    {
      "code": "印度尼西亚",
      "name": "印度尼西亚",
      "sort": 410
    },
    {
      "code": "新西兰",
      "name": "新西兰",
      "sort": 420
    },
    {
      "code": "加拿大",
      "name": "加拿大",
      "sort": 430
    },
    {
      "code": "哥伦比亚",
      "name": "哥伦比亚",
      "sort": 440
    },
    {
      "code": "秘鲁",
      "name": "秘鲁",
      "sort": 450
    },
    {
      "code": "巴西",
      "name": "巴西",
      "sort": 460
    },
    {
      "code": "阿根廷",
      "name": "阿根廷",
      "sort": 470
    },
    {
      "code": "乌拉圭",
      "name": "乌拉圭",
      "sort": 480
    },
    {
      "code": "南非",
      "name": "南非",
      "sort": 490
    }
  ],
  "projectTypes": [
    {
      "code": "T-sort",
      "name": "T-sort",
      "sort": 10,
      "metadata": {
        "accent": "#3b82f6",
        "accentText": "#ffffff"
      }
    },
    {
      "code": "3D分拣",
      "name": "3D分拣",
      "sort": 20,
      "metadata": {
        "accent": "#10b981",
        "accentText": "#ffffff"
      }
    },
    {
      "code": "飞箱",
      "name": "飞箱",
      "sort": 30,
      "metadata": {
        "accent": "#feca04",
        "accentText": "#313033"
      }
    }
  ],
  "users": [
    {
      "username": "lan",
      "displayName": "王强"
    },
    {
      "username": "panxing",
      "displayName": "张伟"
    },
    {
      "username": "shaochenyu",
      "displayName": "刘洋"
    },
    {
      "username": "wmj",
      "displayName": "李娜"
    },
    {
      "username": "xulinjie",
      "displayName": "徐林杰"
    },
    {
      "username": "yicaonan",
      "displayName": "曹楠"
    },
    {
      "username": "yuhong",
      "displayName": "于宏"
    }
  ],
  "projects": [
    {
      "code": "LBDE-20260924-001",
      "name": "德国汉堡分拣中心",
      "region": "德国",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBDE-20260924-002",
      "name": "德国展厅",
      "region": "德国",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBDE-20260924-003",
      "name": "德国不来梅仓配中心",
      "region": "德国",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "paused",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBNL-20260924-001",
      "name": "荷兰鹿特丹分拨中心",
      "region": "荷兰",
      "projectType": "T-sort",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBNL-20260924-002",
      "name": "荷兰电商仓",
      "region": "荷兰",
      "projectType": "飞箱",
      "stageKey": "acceptance",
      "status": "done",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBFR-20260924-001",
      "name": "法国巴黎分拣中心",
      "region": "法国",
      "projectType": "3D分拣",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBFR-20260924-002",
      "name": "法国里昂仓配",
      "region": "法国",
      "projectType": "T-sort",
      "stageKey": "acceptance",
      "status": "done",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBES-20260924-001",
      "name": "西班牙马德里分拣中心",
      "region": "西班牙",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBES-20260924-002",
      "name": "西班牙巴塞罗那仓",
      "region": "西班牙",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBIT-20260924-001",
      "name": "意大利米兰分拣中心",
      "region": "意大利",
      "projectType": "飞箱",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBIT-20260924-002",
      "name": "意大利罗马仓配",
      "region": "意大利",
      "projectType": "T-sort",
      "stageKey": "acceptance",
      "status": "done",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBBE-20260924-001",
      "name": "比利时安特卫普分拨中心",
      "region": "比利时",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBHU-20260924-001",
      "name": "匈牙利布达佩斯仓配",
      "region": "匈牙利",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBRO-20260924-001",
      "name": "罗马尼亚布加勒斯特分拣线",
      "region": "罗马尼亚",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBRS-20260924-001",
      "name": "塞尔维亚贝尔格莱德仓配",
      "region": "塞尔维亚",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "paused",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBCZ-20260924-001",
      "name": "捷克布拉格分拣中心",
      "region": "捷克",
      "projectType": "3D分拣",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBLT-20260924-001",
      "name": "立陶宛维尔纽斯仓配",
      "region": "立陶宛",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBLV-20260924-001",
      "name": "拉脱维亚里加分拣线",
      "region": "拉脱维亚",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBEE-20260924-001",
      "name": "爱沙尼亚塔林仓配",
      "region": "爱沙尼亚",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBUA-20260924-001",
      "name": "乌克兰基辅分拨中心",
      "region": "乌克兰",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "paused",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBTR-20260924-001",
      "name": "土耳其伊斯坦布尔分拣中心",
      "region": "土耳其",
      "projectType": "3D分拣",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBTR-20260924-002",
      "name": "土耳其安卡拉仓配",
      "region": "土耳其",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBIL-20260924-001",
      "name": "以色列特拉维夫分拣线",
      "region": "以色列",
      "projectType": "飞箱",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBSA-20260924-001",
      "name": "沙特利雅得分拨中心",
      "region": "沙特阿拉伯",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBAE-20260924-001",
      "name": "阿联酋迪拜分拣中心",
      "region": "阿联酋",
      "projectType": "3D分拣",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBAE-20260924-002",
      "name": "阿联酋阿布扎比仓",
      "region": "阿联酋",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "done",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBQA-20260924-001",
      "name": "卡塔尔多哈分拨中心",
      "region": "卡塔尔",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "paused",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBIN-20260924-001",
      "name": "印度孟买分拣中心",
      "region": "印度",
      "projectType": "T-sort",
      "stageKey": "production",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBIN-20260924-002",
      "name": "印度班加罗尔仓配",
      "region": "印度",
      "projectType": "3D分拣",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBIN-20260924-003",
      "name": "印度德里分拨中心",
      "region": "印度",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBTH-20260924-001",
      "name": "泰国曼谷分拣中心",
      "region": "泰国",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBTH-20260924-002",
      "name": "泰国罗勇仓配",
      "region": "泰国",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBVN-20260924-001",
      "name": "越南胡志明分拣中心",
      "region": "越南",
      "projectType": "3D分拣",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBVN-20260924-002",
      "name": "越南河内仓配",
      "region": "越南",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBMY-20260924-001",
      "name": "马来西亚吉隆坡分拨中心",
      "region": "马来西亚",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBMY-20260924-002",
      "name": "马来西亚槟城仓",
      "region": "马来西亚",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBID-20260924-001",
      "name": "印尼雅加达分拣中心",
      "region": "印度尼西亚",
      "projectType": "3D分拣",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBID-20260924-002",
      "name": "印尼泗水仓配",
      "region": "印度尼西亚",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBNZ-20260924-001",
      "name": "新西兰奥克兰分拨中心",
      "region": "新西兰",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBCA-20260924-001",
      "name": "加拿大温哥华分拣中心",
      "region": "加拿大",
      "projectType": "3D分拣",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBCA-20260924-002",
      "name": "加拿大多伦多仓",
      "region": "加拿大",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBCO-20260924-001",
      "name": "哥伦比亚波哥大仓配",
      "region": "哥伦比亚",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "paused",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBPE-20260924-001",
      "name": "秘鲁利马分拨中心",
      "region": "秘鲁",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBBR-20260924-001",
      "name": "巴西圣保罗分拣中心",
      "region": "巴西",
      "projectType": "T-sort",
      "stageKey": "production",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBBR-20260924-002",
      "name": "巴西里约仓配",
      "region": "巴西",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBBR-20260924-003",
      "name": "巴西玛瑙斯分拨中心",
      "region": "巴西",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "archived",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBAR-20260924-001",
      "name": "阿根廷布宜诺斯艾利斯仓配",
      "region": "阿根廷",
      "projectType": "T-sort",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBAR-20260924-002",
      "name": "阿根廷罗萨里奥分拣线",
      "region": "阿根廷",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "paused",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBUY-20260924-001",
      "name": "乌拉圭蒙得维的亚分拨中心",
      "region": "乌拉圭",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBZA-20260924-001",
      "name": "南非约翰内斯堡分拣中心",
      "region": "南非",
      "projectType": "3D分拣",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBZA-20260924-002",
      "name": "南非开普敦仓配",
      "region": "南非",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBGR-20260924-001",
      "name": "希腊雅典分拨中心",
      "region": "希腊",
      "projectType": "T-sort",
      "stageKey": "production",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBRU-20260924-001",
      "name": "俄罗斯莫斯科仓配",
      "region": "俄罗斯",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "paused",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBKR-20260924-001",
      "name": "韩国首尔分拣中心",
      "region": "韩国",
      "projectType": "T-sort",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBKR-20260924-002",
      "name": "韩国釜山仓配",
      "region": "韩国",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBJP-20260924-001",
      "name": "日本东京分拣中心",
      "region": "日本",
      "projectType": "3D分拣",
      "stageKey": "production",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBJP-20260924-002",
      "name": "日本大阪仓配",
      "region": "日本",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBAU-20260924-001",
      "name": "澳大利亚悉尼分拣中心",
      "region": "澳大利亚",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBAU-20260924-002",
      "name": "澳大利亚墨尔本仓",
      "region": "澳大利亚",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBCN-20260924-001",
      "name": "上海分拨中心",
      "region": "中国",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBCN-20260924-002",
      "name": "深圳电商仓",
      "region": "中国",
      "projectType": "飞箱",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBUS-20260924-001",
      "name": "美国洛杉矶分拣中心",
      "region": "美国",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBUS-20260924-002",
      "name": "美国新泽西仓配",
      "region": "美国",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan",
        "shaochenyu"
      ]
    },
    {
      "code": "LBCN-20260924-101",
      "name": "中国广州分拨中心",
      "region": "中国",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBCN-20260924-102",
      "name": "中国成都仓配",
      "region": "中国",
      "projectType": "飞箱",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBCN-20260924-103",
      "name": "中国武汉分拣线",
      "region": "中国",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBUS-20260924-101",
      "name": "美国芝加哥分拣中心",
      "region": "美国",
      "projectType": "T-sort",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBUS-20260924-102",
      "name": "美国达拉斯仓配",
      "region": "美国",
      "projectType": "3D分拣",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBUS-20260924-103",
      "name": "美国亚特兰大分拨中心",
      "region": "美国",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBUS-20260924-104",
      "name": "美国西雅图仓",
      "region": "美国",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBIN-20260924-101",
      "name": "印度金奈仓配",
      "region": "印度",
      "projectType": "T-sort",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBIN-20260924-102",
      "name": "印度海得拉巴分拨中心",
      "region": "印度",
      "projectType": "3D分拣",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBIN-20260924-103",
      "name": "印度浦那分拣线",
      "region": "印度",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "paused",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBDE-20260924-101",
      "name": "德国慕尼黑仓配",
      "region": "德国",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBDE-20260924-102",
      "name": "德国法兰克福分拨中心",
      "region": "德国",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBBR-20260924-101",
      "name": "巴西巴西利亚仓配",
      "region": "巴西",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBBR-20260924-102",
      "name": "巴西萨尔瓦多分拣线",
      "region": "巴西",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBGB-20260924-101",
      "name": "英国伯明翰仓配",
      "region": "英国",
      "projectType": "T-sort",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBGB-20260924-102",
      "name": "英国曼彻斯特分拨中心",
      "region": "英国",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "done",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBJP-20260924-101",
      "name": "日本名古屋仓配",
      "region": "日本",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBJP-20260924-102",
      "name": "日本福冈分拨中心",
      "region": "日本",
      "projectType": "飞箱",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBFR-20260924-101",
      "name": "法国马赛仓配",
      "region": "法国",
      "projectType": "3D分拣",
      "stageKey": "install",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBFR-20260924-102",
      "name": "法国图卢兹分拣线",
      "region": "法国",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBKR-20260924-101",
      "name": "韩国仁川仓配",
      "region": "韩国",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBKR-20260924-102",
      "name": "韩国大邱分拨中心",
      "region": "韩国",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBIT-20260924-101",
      "name": "意大利都灵仓配",
      "region": "意大利",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBAU-20260924-101",
      "name": "澳大利亚布里斯班仓配",
      "region": "澳大利亚",
      "projectType": "3D分拣",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBCA-20260924-101",
      "name": "加拿大卡尔加里分拨中心",
      "region": "加拿大",
      "projectType": "T-sort",
      "stageKey": "trial",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBTH-20260924-101",
      "name": "泰国清迈仓配",
      "region": "泰国",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBVN-20260924-101",
      "name": "越南岘港分拨中心",
      "region": "越南",
      "projectType": "T-sort",
      "stageKey": "deploy",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBES-20260924-101",
      "name": "西班牙瓦伦西亚仓配",
      "region": "西班牙",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "yuhong"
      ]
    },
    {
      "code": "LBNL-20260924-101",
      "name": "荷兰海牙分拣线",
      "region": "荷兰",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "yicaonan",
        "xulinjie"
      ]
    },
    {
      "code": "LBAE-20260924-101",
      "name": "阿联酋沙迦仓配",
      "region": "阿联酋",
      "projectType": "飞箱",
      "stageKey": "design",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBRU-20260924-101",
      "name": "俄罗斯圣彼得堡分拨中心",
      "region": "俄罗斯",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBPL-20260924-101",
      "name": "波兰华沙分拨中心",
      "region": "波兰",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "shaochenyu"
      ]
    },
    {
      "code": "LBUA-20260924-101",
      "name": "乌克兰利沃夫仓配",
      "region": "乌克兰",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBGR-20260924-101",
      "name": "希腊塞萨洛尼基仓配",
      "region": "希腊",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    },
    {
      "code": "LBSA-20260924-101",
      "name": "沙特勒雅得分拨中心",
      "region": "沙特阿拉伯",
      "projectType": "3D分拣",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "lan"
      ]
    },
    {
      "code": "LBNZ-20260924-101",
      "name": "新西兰基督城仓配",
      "region": "新西兰",
      "projectType": "T-sort",
      "stageKey": "presale",
      "status": "done",
      "managers": [
        "panxing"
      ]
    },
    {
      "code": "LBPE-20260924-101",
      "name": "秘鲁阿雷基帕分拣线",
      "region": "秘鲁",
      "projectType": "飞箱",
      "stageKey": "presale",
      "status": "active",
      "managers": [
        "wmj"
      ]
    }
  ],
  "stages": [
    {
      "key": "presale",
      "name": "售前规划"
    },
    {
      "key": "design",
      "name": "设计开发"
    },
    {
      "key": "purchase",
      "name": "加工采购"
    },
    {
      "key": "assembly",
      "name": "组装发货"
    },
    {
      "key": "install",
      "name": "硬件实施"
    },
    {
      "key": "deploy",
      "name": "软件部署"
    },
    {
      "key": "trial",
      "name": "试运行"
    },
    {
      "key": "production",
      "name": "生产阶段"
    },
    {
      "key": "acceptance",
      "name": "验收"
    }
  ],
  "stageNodes": [
    {
      "stageKey": "presale",
      "nodes": [
        {
          "title": "布局定档",
          "titleEn": "Layout scheduling",
          "seq": 10
        },
        {
          "title": "技术协议定档",
          "titleEn": "Technical agreement finalization",
          "seq": 20
        },
        {
          "title": "合同签署",
          "titleEn": "Contract signing",
          "seq": 30
        },
        {
          "title": "项目启动",
          "titleEn": "Project Startup",
          "seq": 40
        }
      ]
    },
    {
      "stageKey": "design",
      "nodes": [
        {
          "title": "规划设计",
          "titleEn": "planning design",
          "seq": 10
        },
        {
          "title": "机械设计",
          "titleEn": "Mechanical design",
          "seq": 20
        },
        {
          "title": "软件开发",
          "titleEn": "Software",
          "seq": 30
        },
        {
          "title": "硬件研发",
          "titleEn": "Hardware R&D",
          "seq": 40
        },
        {
          "title": "物料清单完整版",
          "titleEn": null,
          "seq": 50
        }
      ]
    },
    {
      "stageKey": "purchase",
      "nodes": [
        {
          "title": "订单录入",
          "titleEn": "Order entry",
          "seq": 10
        },
        {
          "title": "采购",
          "titleEn": "Procurement",
          "seq": 20
        },
        {
          "title": "到货入库",
          "titleEn": "Goods arrival and warehousing",
          "seq": 30
        }
      ]
    },
    {
      "stageKey": "assembly",
      "nodes": [
        {
          "title": "生产",
          "titleEn": "Production",
          "seq": 10
        },
        {
          "title": "质检",
          "titleEn": "Quality inspection",
          "seq": 20
        },
        {
          "title": "包装",
          "titleEn": "Packing",
          "seq": 30
        },
        {
          "title": "运输",
          "titleEn": "Transportation",
          "seq": 40
        },
        {
          "title": "清关",
          "titleEn": "Customs clearance",
          "seq": 50
        },
        {
          "title": "送仓",
          "titleEn": "Deliver to warehouse",
          "seq": 60
        }
      ]
    },
    {
      "stageKey": "install",
      "nodes": [
        {
          "title": "人员进场、场地检查、施工对接",
          "titleEn": "Personnel entry, site inspection, construction docking",
          "seq": 10
        },
        {
          "title": "施工安全培训",
          "titleEn": "Construction Safety Training",
          "seq": 20
        },
        {
          "title": "物料转运、清点分类",
          "titleEn": "Material transfer, inventory and classification",
          "seq": 30
        },
        {
          "title": "货架组装",
          "titleEn": "Shelf Assembly",
          "seq": 40
        },
        {
          "title": "货架检查",
          "titleEn": "Shelf inspection",
          "seq": 50
        },
        {
          "title": "挂件安装",
          "titleEn": "Pendant Installation",
          "seq": 60
        },
        {
          "title": "巷道导轨安装，铜丝镶嵌",
          "titleEn": "Tunnel rail installation, copper wire inlay",
          "seq": 70
        },
        {
          "title": "飞箱机器安装",
          "titleEn": "Air Robot installed",
          "seq": 80
        },
        {
          "title": "强弱电布线、接线，服务器机柜安装及理线",
          "titleEn": "Power and weak current wiring and connectionsServer cabinet installation and cable management",
          "seq": 90
        },
        {
          "title": "工作站安装及定位弹线",
          "titleEn": "Workstation Installation and Positioning Chalk Line",
          "seq": 100
        },
        {
          "title": "飞箱电控箱及AP安装",
          "titleEn": "AirRobot electric control cabinet and AP installation",
          "seq": 110
        },
        {
          "title": "货架条码黏贴",
          "titleEn": "Shelf barcode labeling",
          "seq": 120
        },
        {
          "title": "接驳位弹线及魔毯黏贴，充电桩组装",
          "titleEn": "Docking position marking and magic carpet sticking, charging pile assembly",
          "seq": 130
        },
        {
          "title": "导航柱弹线及安装",
          "titleEn": "Guide post marking and installation",
          "seq": 140
        },
        {
          "title": "第一批空箱上架",
          "titleEn": "The first batch of empty boxes is on the shelves",
          "seq": 150
        },
        {
          "title": "安全围栏安装及调试",
          "titleEn": "Safety Fence Installation and Commissioning",
          "seq": 160
        },
        {
          "title": "第二批空箱上架",
          "titleEn": "The second batch of empty boxes is on the shelves",
          "seq": 170
        },
        {
          "title": "第三批空箱上架",
          "titleEn": "The third batch of empty boxes is on the shelves",
          "seq": 180
        },
        {
          "title": "桌面平台搭建、魔毯铺设",
          "titleEn": "Installation of the platform and carpet",
          "seq": 190
        },
        {
          "title": "站人台、扫描架、称及附属硬件安装",
          "titleEn": "Installation of the scanning frame, scale and auxiliary hardware",
          "seq": 200
        },
        {
          "title": "格口滑槽（或挂包架）安装",
          "titleEn": "Installation of the compartment chute (or bag rack)",
          "seq": 210
        },
        {
          "title": "传感器、按钮盒安装理线",
          "titleEn": "Installation of the sensors and control boxes, cabling",
          "seq": 220
        },
        {
          "title": "强弱电布线",
          "titleEn": "Network and electric wiring",
          "seq": 230
        },
        {
          "title": "扫码台及机柜理线",
          "titleEn": "Induction stations and cabinets cabling",
          "seq": 240
        },
        {
          "title": "防护围栏安装",
          "titleEn": "Installation of Safety Barriers",
          "seq": 250
        },
        {
          "title": "验收交付",
          "titleEn": "Acceptance",
          "seq": 260
        }
      ]
    },
    {
      "stageKey": "deploy",
      "nodes": [
        {
          "title": "通电测试、参数设定",
          "titleEn": "Power-on test and parameter setting",
          "seq": 10
        },
        {
          "title": "RCS、WES软件部署调试，随机跑",
          "titleEn": "RCS, WES software deployment and commissioning, random run",
          "seq": 20
        },
        {
          "title": "按钮盒注册、传感器调节",
          "titleEn": "Control boxes registration, sensor adjustment",
          "seq": 30
        },
        {
          "title": "与WMS联调",
          "titleEn": "Combined with WMS",
          "seq": 40
        }
      ]
    },
    {
      "stageKey": "trial",
      "nodes": [
        {
          "title": "小批量实物测试",
          "titleEn": "Small batch of physical test",
          "seq": 10
        },
        {
          "title": "客户培训、上线",
          "titleEn": "Customer training, go alive",
          "seq": 20
        }
      ]
    },
    {
      "stageKey": "production",
      "nodes": [
        {
          "title": "产能爬坡",
          "titleEn": "Capacity climbing",
          "seq": 10
        }
      ]
    },
    {
      "stageKey": "acceptance",
      "nodes": [
        {
          "title": "验收交付",
          "titleEn": "Acceptance",
          "seq": 10
        }
      ]
    }
  ],
  "stageTemplates": [
    {
      "stageKey": "presale",
      "templates": [
        {
          "name": "售前规划模板",
          "nodes": [
            "布局定档",
            "技术协议定档",
            "合同签署",
            "项目启动"
          ]
        }
      ]
    },
    {
      "stageKey": "design",
      "templates": [
        {
          "name": "设计开发模板",
          "nodes": [
            "规划设计",
            "机械设计",
            "软件开发",
            "硬件研发",
            "物料清单完整版"
          ]
        }
      ]
    },
    {
      "stageKey": "purchase",
      "templates": [
        {
          "name": "加工采购模板",
          "nodes": [
            "订单录入",
            "采购",
            "到货入库"
          ]
        }
      ]
    },
    {
      "stageKey": "assembly",
      "templates": [
        {
          "name": "组装发货模板",
          "nodes": [
            "生产",
            "质检",
            "包装",
            "运输",
            "清关",
            "送仓"
          ]
        }
      ]
    },
    {
      "stageKey": "install",
      "templates": [
        {
          "name": "硬件实施模板一",
          "nodes": [
            "人员进场、场地检查、施工对接",
            "施工安全培训",
            "物料转运、清点分类",
            "货架组装",
            "货架检查",
            "挂件安装",
            "巷道导轨安装，铜丝镶嵌",
            "飞箱机器安装",
            "强弱电布线、接线，服务器机柜安装及理线",
            "工作站安装及定位弹线",
            "飞箱电控箱及AP安装",
            "货架条码黏贴",
            "接驳位弹线及魔毯黏贴，充电桩组装",
            "导航柱弹线及安装",
            "第一批空箱上架",
            "安全围栏安装及调试",
            "第二批空箱上架",
            "第三批空箱上架"
          ]
        },
        {
          "name": "硬件实施模板二",
          "nodes": [
            "人员进场、场地检查、施工对接",
            "施工安全培训",
            "物料转运、清点分类",
            "桌面平台搭建、魔毯铺设",
            "站人台、扫描架、称及附属硬件安装",
            "格口滑槽（或挂包架）安装",
            "传感器、按钮盒安装理线",
            "强弱电布线",
            "扫码台及机柜理线",
            "防护围栏安装",
            "验收交付"
          ]
        }
      ]
    },
    {
      "stageKey": "deploy",
      "templates": [
        {
          "name": "软件部署模板",
          "nodes": [
            "通电测试、参数设定",
            "RCS、WES软件部署调试，随机跑",
            "按钮盒注册、传感器调节",
            "与WMS联调"
          ]
        }
      ]
    },
    {
      "stageKey": "trial",
      "templates": [
        {
          "name": "试运行模板",
          "nodes": [
            "小批量实物测试",
            "客户培训、上线"
          ]
        }
      ]
    },
    {
      "stageKey": "production",
      "templates": [
        {
          "name": "生产阶段模板",
          "nodes": [
            "产能爬坡"
          ]
        }
      ]
    },
    {
      "stageKey": "acceptance",
      "templates": [
        {
          "name": "验收模板",
          "nodes": [
            "验收交付"
          ]
        }
      ]
    }
  ],
  "permissionKeys": [
    "audit.view",
    "blueprint.manage",
    "blueprint.view",
    "calendar.manage",
    "dict.manage",
    "file.download",
    "file.upload",
    "issue.manage",
    "issue.view",
    "member.manage",
    "member.view",
    "node.advance",
    "node.complete",
    "node.create",
    "node.delete",
    "node.rollback",
    "node.view",
    "project.archive",
    "project.create",
    "project.delete",
    "project.export",
    "project.update",
    "project.view",
    "report.fill",
    "report.view",
    "stakeholder.manage",
    "stakeholder.view",
    "task.create",
    "task.progress",
    "task.update",
    "task.view"
  ]
};
