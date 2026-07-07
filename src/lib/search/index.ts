// 文件路径: src/lib/search/index.ts
// FlexSearch 离线全文检索模块 - 智能体奥德赛项目
// 提供本地全文搜索能力，支持智能体、平台、内容等多维度离线检索

import FlexSearch from 'flexsearch';
import type { Agent, ThirdPartyPlatform, QualityContentSample } from '@/types';

/**
 * 搜索索引类型枚举
 */
export enum SearchIndexType {
  /** 智能体索引 */
  AGENTS = 'agents',
  /** 平台索引 */
  PLATFORMS = 'platforms',
  /** 内容索引 */
  CONTENT = 'content'
}

/**
 * 搜索结果项接口
 */
export interface SearchResultItem {
  /** 结果 ID */
  id: string;
  /** 结果类型 */
  type: SearchIndexType;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 匹配得分 */
  score: number;
  /** 标签 */
  tags?: string[];
}

/**
 * 搜索索引管理器
 * 管理多个 FlexSearch 索引实例
 */
class SearchIndexManager {
  /** 智能体搜索索引 */
  private agentIndex: any;

  /** 平台搜索索引 */
  private platformIndex: any;

  /** 内容搜索索引 */
  private contentIndex: any;

  /** 是否初始化完成 */
  private initialized = false;

  constructor() {
    // 初始化智能体索引
    this.agentIndex = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['name', 'description', 'tags', 'type'],
        store: true
      },
      charset: 'latin:advanced',
      tokenize: 'forward',
      cache: 100,
      optimize: true
    });

    // 初始化平台索引
    this.platformIndex = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['name', 'description', 'platformKey', 'region'],
        store: true
      },
      charset: 'latin:advanced',
      tokenize: 'forward',
      cache: 100,
      optimize: true
    });

    // 初始化内容索引
    this.contentIndex = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['title', 'content', 'agentId', 'platformKey'],
        store: true
      },
      charset: 'latin:advanced',
      tokenize: 'forward',
      cache: 100,
      optimize: true
    });
  }

  /**
   * 初始化搜索索引
   * 从本地存储加载数据并构建索引
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 从 IndexedDB 加载数据并构建索引
      // 这里先标记为已初始化，数据在后续逐步加载
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize search index:', error);
      throw error;
    }
  }

  // ==================== 智能体索引操作 ====================

  /**
   * 添加智能体到搜索索引
   * @param agent 智能体数据
   */
  addAgent(agent: Agent): void {
    this.agentIndex.add({
      id: agent.id,
      name: agent.name,
      description: agent.description || '',
      tags: (agent.tags || []).join(' '),
      type: agent.type
    });
  }

  /**
   * 批量添加智能体到搜索索引
   * @param agents 智能体数据数组
   */
  addAgents(agents: Agent[]): void {
    agents.forEach((agent) => {
      this.addAgent(agent);
    });
  }

  /**
   * 更新智能体搜索索引
   * @param agent 智能体数据
   */
  updateAgent(agent: Agent): void {
    this.removeAgent(agent.id);
    this.addAgent(agent);
  }

  /**
   * 从搜索索引移除智能体
   * @param agentId 智能体 ID
   */
  removeAgent(agentId: string): void {
    this.agentIndex.remove(agentId);
  }

  /**
   * 搜索智能体
   * @param query 搜索关键词
   * @param limit 返回结果数量限制
   * @returns 搜索结果数组
   */
  searchAgents(query: string, limit: number = 20): SearchResultItem[] {
    if (!query.trim()) return [];

    const results = this.agentIndex.search(query, { limit });
    const items: SearchResultItem[] = [];

    results.forEach((result: any) => {
      result.result.forEach((id: any) => {
        const doc = this.agentIndex.get(id as string);
        if (doc) {
          items.push({
            id: id as string,
            type: SearchIndexType.AGENTS,
            title: (doc as unknown as { name: string }).name,
            description: (doc as unknown as { description: string }).description,
            score: 0,
            tags: (doc as unknown as { tags: string }).tags.split(' ').filter(Boolean)
          });
        }
      });
    });

    return items.slice(0, limit);
  }

  // ==================== 平台索引操作 ====================

  /**
   * 添加平台到搜索索引
   * @param platform 平台数据
   */
  addPlatform(platform: ThirdPartyPlatform): void {
    this.platformIndex.add({
      id: platform.id,
      name: platform.name,
      description: platform.description || '',
      platformKey: platform.platformKey,
      region: platform.region
    });
  }

  /**
   * 批量添加平台到搜索索引
   * @param platforms 平台数据数组
   */
  addPlatforms(platforms: ThirdPartyPlatform[]): void {
    platforms.forEach((platform) => {
      this.addPlatform(platform);
    });
  }

  /**
   * 更新平台搜索索引
   * @param platform 平台数据
   */
  updatePlatform(platform: ThirdPartyPlatform): void {
    this.removePlatform(platform.id);
    this.addPlatform(platform);
  }

  /**
   * 从搜索索引移除平台
   * @param platformId 平台 ID
   */
  removePlatform(platformId: string): void {
    this.platformIndex.remove(platformId);
  }

  /**
   * 搜索平台
   * @param query 搜索关键词
   * @param limit 返回结果数量限制
   * @returns 搜索结果数组
   */
  searchPlatforms(query: string, limit: number = 20): SearchResultItem[] {
    if (!query.trim()) return [];

    const results = this.platformIndex.search(query, { limit });
    const items: SearchResultItem[] = [];

    results.forEach((result: any) => {
      result.result.forEach((id: any) => {
        const doc = this.platformIndex.get(id as string);
        if (doc) {
          items.push({
            id: id as string,
            type: SearchIndexType.PLATFORMS,
            title: (doc as unknown as { name: string }).name,
            description: (doc as unknown as { description: string }).description,
            score: 0,
            tags: [(doc as unknown as { region: string }).region]
          });
        }
      });
    });

    return items.slice(0, limit);
  }

  // ==================== 内容索引操作 ====================

  /**
   * 添加内容到搜索索引
   * @param sample 优质内容样本
   */
  addContent(sample: QualityContentSample): void {
    const contentObj = sample.content as Record<string, unknown>;
    this.contentIndex.add({
      id: sample.id,
      title: (contentObj.title as string) || (contentObj.summary as string) || '无标题内容',
      content: JSON.stringify(sample.content),
      agentId: sample.agentId,
      platformKey: sample.platformKey
    });
  }

  /**
   * 批量添加内容到搜索索引
   * @param samples 优质内容样本数组
   */
  addContents(samples: QualityContentSample[]): void {
    samples.forEach((sample) => {
      this.addContent(sample);
    });
  }

  /**
   * 更新内容搜索索引
   * @param sample 优质内容样本
   */
  updateContent(sample: QualityContentSample): void {
    this.removeContent(sample.id);
    this.addContent(sample);
  }

  /**
   * 从搜索索引移除内容
   * @param contentId 内容 ID
   */
  removeContent(contentId: string): void {
    this.contentIndex.remove(contentId);
  }

  /**
   * 搜索内容
   * @param query 搜索关键词
   * @param limit 返回结果数量限制
   * @returns 搜索结果数组
   */
  searchContent(query: string, limit: number = 20): SearchResultItem[] {
    if (!query.trim()) return [];

    const results = this.contentIndex.search(query, { limit });
    const items: SearchResultItem[] = [];

    results.forEach((result: any) => {
      result.result.forEach((id: any) => {
        const doc = this.contentIndex.get(id as string);
        if (doc) {
          items.push({
            id: id as string,
            type: SearchIndexType.CONTENT,
            title: (doc as unknown as { title: string }).title,
            description: '',
            score: 0,
            tags: [(doc as unknown as { platformKey: string }).platformKey]
          });
        }
      });
    });

    return items.slice(0, limit);
  }

  // ==================== 全局搜索 ====================

  /**
   * 全局搜索
   * 在所有索引中搜索关键词
   * @param query 搜索关键词
   * @param types 要搜索的索引类型，默认全部
   * @param limit 每种类型的结果数量限制
   * @returns 搜索结果数组
   */
  searchAll(
    query: string,
    types: SearchIndexType[] = Object.values(SearchIndexType),
    limit: number = 10
  ): SearchResultItem[] {
    if (!query.trim()) return [];

    const allResults: SearchResultItem[] = [];

    if (types.includes(SearchIndexType.AGENTS)) {
      allResults.push(...this.searchAgents(query, limit));
    }

    if (types.includes(SearchIndexType.PLATFORMS)) {
      allResults.push(...this.searchPlatforms(query, limit));
    }

    if (types.includes(SearchIndexType.CONTENT)) {
      allResults.push(...this.searchContent(query, limit));
    }

    return allResults.slice(0, limit * types.length);
  }

  // ==================== 索引管理 ====================

  /**
   * 清空指定类型的索引
   * @param type 索引类型
   */
  clearIndex(type: SearchIndexType): void {
    switch (type) {
      case SearchIndexType.AGENTS:
        (this.agentIndex as unknown as { clear: () => void }).clear();
        break;
      case SearchIndexType.PLATFORMS:
        (this.platformIndex as unknown as { clear: () => void }).clear();
        break;
      case SearchIndexType.CONTENT:
        (this.contentIndex as unknown as { clear: () => void }).clear();
        break;
    }
  }

  /**
   * 清空所有索引
   */
  clearAll(): void {
    Object.values(SearchIndexType).forEach((type) => {
      this.clearIndex(type);
    });
  }

  /**
   * 获取是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * 搜索索引单例实例
 */
export const searchIndex = new SearchIndexManager();

export default searchIndex;
