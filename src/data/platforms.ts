// 文件路径: src/data/platforms.ts
// 平台差异台账初始数据 - 智能体奥德赛项目
// 预录入所有主流第三方智能体平台的能力矩阵与组件支持情况

import type { ThirdPartyPlatform, PlatformComponentSupport } from '@/types';
import { PlatformType, PlatformRegion, WorkflowNodeType } from '@/types';
import { generateId } from '@/utils';

/**
 * 生成基础组件支持清单
 * @param overrides 自定义覆盖配置
 * @returns 组件支持数组
 */
function generateComponentSupport(
  overrides: Partial<Record<string, { supported: boolean; level: number; nativeName?: string }>> = {}
): PlatformComponentSupport[] {
  const defaultComponents = [
    { type: WorkflowNodeType.START, supported: true, level: 100, nativeName: '开始' },
    { type: WorkflowNodeType.END, supported: true, level: 100, nativeName: '结束' },
    { type: WorkflowNodeType.LLM, supported: true, level: 100, nativeName: '大模型' },
    { type: WorkflowNodeType.CONDITION, supported: true, level: 80, nativeName: '条件判断' },
    { type: WorkflowNodeType.LOOP, supported: true, level: 70, nativeName: '循环' },
    { type: WorkflowNodeType.DATA_TRANSFORM, supported: true, level: 60, nativeName: '数据转换' },
    { type: WorkflowNodeType.HTTP_REQUEST, supported: true, level: 90, nativeName: 'HTTP 请求' },
    { type: WorkflowNodeType.CODE, supported: true, level: 50, nativeName: '代码执行' },
    { type: WorkflowNodeType.VARIABLE, supported: true, level: 80, nativeName: '变量' },
    { type: WorkflowNodeType.KNOWLEDGE, supported: true, level: 75, nativeName: '知识库' }
  ];

  return defaultComponents.map((comp) => {
    const override = overrides[comp.type];
    return {
      componentType: comp.type,
      supported: override?.supported ?? comp.supported,
      supportLevel: override?.level ?? comp.level,
      nativeComponentName: override?.nativeName ?? comp.nativeName,
      paramMapping: {},
      limitations: ''
    };
  });
}

/**
 * 扣子 Coze 平台配置
 */
const cozePlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.COZE,
  name: '扣子 Coze',
  region: PlatformRegion.DOMESTIC,
  description: '字节跳动旗下的 AI 智能体开发平台，支持提示词和工作流型智能体',
  website: 'https://www.coze.cn',
  apiDocsUrl: 'https://www.coze.cn/docs',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 85,
    loopSupport: true,
    branchSupport: true,
    batchSupport: true,
    ragNative: true,
    pluginOpenness: 90,
    authComplexity: 40,
    computeLimit: '根据账号等级',
    logGranularity: 75,
    autoExecution: true,
    privateDeployment: false,
    components: generateComponentSupport({
      [WorkflowNodeType.LOOP]: { supported: true, level: 85, nativeName: '循环' },
      [WorkflowNodeType.KNOWLEDGE]: { supported: true, level: 95, nativeName: '知识库' },
      [WorkflowNodeType.CODE]: { supported: true, level: 70, nativeName: '代码节点' }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Dify 平台配置
 */
const difyPlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.DIFY,
  name: 'Dify',
  region: PlatformRegion.DOMESTIC,
  description: '开源的大语言模型应用开发平台，支持工作流和 Agent 开发',
  website: 'https://dify.ai',
  apiDocsUrl: 'https://docs.dify.ai',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 80,
    loopSupport: true,
    branchSupport: true,
    batchSupport: false,
    ragNative: true,
    pluginOpenness: 85,
    authComplexity: 30,
    computeLimit: '自部署无限制',
    logGranularity: 70,
    autoExecution: true,
    privateDeployment: true,
    components: generateComponentSupport({
      [WorkflowNodeType.LOOP]: { supported: true, level: 75, nativeName: '迭代' },
      [WorkflowNodeType.KNOWLEDGE]: { supported: true, level: 90, nativeName: '知识库' }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * 百度文心智能体平台配置
 */
const wenxinPlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.WENXIN,
  name: '百度文心智能体',
  region: PlatformRegion.DOMESTIC,
  description: '百度推出的智能体开发平台，含秒哒轻应用',
  website: 'https://chat.baidu.com',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 70,
    loopSupport: false,
    branchSupport: true,
    batchSupport: false,
    ragNative: true,
    pluginOpenness: 60,
    authComplexity: 50,
    computeLimit: '受限',
    logGranularity: 60,
    autoExecution: false,
    privateDeployment: false,
    components: generateComponentSupport({
      [WorkflowNodeType.LOOP]: { supported: false, level: 0 },
      [WorkflowNodeType.KNOWLEDGE]: { supported: true, level: 80, nativeName: '知识库' },
      [WorkflowNodeType.CODE]: { supported: false, level: 0 }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * 阿里云百炼平台配置
 */
const bailianPlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.BAILIAN,
  name: '阿里云百炼',
  region: PlatformRegion.DOMESTIC,
  description: '阿里云旗下大模型应用开发平台',
  website: 'https://bailian.aliyun.com',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 75,
    loopSupport: true,
    branchSupport: true,
    batchSupport: true,
    ragNative: true,
    pluginOpenness: 70,
    authComplexity: 60,
    computeLimit: '按量计费',
    logGranularity: 70,
    autoExecution: true,
    privateDeployment: true,
    components: generateComponentSupport({
      [WorkflowNodeType.LOOP]: { supported: true, level: 70, nativeName: '循环' },
      [WorkflowNodeType.KNOWLEDGE]: { supported: true, level: 85, nativeName: '知识库' }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * n8n 平台配置
 */
const n8nPlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.N8N,
  name: 'n8n',
  region: PlatformRegion.OVERSEAS,
  description: '开源工作流自动化平台，扩展性强',
  website: 'https://n8n.io',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 95,
    loopSupport: true,
    branchSupport: true,
    batchSupport: true,
    ragNative: false,
    pluginOpenness: 95,
    authComplexity: 45,
    computeLimit: '自部署无限制',
    logGranularity: 90,
    autoExecution: true,
    privateDeployment: true,
    components: generateComponentSupport({
      [WorkflowNodeType.CODE]: { supported: true, level: 95, nativeName: 'Code' },
      [WorkflowNodeType.HTTP_REQUEST]: { supported: true, level: 100, nativeName: 'HTTP Request' },
      [WorkflowNodeType.KNOWLEDGE]: { supported: false, level: 0 }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Poe 平台配置
 */
const poePlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.POE,
  name: 'Poe (Quora)',
  region: PlatformRegion.OVERSEAS,
  description: 'Quora 推出的 AI 聊天机器人平台',
  website: 'https://poe.com',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 40,
    loopSupport: false,
    branchSupport: false,
    batchSupport: false,
    ragNative: false,
    pluginOpenness: 30,
    authComplexity: 35,
    computeLimit: '按消息限制',
    logGranularity: 40,
    autoExecution: false,
    privateDeployment: false,
    components: generateComponentSupport({
      [WorkflowNodeType.LOOP]: { supported: false, level: 0 },
      [WorkflowNodeType.CONDITION]: { supported: false, level: 0 },
      [WorkflowNodeType.CODE]: { supported: false, level: 0 },
      [WorkflowNodeType.KNOWLEDGE]: { supported: false, level: 0 }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * LangChain 平台配置
 */
const langchainPlatform: ThirdPartyPlatform = {
  id: generateId(),
  platformKey: PlatformType.LANGCHAIN,
  name: 'LangChain',
  region: PlatformRegion.OVERSEAS,
  description: '大语言模型应用开发框架，支持 LangSmith 平台',
  website: 'https://www.langchain.com',
  isBound: false,
  capabilityMatrix: {
    componentGranularity: 90,
    loopSupport: true,
    branchSupport: true,
    batchSupport: true,
    ragNative: true,
    pluginOpenness: 100,
    authComplexity: 70,
    computeLimit: '自部署无限制',
    logGranularity: 85,
    autoExecution: true,
    privateDeployment: true,
    components: generateComponentSupport({
      [WorkflowNodeType.CODE]: { supported: true, level: 100, nativeName: 'Custom Chain' },
      [WorkflowNodeType.KNOWLEDGE]: { supported: true, level: 95, nativeName: 'Retrieval Chain' },
      [WorkflowNodeType.LOOP]: { supported: true, level: 90, nativeName: 'Loop' }
    })
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * 全量平台初始数据
 */
export const INITIAL_PLATFORMS: ThirdPartyPlatform[] = [
  cozePlatform,
  difyPlatform,
  wenxinPlatform,
  bailianPlatform,
  n8nPlatform,
  poePlatform,
  langchainPlatform
];

/**
 * 默认组件映射规则（从通用到各平台）
 */
export const DEFAULT_MAPPING_RULES: Record<PlatformType, Array<{
  sourceComponentType: string;
  targetComponentType: string;
  paramMapping: Record<string, string>;
  needsDegradation: boolean;
  degradationStrategy?: string;
}>> = {
  [PlatformType.COZE]: [
    {
      sourceComponentType: WorkflowNodeType.LLM,
      targetComponentType: WorkflowNodeType.LLM,
      paramMapping: { model: 'model_id', temperature: 'temperature' },
      needsDegradation: false
    }
  ],
  [PlatformType.DIFY]: [
    {
      sourceComponentType: WorkflowNodeType.LLM,
      targetComponentType: WorkflowNodeType.LLM,
      paramMapping: { model: 'model', temperature: 'temperature' },
      needsDegradation: false
    },
    {
      sourceComponentType: WorkflowNodeType.LOOP,
      targetComponentType: WorkflowNodeType.LOOP,
      paramMapping: {},
      needsDegradation: true,
      degradationStrategy: '使用迭代节点替代循环节点'
    }
  ],
  [PlatformType.N8N]: [
    {
      sourceComponentType: WorkflowNodeType.LLM,
      targetComponentType: WorkflowNodeType.HTTP_REQUEST,
      paramMapping: { prompt: 'body.messages', model: 'body.model' },
      needsDegradation: true,
      degradationStrategy: '使用 HTTP 节点调用 LLM API'
    }
  ],
  [PlatformType.LANGCHAIN]: [
    {
      sourceComponentType: WorkflowNodeType.LLM,
      targetComponentType: WorkflowNodeType.LLM,
      paramMapping: { model: 'llm.model_name', temperature: 'llm.temperature' },
      needsDegradation: false
    }
  ],
  // 其他平台使用默认映射
  [PlatformType.WENXIN]: [],
  [PlatformType.BAILIAN]: [],
  [PlatformType.YUANQI]: [],
  [PlatformType.TBOX]: [],
  [PlatformType.PANGU]: [],
  [PlatformType.SHIZAI]: [],
  [PlatformType.ZHIYU]: [],
  [PlatformType.AGENTAR]: [],
  [PlatformType.XINGHUO]: [],
  [PlatformType.POE]: [],
  [PlatformType.LANGGRAPH]: [],
  [PlatformType.AUTOGEN]: [],
  [PlatformType.COPILOT_STUDIO]: [],
  [PlatformType.AZURE_AI_FOUNDRY]: [],
  [PlatformType.OPENAI_AGENTKIT]: [],
  [PlatformType.AGENTGPT]: [],
  [PlatformType.SUPERAGENT]: [],
  [PlatformType.VOICEFLOW]: [],
  [PlatformType.POSTMAN_AI]: []
};

export default INITIAL_PLATFORMS;
