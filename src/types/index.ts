// 文件路径: src/types/index.ts
// 全局类型定义 - 智能体奥德赛项目核心数据结构

// ==================== 枚举定义 ====================

/**
 * 智能体类型枚举
 */
export enum AgentType {
  /** 提示词型智能体 */
  PROMPT = 'prompt',
  /** 工作流型智能体 */
  WORKFLOW = 'workflow'
}

/**
 * 第三方平台类型枚举
 */
export enum PlatformType {
  // 国内平台
  COZE = 'coze',
  DIFY = 'dify',
  WENXIN = 'wenxin',
  BAILIAN = 'bailian',
  YUANQI = 'yuanqi',
  TBOX = 'tbox',
  PANGU = 'pangu',
  SHIZAI = 'shizai',
  ZHIYU = 'zhiyu',
  AGENTAR = 'agentar',
  XINGHUO = 'xinghuo',
  // 海外平台
  POE = 'poe',
  N8N = 'n8n',
  LANGCHAIN = 'langchain',
  LANGGRAPH = 'langgraph',
  AUTOGEN = 'autogen',
  COPILOT_STUDIO = 'copilot_studio',
  AZURE_AI_FOUNDRY = 'azure_ai_foundry',
  OPENAI_AGENTKIT = 'openai_agentkit',
  AGENTGPT = 'agentgpt',
  SUPERAGENT = 'superagent',
  VOICEFLOW = 'voiceflow',
  POSTMAN_AI = 'postman_ai'
}

/**
 * 平台区域枚举
 */
export enum PlatformRegion {
  /** 国内 */
  DOMESTIC = 'domestic',
  /** 海外 */
  OVERSEAS = 'overseas'
}

/**
 * 分身部署状态枚举
 */
export enum DeploymentStatus {
  /** 待部署 */
  PENDING = 'pending',
  /** 部署中 */
  DEPLOYING = 'deploying',
  /** 已部署 */
  DEPLOYED = 'deployed',
  /** 部署失败 */
  FAILED = 'failed',
  /** 已下线 */
  OFFLINE = 'offline'
}

/**
 * 适配状态枚举
 */
export enum AdaptationStatus {
  /** 未适配 */
  NOT_ADAPTED = 'not_adapted',
  /** 适配中 */
  ADAPTING = 'adapting',
  /** 已适配 */
  ADAPTED = 'adapted',
  /** 部分适配 */
  PARTIALLY_ADAPTED = 'partially_adapted',
  /** 适配失败 */
  FAILED = 'failed'
}

/**
 * 数据回收状态枚举
 */
export enum CollectionStatus {
  /** 待回收 */
  PENDING = 'pending',
  /** 回收中 */
  COLLECTING = 'collecting',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 失败 */
  FAILED = 'failed'
}

/**
 * 迭代状态枚举
 */
export enum IterationStatus {
  /** 待迭代 */
  PENDING = 'pending',
  /** 迭代中 */
  ITERATING = 'iterating',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已回滚 */
  ROLLED_BACK = 'rolled_back'
}

/**
 * 在线状态枚举
 */
export enum OnlineStatus {
  /** 在线 */
  ONLINE = 'online',
  /** 离线 */
  OFFLINE = 'offline',
  /** 同步中 */
  SYNCING = 'syncing'
}

// ==================== 基础实体类型 ====================

/**
 * 基础实体接口
 * 所有数据库表的公共字段
 */
export interface BaseEntity {
  /** 主键 ID */
  id: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 扩展字段（JSON） */
  ext?: Record<string, unknown>;
}

// ==================== 智能体相关类型 ====================

/**
 * 提示词配置接口
 */
export interface PromptConfig {
  /** 系统提示词 */
  systemPrompt: string;
  /** 用户提示词模板 */
  userPromptTemplate?: string;
  /** 人设描述 */
  persona?: string;
  /** 输出规则 */
  outputRules?: string[];
  /** 温度参数 */
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 模型名称 */
  model?: string;
}

/**
 * 工作流节点类型枚举
 */
export enum WorkflowNodeType {
  START = 'start',
  END = 'end',
  LLM = 'llm',
  CONDITION = 'condition',
  LOOP = 'loop',
  DATA_TRANSFORM = 'data_transform',
  HTTP_REQUEST = 'http_request',
  CODE = 'code',
  VARIABLE = 'variable',
  KNOWLEDGE = 'knowledge'
}

/**
 * 工作流节点接口
 */
export interface WorkflowNode {
  /** 节点 ID */
  id: string;
  /** 节点类型 */
  type: WorkflowNodeType;
  /** 节点名称 */
  name: string;
  /** 节点配置 */
  config: Record<string, unknown>;
  /** 节点位置（用于可视化编辑） */
  position?: {
    x: number;
    y: number;
  };
  /** 输入连接 */
  inputs?: string[];
  /** 输出连接 */
  outputs?: string[];
}

/**
 * 工作流连接边接口
 */
export interface WorkflowEdge {
  /** 边 ID */
  id: string;
  /** 源节点 ID */
  source: string;
  /** 目标节点 ID */
  target: string;
  /** 源输出端口 */
  sourceHandle?: string;
  /** 目标输入端口 */
  targetHandle?: string;
}

/**
 * 工作流配置接口
 */
export interface WorkflowConfig {
  /** 节点列表 */
  nodes: WorkflowNode[];
  /** 边列表 */
  edges: WorkflowEdge[];
  /** 变量定义 */
  variables?: Record<string, string>;
  /** 触发器配置 */
  trigger?: Record<string, unknown>;
}

/**
 * 智能体接口
 */
export interface Agent extends BaseEntity {
  /** 智能体名称 */
  name: string;
  /** 智能体描述 */
  description?: string;
  /** 智能体类型 */
  type: AgentType;
  /** 提示词配置（提示词型） */
  promptConfig?: PromptConfig;
  /** 工作流配置（工作流型） */
  workflowConfig?: WorkflowConfig;
  /** 当前版本号 */
  version: string;
  /** 迭代次数 */
  iterationCount: number;
  /** 综合量化得分 */
  overallScore?: number;
  /** 标签 */
  tags?: string[];
  /** 作者/创建者 */
  author?: string;
  /** 是否启用 */
  enabled: boolean;
}

// ==================== 第三方平台相关类型 ====================

/**
 * 平台组件支持情况
 */
export interface PlatformComponentSupport {
  /** 组件类型 */
  componentType: string;
  /** 是否支持 */
  supported: boolean;
  /** 支持程度 (0-1) */
  supportLevel: number;
  /** 平台原生组件名称 */
  nativeComponentName?: string;
  /** 参数映射关系 */
  paramMapping?: Record<string, string>;
  /** 限制说明 */
  limitations?: string;
}

/**
 * 平台能力矩阵接口
 */
export interface PlatformCapabilityMatrix {
  /** 可视化组件颗粒度评分 (0-100) */
  componentGranularity: number;
  /** 循环节点支持 */
  loopSupport: boolean;
  /** 分支节点支持 */
  branchSupport: boolean;
  /** 批量节点支持 */
  batchSupport: boolean;
  /** RAG 原生能力 */
  ragNative: boolean;
  /** 插件开放度 (0-100) */
  pluginOpenness: number;
  /** API 鉴权复杂度 (0-100, 越高越复杂) */
  authComplexity: number;
  /** 算力上限描述 */
  computeLimit?: string;
  /** 日志粒度评分 (0-100) */
  logGranularity: number;
  /** 自动化执行能力 */
  autoExecution: boolean;
  /** 私有化部署支持 */
  privateDeployment: boolean;
  /** 组件支持清单 */
  components: PlatformComponentSupport[];
}

/**
 * 第三方平台接口
 */
export interface ThirdPartyPlatform extends BaseEntity {
  /** 平台标识 */
  platformKey: PlatformType;
  /** 平台名称 */
  name: string;
  /** 平台区域 */
  region: PlatformRegion;
  /** 平台描述 */
  description?: string;
  /** 平台 logo */
  logo?: string;
  /** 官网地址 */
  website?: string;
  /** API 文档地址 */
  apiDocsUrl?: string;
  /** 能力矩阵 */
  capabilityMatrix: PlatformCapabilityMatrix;
  /** 是否已绑定 */
  isBound: boolean;
  /** API 配置（加密存储） */
  apiConfig?: Record<string, string>;
}

// ==================== 分身部署相关类型 ====================

/**
 * 分身部署记录接口
 */
export interface AvatarDeploymentRecord extends BaseEntity {
  /** 智能体 ID */
  agentId: string;
  /** 平台标识 */
  platformKey: PlatformType;
  /** 分身名称 */
  avatarName: string;
  /** 平台侧分身 ID */
  platformAvatarId?: string;
  /** 部署状态 */
  status: DeploymentStatus;
  /** 适配状态 */
  adaptationStatus: AdaptationStatus;
  /** 适配后的配置 */
  adaptedConfig?: Record<string, unknown>;
  /** 适配规则版本 */
  adaptationRuleVersion?: string;
  /** 部署时间 */
  deployedAt?: Date;
  /** 最近运行时间 */
  lastRunAt?: Date;
  /** 错误信息 */
  errorMessage?: string;
}

// ==================== 适配规则相关类型 ====================

/**
 * 组件映射规则
 */
export interface ComponentMappingRule {
  /** 源组件类型 */
  sourceComponentType: string;
  /** 目标组件类型 */
  targetComponentType: string;
  /** 参数映射 */
  paramMapping: Record<string, string>;
  /** 是否需要降级处理 */
  needsDegradation: boolean;
  /** 降级策略描述 */
  degradationStrategy?: string;
  /** 成功率 */
  successRate?: number;
}

/**
 * 工作流适配规则接口
 */
export interface WorkflowAdaptationRule extends BaseEntity {
  /** 源平台标识（通用为 'universal'） */
  sourcePlatform: string;
  /** 目标平台标识 */
  targetPlatform: PlatformType;
  /** 规则名称 */
  ruleName: string;
  /** 组件映射规则列表 */
  componentMappings: ComponentMappingRule[];
  /** 全局适配策略 */
  globalStrategy?: Record<string, unknown>;
  /** 规则版本 */
  version: string;
  /** 是否启用 */
  enabled: boolean;
  /** 适配成功率 */
  successRate?: number;
  /** 使用次数 */
  usageCount: number;
}

// ==================== 数据回收相关类型 ====================

/**
 * 数据回收记录接口
 */
export interface DataCollectionRecord extends BaseEntity {
  /** 智能体 ID */
  agentId: string;
  /** 平台标识 */
  platformKey: PlatformType;
  /** 分身部署记录 ID */
  deploymentId: string;
  /** 回收状态 */
  status: CollectionStatus;
  /** 回收开始时间 */
  startedAt?: Date;
  /** 回收完成时间 */
  completedAt?: Date;
  /** 回收内容数量 */
  contentCount: number;
  /** 回收数据大小（字节） */
  dataSize?: number;
  /** 错误信息 */
  errorMessage?: string;
}

// ==================== 量化迭代相关类型 ====================

/**
 * 六维度量化评分
 */
export interface QuantificationScores {
  /** 内容产出质量 (0-100) */
  contentQuality: number;
  /** 任务完成成功率 (0-100) */
  taskSuccessRate: number;
  /** 执行耗时得分 (0-100, 越快越高) */
  executionSpeed: number;
  /** 资源消耗得分 (0-100, 消耗越低越高) */
  resourceEfficiency: number;
  /** prompt 准确率 (0-100) */
  promptAccuracy: number;
  /** 工作流稳定性 (0-100) */
  workflowStability: number;
}

/**
 * 量化评分权重配置
 */
export interface ScoreWeights {
  contentQuality: number;
  taskSuccessRate: number;
  executionSpeed: number;
  resourceEfficiency: number;
  promptAccuracy: number;
  workflowStability: number;
}

/**
 * 优质内容样本接口
 */
export interface QualityContentSample {
  /** 样本 ID */
  id: string;
  /** 来源平台 */
  platformKey: PlatformType;
  /** 智能体 ID */
  agentId: string;
  /** 内容数据 */
  content: Record<string, unknown>;
  /** 各维度得分 */
  scores: QuantificationScores;
  /** 综合得分 */
  overallScore: number;
  /** 是否为平台限制导致的偏差 */
  isPlatformBias: boolean;
  /** 采集时间 */
  collectedAt: Date;
}

/**
 * 智能体量化迭代记录接口
 */
export interface AgentIterationRecord extends BaseEntity {
  /** 智能体 ID */
  agentId: string;
  /** 迭代前版本 */
  fromVersion: string;
  /** 迭代后版本 */
  toVersion: string;
  /** 迭代状态 */
  status: IterationStatus;
  /** 迭代前得分 */
  beforeScores?: QuantificationScores;
  /** 迭代后得分 */
  afterScores?: QuantificationScores;
  /** 得分提升幅度 */
  scoreImprovement?: number;
  /** 择优样本数量 */
  sampleCount: number;
  /** 迭代内容描述 */
  changes: string;
  /** 迭代前配置快照 */
  beforeConfig?: Record<string, unknown>;
  /** 迭代后配置快照 */
  afterConfig?: Record<string, unknown>;
}

// ==================== 内容择优相关类型 ====================

/**
 * 内容择优迭代记录接口
 */
export interface ContentSelectionIteration extends BaseEntity {
  /** 智能体 ID */
  agentId: string;
  /** 迭代批次号 */
  batchNumber: number;
  /** 总样本数 */
  totalSamples: number;
  /** 入选样本数 */
  selectedSamples: number;
  /** 入选样本列表 */
  selectedContentIds: string[];
  /** 筛选条件配置 */
  filterConfig: Record<string, unknown>;
  /** 平均得分 */
  averageScore: number;
}

// ==================== 用户相关类型 ====================

/**
 * 用户接口
 */
export interface User extends BaseEntity {
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email?: string;
  /** 头像 */
  avatar?: string;
  /** 是否为游客 */
  isGuest: boolean;
  /** 最后登录时间 */
  lastLoginAt?: Date;
}

// ==================== 同步相关类型 ====================

/**
 * 同步日志类型枚举
 */
export enum SyncType {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  BIDIRECTIONAL = 'bidirectional'
}

/**
 * 同步日志接口
 */
export interface SyncLog extends BaseEntity {
  /** 用户 ID */
  userId: string;
  /** 同步类型 */
  syncType: SyncType;
  /** 同步状态 */
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  /** 同步数据表名 */
  tableName: string;
  /** 同步记录数 */
  recordCount: number;
  /** 开始时间 */
  startedAt?: Date;
  /** 结束时间 */
  endedAt?: Date;
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 索引缓存接口
 */
export interface IndexCache extends BaseEntity {
  /** 缓存键 */
  cacheKey: string;
  /** 缓存类型 */
  cacheType: string;
  /** 缓存数据（JSON） */
  cacheData: Record<string, unknown>;
  /** 过期时间 */
  expiresAt?: Date;
}

// ==================== API 通用响应类型 ====================

/**
 * 分页查询参数
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方式 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 通用 API 响应
 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code: number;
  /** 消息 */
  message: string;
  /** 数据 */
  data?: T;
}

// ==================== 离线/在线状态相关类型 ====================

/**
 * 同步队列项
 */
export interface SyncQueueItem {
  /** 唯一 ID */
  id: string;
  /** 操作类型 */
  operation: 'create' | 'update' | 'delete';
  /** 表名 */
  tableName: string;
  /** 记录 ID */
  recordId: string;
  /** 数据快照 */
  data?: Record<string, unknown>;
  /** 创建时间 */
  createdAt: number;
  /** 重试次数 */
  retryCount: number;
}
