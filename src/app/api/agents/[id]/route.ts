// 文件路径: src/app/api/agents/[id]/route.ts
// 智能体详情 API 路由 - 智能体奥德赛项目
// 单个智能体的查询、更新、删除操作

import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db/sqlite';
import type { Agent, ApiResponse } from '@/types';
import { AgentType } from '@/types';

/**
 * GET /api/agents/[id]
 * 获取单个智能体详情
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const agent = queryOne<Record<string, unknown>>(
      'SELECT * FROM agents WHERE id = ?',
      [id]
    );

    if (!agent) {
      return NextResponse.json(
        { code: 404, message: '智能体不存在' } as ApiResponse,
        { status: 404 }
      );
    }

    const response: ApiResponse<Agent> = {
      code: 0,
      message: 'success',
      data: formatAgentFromDB(agent)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取智能体详情失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agents/[id]
 * 更新智能体
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查智能体是否存在
    const existing = queryOne<Record<string, unknown>>(
      'SELECT * FROM agents WHERE id = ?',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { code: 404, message: '智能体不存在' } as ApiResponse,
        { status: 404 }
      );
    }

    const { name, description, promptConfig, workflowConfig, tags, enabled } = body;
    const now = new Date().toISOString();

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (promptConfig !== undefined) {
      updateFields.push('prompt_config = ?');
      updateValues.push(JSON.stringify(promptConfig));
    }
    if (workflowConfig !== undefined) {
      updateFields.push('workflow_config = ?');
      updateValues.push(JSON.stringify(workflowConfig));
    }
    if (tags !== undefined) {
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(tags));
    }
    if (enabled !== undefined) {
      updateFields.push('enabled = ?');
      updateValues.push(enabled ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { code: 400, message: '没有需要更新的字段' } as ApiResponse,
        { status: 400 }
      );
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    execute(
      `UPDATE agents SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 查询更新后的智能体
    const updated = queryOne<Record<string, unknown>>(
      'SELECT * FROM agents WHERE id = ?',
      [id]
    );

    const response: ApiResponse<Agent> = {
      code: 0,
      message: '更新成功',
      data: updated ? formatAgentFromDB(updated) : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('更新智能体失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]
 * 删除智能体
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查智能体是否存在
    const existing = queryOne<Record<string, unknown>>(
      'SELECT * FROM agents WHERE id = ?',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { code: 404, message: '智能体不存在' } as ApiResponse,
        { status: 404 }
      );
    }

    execute('DELETE FROM agents WHERE id = ?', [id]);

    const response: ApiResponse = {
      code: 0,
      message: '删除成功'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('删除智能体失败:', error);
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
