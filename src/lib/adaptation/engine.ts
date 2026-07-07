// 文件路径: src/lib/adaptation/engine.ts
// 跨平台工作流差异化适配引擎 - 智能体奥德赛项目
// 实现母工作流向各第三方平台的自动化适配，包含组件替换、节点裁剪、参数适配等核心逻辑

import type {
  WorkflowConfig,
  WorkflowNode,
  WorkflowEdge,
  PlatformCapabilityMatrix,
  ComponentMappingRule,
  PlatformType
} from '@/types';
import { WorkflowNodeType } from '@/types';

/**
 * 适配结果接口
 */
export interface AdaptationResult {
  /** 适配后的工作流配置 */
  adaptedWorkflow: WorkflowConfig;
  /** 是否成功适配 */
  success: boolean;
  /** 适配率 (0-1) */
  adaptationRate: number;
  /** 被裁剪的节点数量 */
  prunedNodeCount: number;
  /** 被替换的组件数量 */
  replacedComponentCount: number;
  /** 降级处理数量 */
  degradedCount: number;
  /** 详细日志 */
  logs: AdaptationLogEntry[];
}

/**
 * 适配日志条目
 */
export interface AdaptationLogEntry {
  /** 节点 ID */
  nodeId: string;
  /** 节点名称 */
  nodeName: string;
  /** 操作类型 */
  action: 'replaced' | 'pruned' | 'degraded' | 'adapted' | 'skipped';
  /** 描述 */
  description: string;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 工作流适配引擎类
 */
class WorkflowAdaptationEngine {
  /**
   * 执行工作流适配
   * 将母工作流适配到目标平台
   * @param workflow 母工作流配置
   * @param platformKey 目标平台标识
   * @param capabilityMatrix 目标平台能力矩阵
   * @param mappingRules 组件映射规则
   * @returns 适配结果
   */
  adaptWorkflow(
    workflow: WorkflowConfig,
    _platformKey: PlatformType,
    capabilityMatrix: PlatformCapabilityMatrix,
    mappingRules: ComponentMappingRule[]
  ): AdaptationResult {
    const logs: AdaptationLogEntry[] = [];
    const adaptedNodes: WorkflowNode[] = [];
    const adaptedEdges: WorkflowEdge[] = [];
    let prunedCount = 0;
    let replacedCount = 0;
    let degradedCount = 0;

    // 收集需要保留的节点 ID
    const preservedNodeIds = new Set<string>();

    // 遍历所有节点进行适配
    workflow.nodes.forEach((node) => {
      const result = this.adaptNode(node, capabilityMatrix, mappingRules);

      if (result.action === 'pruned') {
        prunedCount++;
        logs.push({
          nodeId: node.id,
          nodeName: node.name,
          action: 'pruned',
          description: `节点类型 ${node.type} 在目标平台不支持，已裁剪`,
          timestamp: new Date()
        });
      } else {
        if (result.action === 'replaced') {
          replacedCount++;
        } else if (result.action === 'degraded') {
          degradedCount++;
        }

        if (result.node) {
          adaptedNodes.push(result.node);
          preservedNodeIds.add(node.id);
        }

        logs.push({
          nodeId: node.id,
          nodeName: node.name,
          action: result.action,
          description: result.description || '',
          timestamp: new Date()
        });
      }
    });

    // 处理边：只保留两端节点都存在的边
    workflow.edges.forEach((edge) => {
      if (preservedNodeIds.has(edge.source) && preservedNodeIds.has(edge.target)) {
        adaptedEdges.push(edge);
      }
    });

    // 计算适配率
    const totalNodes = workflow.nodes.length;
    const adaptedNodeCount = adaptedNodes.length;
    const adaptationRate = totalNodes > 0 ? adaptedNodeCount / totalNodes : 0;

    const adaptedWorkflow: WorkflowConfig = {
      nodes: adaptedNodes,
      edges: adaptedEdges,
      variables: workflow.variables,
      trigger: workflow.trigger
    };

    return {
      adaptedWorkflow,
      success: adaptationRate > 0,
      adaptationRate,
      prunedNodeCount: prunedCount,
      replacedComponentCount: replacedCount,
      degradedCount,
      logs
    };
  }

  /**
   * 适配单个节点
   * @param node 原始节点
   * @param capabilityMatrix 平台能力矩阵
   * @param mappingRules 组件映射规则
   * @returns 节点适配结果
   */
  private adaptNode(
    node: WorkflowNode,
    capabilityMatrix: PlatformCapabilityMatrix,
    mappingRules: ComponentMappingRule[]
  ): {
    node?: WorkflowNode;
    action: 'adapted' | 'replaced' | 'degraded' | 'pruned' | 'skipped';
    description?: string;
  } {
    // 起始和结束节点始终保留
    if (node.type === WorkflowNodeType.START || node.type === WorkflowNodeType.END) {
      return {
        node: { ...node },
        action: 'skipped',
        description: '起始/结束节点无需适配'
      };
    }

    // 查找组件映射规则
    const mappingRule = mappingRules.find(
      (rule) => rule.sourceComponentType === node.type
    );

    // 检查平台组件支持
    const componentSupport = capabilityMatrix.components.find(
      (comp) => comp.componentType === (mappingRule?.targetComponentType || node.type)
    );

    // 如果完全不支持，判断是否是核心节点
    if (!componentSupport || !componentSupport.supported) {
      // 判断是否可以裁剪
      if (this.isPrunableNode(node.type)) {
        return {
          action: 'pruned',
          description: `组件类型 ${node.type} 在目标平台不支持且可裁剪`
        };
      }

      // 尝试查找降级方案
      const degradedNode = this.tryDegradeNode(node, capabilityMatrix);
      if (degradedNode) {
        return {
          node: degradedNode,
          action: 'degraded',
          description: `组件 ${node.type} 已降级为基础节点`
        };
      }

      return {
        action: 'pruned',
        description: `组件类型 ${node.type} 在目标平台不支持且无法降级`
      };
    }

    // 如果有映射规则，进行替换适配
    if (mappingRule && mappingRule.targetComponentType !== node.type) {
      const adaptedNode = this.applyParamMapping(node, mappingRule);
      return {
        node: adaptedNode,
        action: 'replaced',
        description: `组件 ${node.type} 已替换为 ${mappingRule.targetComponentType}`
      };
    }

    // 直接适配，只做参数微调
    return {
      node: { ...node },
      action: 'adapted',
      description: `组件 ${node.type} 已适配`
    };
  }

  /**
   * 判断节点是否可以被裁剪
   * 非核心节点可以在不影响主流程的情况下移除
   * @param nodeType 节点类型
   * @returns 是否可裁剪
   */
  private isPrunableNode(nodeType: WorkflowNodeType): boolean {
    // 以下节点类型可以被裁剪而不影响主流程
    const prunableTypes = [
      WorkflowNodeType.DATA_TRANSFORM,
      WorkflowNodeType.CODE,
      WorkflowNodeType.KNOWLEDGE,
      WorkflowNodeType.VARIABLE
    ];

    return prunableTypes.includes(nodeType);
  }

  /**
   * 应用参数映射
   * @param node 原始节点
   * @param rule 映射规则
   * @returns 适配后的节点
   */
  private applyParamMapping(node: WorkflowNode, rule: ComponentMappingRule): WorkflowNode {
    const newConfig: Record<string, unknown> = { ...node.config };

    // 应用参数映射
    if (rule.paramMapping) {
      Object.entries(rule.paramMapping).forEach(([sourceParam, targetParam]) => {
        if (sourceParam in newConfig) {
          newConfig[targetParam] = newConfig[sourceParam];
          if (sourceParam !== targetParam) {
            delete newConfig[sourceParam];
          }
        }
      });
    }

    return {
      ...node,
      type: rule.targetComponentType as WorkflowNodeType,
      config: newConfig
    };
  }

  /**
   * 尝试降级节点
   * 将高级节点降级为平台支持的基础节点
   * @param node 原始节点
   * @param capabilityMatrix 平台能力矩阵
   * @returns 降级后的节点，无法降级则返回 undefined
   */
  private tryDegradeNode(
    node: WorkflowNode,
    _capabilityMatrix: PlatformCapabilityMatrix
  ): WorkflowNode | undefined {
    // 降级策略：复杂节点降级为 LLM 节点或简单节点
    switch (node.type) {
      case WorkflowNodeType.KNOWLEDGE:
        // 知识库节点降级为 LLM 节点（将知识库内容作为 prompt 的一部分）
        return {
          ...node,
          type: WorkflowNodeType.LLM,
          name: `${node.name} (降级)`,
          config: {
            ...node.config,
            degradedFrom: 'knowledge'
          }
        };

      case WorkflowNodeType.CODE:
        // 代码节点降级为数据转换节点
        return {
          ...node,
          type: WorkflowNodeType.DATA_TRANSFORM,
          name: `${node.name} (降级)`,
          config: {
            ...node.config,
            degradedFrom: 'code'
          }
        };

      default:
        return undefined;
    }
  }

  /**
   * 验证工作流完整性
   * 检查适配后的工作流是否可以正常运行
   * @param workflow 工作流配置
   * @returns 验证结果
   */
  validateWorkflow(workflow: WorkflowConfig): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // 检查是否有起始节点
    const hasStart = workflow.nodes.some((n) => n.type === WorkflowNodeType.START);
    if (!hasStart) {
      issues.push('工作流缺少起始节点');
    }

    // 检查是否有结束节点
    const hasEnd = workflow.nodes.some((n) => n.type === WorkflowNodeType.END);
    if (!hasEnd) {
      issues.push('工作流缺少结束节点');
    }

    // 检查边的完整性
    const nodeIds = new Set(workflow.nodes.map((n) => n.id));
    workflow.edges.forEach((edge) => {
      if (!nodeIds.has(edge.source)) {
        issues.push(`边 ${edge.id} 的源节点 ${edge.source} 不存在`);
      }
      if (!nodeIds.has(edge.target)) {
        issues.push(`边 ${edge.id} 的目标节点 ${edge.target} 不存在`);
      }
    });

    // 检查是否存在孤立节点
    const connectedNodeIds = new Set<string>();
    workflow.edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    workflow.nodes.forEach((node) => {
      if (node.type !== WorkflowNodeType.START && node.type !== WorkflowNodeType.END) {
        if (!connectedNodeIds.has(node.id)) {
          issues.push(`节点 ${node.name} (${node.id}) 是孤立节点`);
        }
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

/**
 * 工作流适配引擎单例
 */
export const adaptationEngine = new WorkflowAdaptationEngine();

export default adaptationEngine;
