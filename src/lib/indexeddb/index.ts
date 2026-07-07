// 文件路径: src/lib/indexeddb/index.ts
// IndexedDB 本地存储封装 - 智能体奥德赛项目
// 提供离线优先的数据持久化能力，支持全量数据本地存储与高速检索

import { INDEXEDDB_NAME, INDEXEDDB_VERSION, DB_STORES } from '@/constants';
import type {
  Agent,
  ThirdPartyPlatform,
  AvatarDeploymentRecord,
  WorkflowAdaptationRule,
  DataCollectionRecord,
  AgentIterationRecord,
  ContentSelectionIteration,
  QualityContentSample,
  User,
  SyncLog,
  IndexCache,
  SyncQueueItem,
  PaginationParams,
  PaginatedResponse
} from '@/types';

/**
 * 存储对象名称类型
 */
type StoreName = typeof DB_STORES[keyof typeof DB_STORES];

/**
 * 数据库单例实例
 */
let dbInstance: IDBDatabase | null = null;

/**
 * 数据库初始化 Promise
 * 用于确保数据库初始化完成后再执行操作
 */
let initPromise: Promise<IDBDatabase> | null = null;

/**
 * 初始化 IndexedDB 数据库
 * 创建所有必要的对象存储和索引
 * @returns 数据库实例 Promise
 */
export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION);

    request.onerror = () => {
      reject(request.error);
      initPromise = null;
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        initPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 智能体表
      if (!db.objectStoreNames.contains(DB_STORES.AGENTS)) {
        const store = db.createObjectStore(DB_STORES.AGENTS, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('version', 'version', { unique: false });
      }

      // 第三方平台表
      if (!db.objectStoreNames.contains(DB_STORES.PLATFORMS)) {
        const store = db.createObjectStore(DB_STORES.PLATFORMS, { keyPath: 'id' });
        store.createIndex('platformKey', 'platformKey', { unique: true });
        store.createIndex('region', 'region', { unique: false });
        store.createIndex('isBound', 'isBound', { unique: false });
      }

      // 分身部署记录表
      if (!db.objectStoreNames.contains(DB_STORES.DEPLOYMENT_RECORDS)) {
        const store = db.createObjectStore(DB_STORES.DEPLOYMENT_RECORDS, { keyPath: 'id' });
        store.createIndex('agentId', 'agentId', { unique: false });
        store.createIndex('platformKey', 'platformKey', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('adaptationStatus', 'adaptationStatus', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 工作流适配规则表
      if (!db.objectStoreNames.contains(DB_STORES.ADAPTATION_RULES)) {
        const store = db.createObjectStore(DB_STORES.ADAPTATION_RULES, { keyPath: 'id' });
        store.createIndex('targetPlatform', 'targetPlatform', { unique: false });
        store.createIndex('sourcePlatform', 'sourcePlatform', { unique: false });
        store.createIndex('version', 'version', { unique: false });
        store.createIndex('enabled', 'enabled', { unique: false });
      }

      // 数据回收记录表
      if (!db.objectStoreNames.contains(DB_STORES.COLLECTION_RECORDS)) {
        const store = db.createObjectStore(DB_STORES.COLLECTION_RECORDS, { keyPath: 'id' });
        store.createIndex('agentId', 'agentId', { unique: false });
        store.createIndex('platformKey', 'platformKey', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 智能体量化迭代记录表
      if (!db.objectStoreNames.contains(DB_STORES.ITERATION_RECORDS)) {
        const store = db.createObjectStore(DB_STORES.ITERATION_RECORDS, { keyPath: 'id' });
        store.createIndex('agentId', 'agentId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('fromVersion', 'fromVersion', { unique: false });
        store.createIndex('toVersion', 'toVersion', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 内容择优迭代表
      if (!db.objectStoreNames.contains(DB_STORES.CONTENT_SELECTIONS)) {
        const store = db.createObjectStore(DB_STORES.CONTENT_SELECTIONS, { keyPath: 'id' });
        store.createIndex('agentId', 'agentId', { unique: false });
        store.createIndex('batchNumber', 'batchNumber', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 优质内容样本表
      if (!db.objectStoreNames.contains(DB_STORES.QUALITY_SAMPLES)) {
        const store = db.createObjectStore(DB_STORES.QUALITY_SAMPLES, { keyPath: 'id' });
        store.createIndex('agentId', 'agentId', { unique: false });
        store.createIndex('platformKey', 'platformKey', { unique: false });
        store.createIndex('overallScore', 'overallScore', { unique: false });
        store.createIndex('isPlatformBias', 'isPlatformBias', { unique: false });
        store.createIndex('collectedAt', 'collectedAt', { unique: false });
      }

      // 用户表
      if (!db.objectStoreNames.contains(DB_STORES.USERS)) {
        const store = db.createObjectStore(DB_STORES.USERS, { keyPath: 'id' });
        store.createIndex('username', 'username', { unique: true });
        store.createIndex('isGuest', 'isGuest', { unique: false });
      }

      // 同步日志表
      if (!db.objectStoreNames.contains(DB_STORES.SYNC_LOGS)) {
        const store = db.createObjectStore(DB_STORES.SYNC_LOGS, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('syncType', 'syncType', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('tableName', 'tableName', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 索引缓存表
      if (!db.objectStoreNames.contains(DB_STORES.INDEX_CACHE)) {
        const store = db.createObjectStore(DB_STORES.INDEX_CACHE, { keyPath: 'id' });
        store.createIndex('cacheKey', 'cacheKey', { unique: true });
        store.createIndex('cacheType', 'cacheType', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }

      // 同步队列表
      if (!db.objectStoreNames.contains(DB_STORES.SYNC_QUEUE)) {
        const store = db.createObjectStore(DB_STORES.SYNC_QUEUE, { keyPath: 'id' });
        store.createIndex('tableName', 'tableName', { unique: false });
        store.createIndex('operation', 'operation', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return initPromise;
}

/**
 * 获取数据库实例
 * @returns 数据库实例
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  return initDB();
}

/**
 * 执行事务操作的通用方法
 * @param storeName 存储对象名称
 * @param mode 事务模式：只读/读写
 * @param callback 事务回调函数
 * @returns 操作结果 Promise
 */
async function executeTransaction<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | T
): Promise<T> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let result: T;
    try {
      const requestOrResult = callback(store);

      if (requestOrResult instanceof IDBRequest) {
        requestOrResult.onsuccess = () => {
          result = requestOrResult.result;
        };
        requestOrResult.onerror = () => {
          reject(requestOrResult.error);
        };
      } else {
        result = requestOrResult;
      }
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => {
      resolve(result);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(transaction.error);
    };
  });
}

// ==================== 通用 CRUD 操作 ====================

/**
 * 向指定存储对象添加数据
 * @param storeName 存储对象名称
 * @param data 要添加的数据
 * @returns 添加后的记录
 */
export async function addRecord<T extends { id: string }>(storeName: StoreName, data: T): Promise<T> {
  const now = new Date();
  const record = {
    ...data,
    createdAt: (data as Record<string, unknown>).createdAt ?? now,
    updatedAt: now
  } as T;

  await executeTransaction(storeName, 'readwrite', (store) => {
    return store.add(record);
  });

  return record;
}

/**
 * 更新指定存储对象的数据
 * @param storeName 存储对象名称
 * @param data 要更新的数据（必须包含 id）
 * @returns 更新后的记录
 */
export async function updateRecord<T extends { id: string }>(storeName: StoreName, data: T): Promise<T> {
  const now = new Date();
  const record = {
    ...data,
    updatedAt: now
  } as T;

  await executeTransaction(storeName, 'readwrite', (store) => {
    return store.put(record);
  });

  return record;
}

/**
 * 根据 ID 获取记录
 * @param storeName 存储对象名称
 * @param id 记录 ID
 * @returns 记录数据，不存在则返回 null
 */
export async function getRecord<T>(storeName: StoreName, id: string): Promise<T | null> {
  return executeTransaction<T | null>(storeName, 'readonly', (store) => {
    const request = store.get(id);
    return new Promise<T | null>((resolve) => {
      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    }) as unknown as IDBRequest<T | null>;
  });
}

/**
 * 根据 ID 删除记录
 * @param storeName 存储对象名称
 * @param id 记录 ID
 */
export async function deleteRecord(storeName: StoreName, id: string): Promise<void> {
  await executeTransaction(storeName, 'readwrite', (store) => {
    return store.delete(id);
  });
}

/**
 * 获取指定存储对象的所有记录
 * @param storeName 存储对象名称
 * @returns 所有记录数组
 */
export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  return executeTransaction<T[]>(storeName, 'readonly', (store) => {
    const request = store.getAll();
    return new Promise<T[]>((resolve) => {
      request.onsuccess = () => {
        resolve(request.result ?? []);
      };
    }) as unknown as IDBRequest<T[]>;
  });
}

/**
 * 分页查询记录
 * @param storeName 存储对象名称
 * @param params 分页参数
 * @param filterFn 可选的过滤函数
 * @returns 分页结果
 */
export async function getPaginatedRecords<T>(
  storeName: StoreName,
  params: PaginationParams,
  filterFn?: (item: T) => boolean
): Promise<PaginatedResponse<T>> {
  const allRecords = await getAllRecords<T>(storeName);

  let filteredRecords = allRecords;
  if (filterFn) {
    filteredRecords = allRecords.filter(filterFn);
  }

  // 排序
  if (params.sortBy) {
    filteredRecords.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[params.sortBy as string];
      const bVal = (b as Record<string, unknown>)[params.sortBy as string];

      if (aVal == null || bVal == null) return 0;

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  } else {
    // 默认按创建时间倒序
    filteredRecords.sort((a, b) => {
      const aDate = new Date((a as Record<string, unknown>).createdAt as string).getTime();
      const bDate = new Date((b as Record<string, unknown>).createdAt as string).getTime();
      return bDate - aDate;
    });
  }

  const total = filteredRecords.length;
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const list = filteredRecords.slice(start, end);

  return {
    list,
    total,
    page: params.page,
    pageSize: params.pageSize
  };
}

/**
 * 批量添加记录
 * @param storeName 存储对象名称
 * @param records 记录数组
 * @returns 添加后的记录数组
 */
export async function bulkAddRecords<T extends { id: string }>(
  storeName: StoreName,
  records: T[]
): Promise<T[]> {
  const db = await getDB();
  const now = new Date();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const results: T[] = [];

    records.forEach((record) => {
      const data = {
        ...record,
        createdAt: (record as Record<string, unknown>).createdAt ?? now,
        updatedAt: now
      } as T;

      const request = store.add(data);
      request.onsuccess = () => {
        results.push(data);
      };
      request.onerror = () => {
        transaction.abort();
      };
    });

    transaction.oncomplete = () => {
      resolve(results);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

/**
 * 清空指定存储对象的所有数据
 * @param storeName 存储对象名称
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  await executeTransaction(storeName, 'readwrite', (store) => {
    return store.clear();
  });
}

/**
 * 获取存储对象的记录数
 * @param storeName 存储对象名称
 * @returns 记录数
 */
export async function countRecords(storeName: StoreName): Promise<number> {
  return executeTransaction<number>(storeName, 'readonly', (store) => {
    const request = store.count();
    return new Promise<number>((resolve) => {
      request.onsuccess = () => {
        resolve(request.result ?? 0);
      };
    }) as unknown as IDBRequest<number>;
  });
}

// ==================== 同步队列操作 ====================

/**
 * 添加同步队列项
 * @param item 同步队列项
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
  const queueItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    retryCount: 0
  };

  await executeTransaction(DB_STORES.SYNC_QUEUE, 'readwrite', (store) => {
    return store.add(queueItem);
  });
}

/**
 * 获取所有待同步的队列项
 * @returns 同步队列项数组
 */
export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  return getAllRecords<SyncQueueItem>(DB_STORES.SYNC_QUEUE);
}

/**
 * 从同步队列中移除已完成的项
 * @param id 队列项 ID
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  await deleteRecord(DB_STORES.SYNC_QUEUE, id);
}

/**
 * 更新同步队列项的重试次数
 * @param id 队列项 ID
 */
export async function incrementSyncRetryCount(id: string): Promise<void> {
  const item = await getRecord<SyncQueueItem>(DB_STORES.SYNC_QUEUE, id);
  if (item) {
    item.retryCount += 1;
    await updateRecord(DB_STORES.SYNC_QUEUE, item);
  }
}

// ==================== 数据库管理操作 ====================

/**
 * 关闭数据库连接
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    initPromise = null;
  }
}

/**
 * 删除数据库（慎用！）
 */
export async function deleteDB(): Promise<void> {
  closeDB();

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.deleteDatabase(INDEXEDDB_NAME);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ==================== 类型导出 ====================

export type {
  Agent,
  ThirdPartyPlatform,
  AvatarDeploymentRecord,
  WorkflowAdaptationRule,
  DataCollectionRecord,
  AgentIterationRecord,
  ContentSelectionIteration,
  QualityContentSample,
  User,
  SyncLog,
  IndexCache,
  SyncQueueItem
};
