// 文件路径: src/lib/db/sqlite.ts
// SQLite 数据库封装 - 智能体奥德赛项目
// 云端存储方案，提供用户数据、智能体元数据、同步日志等持久化能力

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 数据库单例
 */
let dbInstance: Database.Database | null = null;

/**
 * 数据库文件路径
 */
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'agents-odyssey.db');

/**
 * 初始化数据库
 * 创建数据库文件和所有表结构
 */
export function initDB(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // 确保数据目录存在
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // 启用 WAL 模式提升并发性能
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // 创建表
  createTables(db);

  dbInstance = db;
  return db;
}

/**
 * 创建所有数据库表
 */
function createTables(db: Database.Database): void {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      avatar TEXT,
      is_guest INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT
    )
  `);

  // 智能体表
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      prompt_config TEXT,
      workflow_config TEXT,
      version TEXT NOT NULL DEFAULT 'v0.1.0',
      iteration_count INTEGER NOT NULL DEFAULT 0,
      overall_score REAL,
      tags TEXT,
      author TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 智能体类型表
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT
    )
  `);

  // 第三方平台表
  db.exec(`
    CREATE TABLE IF NOT EXISTS third_party_platforms (
      id TEXT PRIMARY KEY,
      platform_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      website TEXT,
      api_docs_url TEXT,
      capability_matrix TEXT NOT NULL,
      is_bound INTEGER NOT NULL DEFAULT 0,
      api_config TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT
    )
  `);

  // 平台差异台账表（核心新增）
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_diff_ledger (
      id TEXT PRIMARY KEY,
      platform_key TEXT NOT NULL,
      component_type TEXT NOT NULL,
      supported INTEGER NOT NULL DEFAULT 0,
      support_level INTEGER NOT NULL DEFAULT 0,
      native_component_name TEXT,
      param_mapping TEXT,
      limitations TEXT,
      version TEXT NOT NULL DEFAULT 'v1.0.0',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      UNIQUE(platform_key, component_type),
      FOREIGN KEY (platform_key) REFERENCES third_party_platforms(platform_key)
    )
  `);

  // 分身部署记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS avatar_deployment_records (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      platform_key TEXT NOT NULL,
      avatar_name TEXT NOT NULL,
      platform_avatar_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      adaptation_status TEXT NOT NULL DEFAULT 'not_adapted',
      adapted_config TEXT,
      adaptation_rule_version TEXT,
      deployed_at TEXT,
      last_run_at TEXT,
      error_message TEXT,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(id),
      FOREIGN KEY (platform_key) REFERENCES third_party_platforms(platform_key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 工作流适配规则表（核心新增）
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_adaptation_rules (
      id TEXT PRIMARY KEY,
      source_platform TEXT NOT NULL DEFAULT 'universal',
      target_platform TEXT NOT NULL,
      rule_name TEXT NOT NULL,
      component_mappings TEXT NOT NULL,
      global_strategy TEXT,
      version TEXT NOT NULL DEFAULT 'v1.0.0',
      enabled INTEGER NOT NULL DEFAULT 1,
      success_rate REAL,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (target_platform) REFERENCES third_party_platforms(platform_key)
    )
  `);

  // 数据回收记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_collection_records (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      platform_key TEXT NOT NULL,
      deployment_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      started_at TEXT,
      completed_at TEXT,
      content_count INTEGER NOT NULL DEFAULT 0,
      data_size INTEGER,
      error_message TEXT,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(id),
      FOREIGN KEY (platform_key) REFERENCES third_party_platforms(platform_key),
      FOREIGN KEY (deployment_id) REFERENCES avatar_deployment_records(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 内容择优迭代表
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_selection_iterations (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      batch_number INTEGER NOT NULL,
      total_samples INTEGER NOT NULL DEFAULT 0,
      selected_samples INTEGER NOT NULL DEFAULT 0,
      selected_content_ids TEXT,
      filter_config TEXT,
      average_score REAL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 智能体量化迭代记录表（核心新增）
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_iteration_records (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      from_version TEXT NOT NULL,
      to_version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      before_scores TEXT,
      after_scores TEXT,
      score_improvement REAL,
      sample_count INTEGER NOT NULL DEFAULT 0,
      changes TEXT NOT NULL,
      before_config TEXT,
      after_config TEXT,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 索引缓存表
  db.exec(`
    CREATE TABLE IF NOT EXISTS index_cache (
      id TEXT PRIMARY KEY,
      cache_key TEXT NOT NULL UNIQUE,
      cache_type TEXT NOT NULL,
      cache_data TEXT NOT NULL,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT
    )
  `);

  // 同步日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sync_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      table_name TEXT NOT NULL,
      record_count INTEGER NOT NULL DEFAULT 0,
      started_at TEXT,
      ended_at TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ext TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
    CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
    CREATE INDEX IF NOT EXISTS idx_deployment_agent_id ON avatar_deployment_records(agent_id);
    CREATE INDEX IF NOT EXISTS idx_deployment_platform ON avatar_deployment_records(platform_key);
    CREATE INDEX IF NOT EXISTS idx_deployment_status ON avatar_deployment_records(status);
    CREATE INDEX IF NOT EXISTS idx_collection_agent_id ON data_collection_records(agent_id);
    CREATE INDEX IF NOT EXISTS idx_collection_platform ON data_collection_records(platform_key);
    CREATE INDEX IF NOT EXISTS idx_iteration_agent_id ON agent_iteration_records(agent_id);
    CREATE INDEX IF NOT EXISTS idx_iteration_status ON agent_iteration_records(status);
    CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON sync_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
    CREATE INDEX IF NOT EXISTS idx_platform_diff_platform ON platform_diff_ledger(platform_key);
    CREATE INDEX IF NOT EXISTS idx_adaptation_target ON workflow_adaptation_rules(target_platform);
  `);

  // 插入默认 guest 用户（如果不存在）
  const guestExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = ?').get('guest');
  if (!guestExists || (guestExists as Record<string, unknown>).count === 0) {
    db.exec(`
      INSERT OR IGNORE INTO users (id, username, email, is_guest, created_at, updated_at)
      VALUES ('guest', 'guest', '', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
  }
}

/**
 * 获取数据库实例
 */
export function getDB(): Database.Database {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 执行查询并返回结果
 */
export function query<T>(sql: string, params?: unknown[]): T[] {
  const db = getDB();
  const stmt = db.prepare(sql);
  return params ? stmt.all(...params) as T[] : stmt.all() as T[];
}

/**
 * 执行单条查询并返回第一个结果
 */
export function queryOne<T>(sql: string, params?: unknown[]): T | null {
  const db = getDB();
  const stmt = db.prepare(sql);
  const result = params ? stmt.get(...params) : stmt.get();
  return (result as T) || null;
}

/**
 * 执行插入/更新/删除操作
 */
export function execute(sql: string, params?: unknown[]): { changes: number; lastInsertRowid: number | bigint } {
  const db = getDB();
  const stmt = db.prepare(sql);
  const result = params ? stmt.run(...params) : stmt.run();
  return {
    changes: result.changes,
    lastInsertRowid: result.lastInsertRowid
  };
}

/**
 * 执行事务
 */
export function transaction<T>(fn: () => T): T {
  const db = getDB();
  const run = db.transaction(fn);
  return run();
}

export default {
  initDB,
  getDB,
  closeDB,
  query,
  queryOne,
  execute,
  transaction
};
