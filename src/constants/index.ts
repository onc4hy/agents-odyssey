// 文件路径: src/constants/index.ts
// 全局常量定义 - 智能体奥德赛项目

import { PlatformType, PlatformRegion, ScoreWeights, AgentType } from '@/types';

// ==================== 应用常量 ====================

/**
 * 应用名称
 */
export const APP_NAME = '智能体奥德赛';

/**
 * 应用英文名称
 */
export const APP_NAME_EN = 'Agents-Odyssey';

/**
 * 应用版本
 */
export const APP_VERSION = '0.1.0';

/**
 * 本地存储前缀
 */
export const STORAGE_PREFIX = 'agents-odyssey';

/**
 * IndexedDB 数据库名称
 */
export const INDEXEDDB_NAME = 'agents-odyssey-db';

/**
 * IndexedDB 版本号
 */
export const INDEXEDDB_VERSION = 1;

// ==================== 平台相关常量 ====================

/**
 * 国内主流智能体平台列表
 */
export const DOMESTIC_PLATFORMS: { key: PlatformType; name: string; region: PlatformRegion }[] = [
  { key: PlatformType.COZE, name: '扣子 Coze', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.DIFY, name: 'Dify', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.WENXIN, name: '百度文心智能体', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.BAILIAN, name: '阿里云百炼', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.YUANQI, name: '腾讯元器', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.TBOX, name: '阿里 Tbox 百宝箱', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.PANGU, name: '华为盘古智能体', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.SHIZAI, name: '实在智能', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.ZHIYU, name: '360 智语 Agent', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.AGENTAR, name: '蚂蚁数科 Agentar', region: PlatformRegion.DOMESTIC },
  { key: PlatformType.XINGHUO, name: '讯飞星火智能体平台', region: PlatformRegion.DOMESTIC }
];

/**
 * 海外主流智能体/工作流平台列表
 */
export const OVERSEAS_PLATFORMS: { key: PlatformType; name: string; region: PlatformRegion }[] = [
  { key: PlatformType.POE, name: 'Poe (Quora)', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.N8N, name: 'n8n', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.LANGCHAIN, name: 'LangChain', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.LANGGRAPH, name: 'LangGraph', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.AUTOGEN, name: '微软 AutoGen', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.COPILOT_STUDIO, name: 'Microsoft Copilot Studio', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.AZURE_AI_FOUNDRY, name: 'Azure AI Foundry', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.OPENAI_AGENTKIT, name: 'OpenAI AgentKit', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.AGENTGPT, name: 'AgentGPT', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.SUPERAGENT, name: 'SuperAgent', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.VOICEFLOW, name: 'Voiceflow', region: PlatformRegion.OVERSEAS },
  { key: PlatformType.POSTMAN_AI, name: 'Postman AI Agent Builder', region: PlatformRegion.OVERSEAS }
];

/**
 * 全量平台列表
 */
export const ALL_PLATFORMS = [...DOMESTIC_PLATFORMS, ...OVERSEAS_PLATFORMS];

// ==================== 导航相关常量 ====================

/**
 * 一级导航菜单
 */
export const PRIMARY_NAV_ITEMS = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'agents', label: '主智能体', path: '/agents' },
  { key: 'platforms', label: '分身平台', path: '/platforms' },
  { key: 'collect', label: '分身数据回收', path: '/platforms/collect' },
  { key: 'iterations', label: '主迭代中心', path: '/iterations' },
  { key: 'settings', label: '设置', path: '/settings' }
];

/**
 * 智能体平台左侧导航菜单 - 三级结构
 * 主智能体广场 → 提示词智能体/工作流智能体
 */
export const AGENTS_SIDEBAR_NAV = [
  {
    key: 'agent-square',
    title: '主智能体广场',
    children: [
      {
        key: 'prompt-agents',
        title: '提示词智能体',
        children: [
          { key: 'prompt-list', title: '全部智能体' },
          { key: 'prompt-create', title: '新建智能体' }
        ]
      },
      {
        key: 'workflow-agents',
        title: '工作流智能体',
        children: [
          { key: 'workflow-list', title: '全部工作流' },
          { key: 'workflow-create', title: '新建工作流' }
        ]
      }
    ]
  }
];

/**
 * 平台管理左侧导航菜单 - 按国内/海外分类
 */
export const PLATFORMS_SIDEBAR_NAV = [
  {
    key: 'platforms',
    title: '分身平台',
    children: [
      {
        key: 'domestic-platforms',
        title: '国内分身平台',
        children: [
          { key: 'platform-all-domestic', title: '全部国内平台' },
          { key: 'avatar-deploy-domestic', title: '国内分身部署' },
          { key: 'deployment-record-domestic', title: '国内部署记录' }
        ]
      },
      {
        key: 'overseas-platforms',
        title: '海外分身平台',
        children: [
          { key: 'platform-all-overseas', title: '全部海外平台' },
          { key: 'avatar-deploy-overseas', title: '海外分身部署' },
          { key: 'deployment-record-overseas', title: '海外部署记录' }
        ]
      }
    ]
  }
];

// ==================== 评分权重常量 ====================

/**
 * 默认量化评分权重
 * 六大维度加权总和为 100%
 */
export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  contentQuality: 30,
  taskSuccessRate: 25,
  executionSpeed: 15,
  resourceEfficiency: 10,
  promptAccuracy: 10,
  workflowStability: 10
};

// ==================== 数据库表名常量 ====================

/**
 * IndexedDB 存储对象名称
 */
export const DB_STORES = {
  AGENTS: 'agents',
  PLATFORMS: 'platforms',
  DEPLOYMENT_RECORDS: 'deployment_records',
  ADAPTATION_RULES: 'adaptation_rules',
  COLLECTION_RECORDS: 'collection_records',
  ITERATION_RECORDS: 'iteration_records',
  CONTENT_SELECTIONS: 'content_selections',
  QUALITY_SAMPLES: 'quality_samples',
  USERS: 'users',
  SYNC_LOGS: 'sync_logs',
  INDEX_CACHE: 'index_cache',
  SYNC_QUEUE: 'sync_queue'
} as const;

// ==================== 智能体默认值 ====================

/**
 * 默认提示词配置
 */
export const DEFAULT_PROMPT_CONFIG = {
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2048,
  model: 'gpt-4'
};

/**
 * 默认工作流配置
 */
export const DEFAULT_WORKFLOW_CONFIG = {
  nodes: [],
  edges: [],
  variables: {}
};

// ==================== 分页常量 ====================

/**
 * 默认分页参数
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10
};

/**
 * 最大分页大小
 */
export const MAX_PAGE_SIZE = 100;

// ==================== 同步相关常量 ====================

/**
 * 同步重试最大次数
 */
export const MAX_SYNC_RETRIES = 5;

/**
 * 同步重试间隔（毫秒）
 */
export const SYNC_RETRY_INTERVAL = 30000;

/**
 * 智能体类型标签映射
 */
export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  [AgentType.PROMPT]: '提示词型',
  [AgentType.WORKFLOW]: '工作流型'
};
