// 文件路径: src/app/api/agents/route.ts
// 智能体 API 路由 - 智能体奥德赛项目
// 智能体 CRUD 操作接口

import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db/sqlite';
import type { Agent, ApiResponse, PaginatedResponse } from '@/types';
import { AgentType } from '@/types';
import { generateId } from '@/utils';
import { DEFAULT_PAGINATION, MAX_PAGE_SIZE } from '@/constants';

/**
 * GET /api/agents
 * 获取智能体列表（分页）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || String(DEFAULT_PAGINATION.page), 10);
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGINATION.pageSize), 10),
      MAX_PAGE_SIZE
    );
    const type = searchParams.get('type');
    const keyword = searchParams.get('keyword');

    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 查询总数
    const countResult = queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM agents ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    // 查询分页数据
    const offset = (page - 1) * pageSize;
    const agents = query<Record<string, unknown>>(
      `SELECT * FROM agents ${whereClause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // 转换为前端格式
    const formattedAgents = agents.map((agent) => formatAgentFromDB(agent));

    const response: ApiResponse<PaginatedResponse<Agent>> = {
      code: 0,
      message: 'success',
      data: {
        list: formattedAgents,
        total,
        page,
        pageSize
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取智能体列表失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * 创建新智能体
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, type, promptConfig, workflowConfig, tags } = body;

    if (!name || !type) {
      return NextResponse.json(
        { code: 400, message: '名称和类型不能为空' } as ApiResponse,
        { status: 400 }
      );
    }

    if (!Object.values(AgentType).includes(type as AgentType)) {
      return NextResponse.json(
        { code: 400, message: '无效的智能体类型' } as ApiResponse,
        { status: 400 }
      );
    }

    const id = generateId();
    const now = new Date().toISOString();

    execute(
      `INSERT INTO agents (id, name, description, type, prompt_config, workflow_config, version, iteration_count, tags, enabled, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 1, 'guest', ?, ?)`,
      [
        id,
        name,
        description || '',
        type,
        promptConfig ? JSON.stringify(promptConfig) : null,
        workflowConfig ? JSON.stringify(workflowConfig) : null,
        'v0.1.0',
        tags ? JSON.stringify(tags) : null,
        now,
        now
      ]
    );

    // 查询新创建的智能体
    const newAgent = queryOne<Record<string, unknown>>(
      'SELECT * FROM agents WHERE id = ?',
      [id]
    );

    const response: ApiResponse<Agent> = {
      code: 0,
      message: '创建成功',
      data: newAgent ? formatAgentFromDB(newAgent) : undefined
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('创建智能体失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * 从数据库格式转换为前端格式
 */
function formatAgentFromDB(row: Record<string, unknown>): Agent {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    type: row.type as AgentType,
    promptConfig: row.prompt_config ? JSON.parse(row.prompt_config as string) : undefined,
    workflowConfig: row.workflow_config ? JSON.parse(row.workflow_config as string) : undefined,
    version: row.version as string,
    iterationCount: row.iteration_count as number,
    overallScore: (row.overall_score as number) || undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : undefined,
    author: (row.author as string) || undefined,
    enabled: Boolean(row.enabled),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    ext: row.ext ? JSON.parse(row.ext as string) : undefined
  };
}
