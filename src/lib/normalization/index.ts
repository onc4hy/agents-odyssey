// 文件路径: src/lib/normalization/index.ts
// 跨平台数据归一化抹平 + 量化择优迭代模块 - 智能体奥德赛项目
// 实现全域数据差异剔除、多维度量化评分与择优迭代核心算法

import type {
  QualityContentSample,
  QuantificationScores,
  ScoreWeights,
  PlatformCapabilityMatrix,
  AgentIterationRecord,
  Agent
} from '@/types';
import { IterationStatus } from '@/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/constants';
import { calculateOverallScore, generateVersion } from '@/utils';

/**
 * 归一化处理结果接口
 */
export interface NormalizationResult {
  /** 有效样本数 */
  validSampleCount: number;
  /** 剔除样本数 */
  prunedSampleCount: number;
  /** 有效样本列表 */
  validSamples: QualityContentSample[];
  /** 剔除原因统计 */
  pruneReasons: Record<string, number>;
  /** 归一化后的统一数据格式 */
  normalizedData: NormalizedDataPoint[];
}

/**
 * 归一化数据点接口
 */
export interface NormalizedDataPoint {
  /** 样本 ID */
  sampleId: string;
  /** 智能体 ID */
  agentId: string;
  /** 平台标识 */
  platformKey: string;
  /** 归一化后的得分 */
  scores: QuantificationScores;
  /** 综合得分 */
  overallScore: number;
  /** 数据采集时间 */
  collectedAt: Date;
  /** 原始数据引用 */
  originalSample: QualityContentSample;
}

/**
 * 迭代优化结果接口
 */
export interface IterationOptimizationResult {
  /** 是否成功 */
  success: boolean;
  /** 迭代前版本 */
  fromVersion: string;
  /** 迭代后版本 */
  toVersion: string;
  /** 优化前后得分对比 */
  scoreComparison: {
    before: QuantificationScores;
    after: QuantificationScores;
    improvement: number;
  };
  /** 主要优化内容 */
  changes: string[];
  /** 使用的优质样本数量 */
  usedSampleCount: number;
  /** 迭代记录 */
  iterationRecord?: AgentIterationRecord;
}

/**
 * 数据归一化与迭代优化引擎
 */
class NormalizationEngine {
  /**
   * 执行全域数据归一化处理
   * 剔除因平台能力限制导致的无效数据，统一数据评判基准
   * @param samples 原始样本数据
   * @param platformMatrices 各平台能力矩阵映射
   * @returns 归一化处理结果
   */
  normalizeData(
    samples: QualityContentSample[],
    platformMatrices: Record<string, PlatformCapabilityMatrix>
  ): NormalizationResult {
    const validSamples: QualityContentSample[] = [];
    const normalizedData: NormalizedDataPoint[] = [];
    const pruneReasons: Record<string, number> = {};
    let prunedCount = 0;

    samples.forEach((sample) => {
      const matrix = platformMatrices[sample.platformKey];

      // 判断是否为平台限制导致的偏差数据
      const { isPlatformBias, reason } = this.detectPlatformBias(sample, matrix);

      if (isPlatformBias) {
        prunedCount++;
        pruneReasons[reason] = (pruneReasons[reason] || 0) + 1;
        // 标记为平台偏差但保留（用于参考分析）
        const markedSample = { ...sample, isPlatformBias: true };
        validSamples.push(markedSample);
      } else {
        validSamples.push(sample);
      }

      // 归一化得分（消除平台能力差异影响）
      const normalizedScores = this.normalizeScores(sample.scores, matrix);
      const normalizedOverall = calculateOverallScore(normalizedScores);

      normalizedData.push({
        sampleId: sample.id,
        agentId: sample.agentId,
        platformKey: sample.platformKey,
        scores: normalizedScores,
        overallScore: normalizedOverall,
        collectedAt: sample.collectedAt,
        originalSample: sample
      });
    });

    // 按综合得分排序
    normalizedData.sort((a, b) => b.overallScore - a.overallScore);

    return {
      validSampleCount: validSamples.filter((s) => !s.isPlatformBias).length,
      prunedSampleCount: prunedCount,
      validSamples,
      pruneReasons,
      normalizedData
    };
  }

  /**
   * 检测样本是否为平台能力限制导致的偏差数据
   * @param sample 内容样本
   * @param matrix 平台能力矩阵
   * @returns 是否为平台偏差及原因
   */
  private detectPlatformBias(
    sample: QualityContentSample,
    matrix?: PlatformCapabilityMatrix
  ): { isPlatformBias: boolean; reason: string } {
    if (!matrix) {
      return { isPlatformBias: false, reason: '' };
    }

    // 检查 1: 内容质量低是否因 RAG 能力不足
    if (sample.scores.contentQuality < 40 && !matrix.ragNative) {
      return {
        isPlatformBias: true,
        reason: 'platform_rag_limit'
      };
    }

    // 检查 2: 工作流稳定性低是否因组件支持不足
    if (sample.scores.workflowStability < 40 && matrix.componentGranularity < 50) {
      return {
        isPlatformBias: true,
        reason: 'platform_component_limit'
      };
    }

    // 检查 3: 执行速度慢是否因算力限制
    if (sample.scores.executionSpeed < 40 && matrix.computeLimit) {
      return {
        isPlatformBias: true,
        reason: 'platform_compute_limit'
      };
    }

    // 检查 4: 任务成功率低是否因功能缺失
    if (sample.scores.taskSuccessRate < 30 && !matrix.branchSupport) {
      return {
        isPlatformBias: true,
        reason: 'platform_branch_limit'
      };
    }

    return { isPlatformBias: false, reason: '' };
  }

  /**
   * 归一化得分
   * 根据平台能力基准对得分进行校准，消除平台差异
   * @param scores 原始得分
   * @param matrix 平台能力矩阵
   * @returns 归一化后的得分
   */
  private normalizeScores(
    scores: QuantificationScores,
    matrix?: PlatformCapabilityMatrix
  ): QuantificationScores {
    if (!matrix) {
      return { ...scores };
    }

    // 计算各维度的平台基准系数
    // 平台能力越强，得分基准越高，需要向下校准
    // 平台能力越弱，得分基准越低，需要向上校准（但低质数据已被剔除）

    const contentQualityFactor = this.calculateNormalizationFactor(matrix.ragNative ? 80 : 50, 100);
    const workflowStabilityFactor = this.calculateNormalizationFactor(matrix.componentGranularity, 100);
    const executionSpeedFactor = matrix.computeLimit ? 0.85 : 1.0;
    const taskSuccessFactor = matrix.branchSupport && matrix.loopSupport ? 1.0 : 0.9;

    return {
      contentQuality: Math.min(100, Math.round(scores.contentQuality * contentQualityFactor)),
      taskSuccessRate: Math.min(100, Math.round(scores.taskSuccessRate * taskSuccessFactor)),
      executionSpeed: Math.min(100, Math.round(scores.executionSpeed * executionSpeedFactor)),
      resourceEfficiency: scores.resourceEfficiency,
      promptAccuracy: scores.promptAccuracy,
      workflowStability: Math.min(100, Math.round(scores.workflowStability * workflowStabilityFactor))
    };
  }

  /**
   * 计算归一化因子
   * @param platformValue 平台能力值
   * @param maxValue 基准最大值
   * @returns 归一化因子
   */
  private calculateNormalizationFactor(platformValue: number, maxValue: number): number {
    // 平台能力越强，因子越接近 1
    // 平台能力越弱，因子越大（补偿平台差异，但有上限）
    const ratio = platformValue / maxValue;
    const factor = 1.0 + (1.0 - ratio) * 0.3; // 最多 30% 补偿
    return Math.min(factor, 1.3);
  }

  /**
   * 多维度量化择优
   * 从归一化数据中筛选优质样本
   * @param normalizedData 归一化数据点
   * @param topN 返回前 N 个优质样本
   * @param weights 评分权重
   * @returns 优质样本列表
   */
  selectTopSamples(
    normalizedData: NormalizedDataPoint[],
    topN: number = 20,
    weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
  ): NormalizedDataPoint[] {
    // 排除平台偏差数据
    const validData = normalizedData.filter((d) => !d.originalSample.isPlatformBias);

    // 按综合得分排序
    const sorted = [...validData].sort((a, b) => {
      const scoreA = calculateOverallScore(a.scores, weights);
      const scoreB = calculateOverallScore(b.scores, weights);
      return scoreB - scoreA;
    });

    return sorted.slice(0, topN);
  }

  /**
   * 计算平均得分
   * @param samples 样本列表
   * @returns 平均各维度得分
   */
  calculateAverageScores(samples: NormalizedDataPoint[]): QuantificationScores {
    if (samples.length === 0) {
      return {
        contentQuality: 0,
        taskSuccessRate: 0,
        executionSpeed: 0,
        resourceEfficiency: 0,
        promptAccuracy: 0,
        workflowStability: 0
      };
    }

    const totals = samples.reduce(
      (acc, sample) => ({
        contentQuality: acc.contentQuality + sample.scores.contentQuality,
        taskSuccessRate: acc.taskSuccessRate + sample.scores.taskSuccessRate,
        executionSpeed: acc.executionSpeed + sample.scores.executionSpeed,
        resourceEfficiency: acc.resourceEfficiency + sample.scores.resourceEfficiency,
        promptAccuracy: acc.promptAccuracy + sample.scores.promptAccuracy,
        workflowStability: acc.workflowStability + sample.scores.workflowStability
      }),
      {
        contentQuality: 0,
        taskSuccessRate: 0,
        executionSpeed: 0,
        resourceEfficiency: 0,
        promptAccuracy: 0,
        workflowStability: 0
      }
    );

    const count = samples.length;
    return {
      contentQuality: Math.round(totals.contentQuality / count),
      taskSuccessRate: Math.round(totals.taskSuccessRate / count),
      executionSpeed: Math.round(totals.executionSpeed / count),
      resourceEfficiency: Math.round(totals.resourceEfficiency / count),
      promptAccuracy: Math.round(totals.promptAccuracy / count),
      workflowStability: Math.round(totals.workflowStability / count)
    };
  }

  /**
   * 生成迭代优化建议
   * 基于优质样本分析，生成智能体迭代优化建议
   * @param agent 当前智能体配置
   * @param topSamples 优质样本
   * @returns 迭代优化结果
   */
  generateIterationOptimization(
    agent: Agent,
    topSamples: NormalizedDataPoint[]
  ): IterationOptimizationResult {
    if (topSamples.length === 0) {
      return {
        success: false,
        fromVersion: agent.version,
        toVersion: agent.version,
        scoreComparison: {
          before: this.getAgentScores(agent),
          after: this.getAgentScores(agent),
          improvement: 0
        },
        changes: [],
        usedSampleCount: 0
      };
    }

    const avgScores = this.calculateAverageScores(topSamples);
    const beforeScores = this.getAgentScores(agent);
    const beforeOverall = agent.overallScore || calculateOverallScore(beforeScores);
    const afterOverall = calculateOverallScore(avgScores);
    const improvement = afterOverall - beforeOverall;

    // 分析各维度，生成优化建议
    const changes: string[] = [];

    // 分析内容质量维度
    if (avgScores.contentQuality > beforeScores.contentQuality + 5) {
      changes.push('优化系统提示词，提升内容产出质量');
      changes.push('调整输出规则，增加内容结构规范');
    }

    // 分析任务成功率
    if (avgScores.taskSuccessRate > beforeScores.taskSuccessRate + 5) {
      changes.push('优化指令清晰度，提升任务理解准确率');
      changes.push('增加边界条件处理逻辑');
    }

    // 分析执行效率
    if (avgScores.executionSpeed > beforeScores.executionSpeed + 5) {
      changes.push('精简工作流节点，减少不必要的处理步骤');
      changes.push('优化 prompt 长度，降低 token 消耗');
    }

    // 分析工作流稳定性
    if (avgScores.workflowStability > beforeScores.workflowStability + 5) {
      changes.push('优化节点连接关系，减少异常中断');
      changes.push('增加错误处理和重试机制');
    }

    // 分析资源效率
    if (avgScores.resourceEfficiency > beforeScores.resourceEfficiency + 5) {
      changes.push('优化 token 使用策略，降低资源消耗');
      changes.push('合并冗余节点，提升执行效率');
    }

    const newIterationCount = agent.iterationCount + 1;
    const newVersion = generateVersion(newIterationCount);

    return {
      success: true,
      fromVersion: agent.version,
      toVersion: newVersion,
      scoreComparison: {
        before: beforeScores,
        after: avgScores,
        improvement: Math.round(improvement * 100) / 100
      },
      changes,
      usedSampleCount: topSamples.length
    };
  }

  /**
   * 获取智能体当前得分
   * @param agent 智能体
   * @returns 各维度得分
   */
  private getAgentScores(_agent: Agent): QuantificationScores {
    // 从智能体的扩展字段或历史记录中获取当前得分
    // 这里提供默认实现
    const defaultScores: QuantificationScores = {
      contentQuality: 70,
      taskSuccessRate: 70,
      executionSpeed: 70,
      resourceEfficiency: 70,
      promptAccuracy: 70,
      workflowStability: 70
    };

    return defaultScores;
  }

  /**
   * 计算得分等级
   * @param score 综合得分
   * @returns 等级：S/A/B/C/D
   */
  getScoreGrade(score: number): string {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  /**
   * 生成迭代记录
   * @param agent 智能体
   * @param result 优化结果
   * @returns 迭代记录
   */
  createIterationRecord(
    agent: Agent,
    result: IterationOptimizationResult
  ): Omit<AgentIterationRecord, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      agentId: agent.id,
      fromVersion: result.fromVersion,
      toVersion: result.toVersion,
      status: IterationStatus.PENDING,
      beforeScores: result.scoreComparison.before,
      afterScores: result.scoreComparison.after,
      scoreImprovement: result.scoreComparison.improvement,
      sampleCount: result.usedSampleCount,
      changes: result.changes.join('; ')
    };
  }
}

/**
 * 归一化引擎单例
 */
export const normalizationEngine = new NormalizationEngine();

export default normalizationEngine;
