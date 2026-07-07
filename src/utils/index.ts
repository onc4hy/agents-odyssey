// 文件路径: src/utils/index.ts
// 通用工具函数 - 智能体奥德赛项目

import { v4 as uuidv4 } from 'uuid';
import type { QuantificationScores, ScoreWeights } from '@/types';
import { DEFAULT_SCORE_WEIGHTS } from '@/constants';

/**
 * 生成唯一 ID
 * 使用 UUID v4 格式
 * @returns 唯一标识符字符串
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * 格式化日期为可读字符串
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 计算综合加权得分
 * 根据六大维度得分和权重计算综合得分
 * @param scores 各维度得分
 * @param weights 各维度权重，默认使用默认权重
 * @returns 综合得分 (0-100)
 */
export function calculateOverallScore(scores: QuantificationScores, weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS): number {
  const totalWeight = weights.contentQuality + weights.taskSuccessRate + weights.executionSpeed +
    weights.resourceEfficiency + weights.promptAccuracy + weights.workflowStability;

  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum =
    scores.contentQuality * weights.contentQuality +
    scores.taskSuccessRate * weights.taskSuccessRate +
    scores.executionSpeed * weights.executionSpeed +
    scores.resourceEfficiency * weights.resourceEfficiency +
    scores.promptAccuracy * weights.promptAccuracy +
    scores.workflowStability * weights.workflowStability;

  const normalizedScore = weightedSum / totalWeight;
  return Math.round(normalizedScore * 100) / 100;
}

/**
 * 深拷贝对象
 * 使用结构化克隆算法
 * @param obj 要深拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (cloned as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 节流时间间隔（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 检查当前是否在线
 * @returns 是否在线
 */
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * 文件大小格式化
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 截断文本并添加省略号
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * 生成默认版本号
 * 格式: v{主版本}.{次版本}.{修订版本}
 * @param iterationCount 迭代次数
 * @returns 版本号字符串
 */
export function generateVersion(iterationCount: number = 0): string {
  const major = Math.floor(iterationCount / 100);
  const minor = Math.floor((iterationCount % 100) / 10);
  const patch = iterationCount % 10;
  return `v${major}.${minor}.${patch}`;
}
