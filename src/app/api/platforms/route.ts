// 文件路径: src/app/api/platforms/route.ts
// 第三方平台 API 路由 - 智能体奥德赛项目
// 平台列表查询、平台详情、差异台账查询

import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db/sqlite';
import type { ThirdPartyPlatform, ApiResponse, PaginatedResponse, PlatformComponentSupport } from '@/types';
import { PlatformRegion, PlatformType } from '@/types';
import { generateId } from '@/utils';
import { DEFAULT_PAGINATION, MAX_PAGE_SIZE } from '@/constants';

/**
 * GET /api/platforms
 * 获取第三方平台列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || String(DEFAULT_PAGINATION.page), 10);
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGINATION.pageSize), 10),
      MAX_PAGE_SIZE
    );
    const region = searchParams.get('region');
    const isBound = searchParams.get('isBound');
    const keyword = searchParams.get('keyword');

    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (region) {
      whereClause += ' AND region = ?';
      params.push(region);
    }

    if (isBound !== null && isBound !== undefined && isBound !== '') {
      whereClause += ' AND is_bound = ?';
      params.push(isBound === 'true' ? 1 : 0);
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR platform_key LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 查询总数
    const countResult = queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM third_party_platforms ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    // 查询分页数据
    const offset = (page - 1) * pageSize;
    const platforms = query<Record<string, unknown>>(
      `SELECT * FROM third_party_platforms ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // 转换为前端格式
    const formattedPlatforms = platforms.map((p) => formatPlatformFromDB(p));

    const response: ApiResponse<PaginatedResponse<ThirdPartyPlatform>> = {
      code: 0,
      message: 'success',
      data: {
        list: formattedPlatforms,
        total,
        page,
        pageSize
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取平台列表失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/platforms
 * 新增平台（管理用）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platformKey, name, region, description, website, capabilityMatrix } = body;

    if (!platformKey || !name || !region) {
      return NextResponse.json(
        { code: 400, message: '平台标识、名称、区域不能为空' } as ApiResponse,
        { status: 400 }
      );
    }

    // 检查平台是否已存在
    const existing = queryOne(
      'SELECT id FROM third_party_platforms WHERE platform_key = ?',
      [platformKey]
    );

    if (existing) {
      return NextResponse.json(
        { code: 400, message: '平台已存在' } as ApiResponse,
        { status: 400 }
      );
    }

    const id = generateId();
    const now = new Date().toISOString();

    execute(
      `INSERT INTO third_party_platforms (id, platform_key, name, region, description, website, capability_matrix, is_bound, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        id,
        platformKey,
        name,
        region,
        description || '',
        website || '',
        JSON.stringify(capabilityMatrix || {}),
        now,
        now
      ]
    );

    // 查询新创建的平台
    const newPlatform = queryOne<Record<string, unknown>>(
      'SELECT * FROM third_party_platforms WHERE id = ?',
      [id]
    );

    const response: ApiResponse<ThirdPartyPlatform> = {
      code: 0,
      message: '创建成功',
      data: newPlatform ? formatPlatformFromDB(newPlatform) : undefined
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('创建平台失败:', error);
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * 从数据库格式转换为前端格式
 */
function formatPlatformFromDB(row: Record<string, unknown>): ThirdPartyPlatform {
  const capabilityMatrix = row.capability_matrix
    ? JSON.parse(row.capability_matrix as string)
    : {
        componentGranularity: 0,
        loopSupport: false,
        branchSupport: false,
        batchSupport: false,
        ragNative: false,
        pluginOpenness: 0,
        authComplexity: 0,
        logGranularity: 0,
        autoExecution: false,
        privateDeployment: false,
        components: [] as PlatformComponentSupport[]
      };

  return {
    id: row.id as string,
    platformKey: row.platform_key as PlatformType,
    name: row.name as string,
    region: row.region as PlatformRegion,
    description: (row.description as string) || undefined,
    logo: (row.logo as string) || undefined,
    website: (row.website as string) || undefined,
    apiDocsUrl: (row.api_docs_url as string) || undefined,
    capabilityMatrix,
    isBound: Boolean(row.is_bound),
    apiConfig: row.api_config ? JSON.parse(row.api_config as string) : undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    ext: row.ext ? JSON.parse(row.ext as string) : undefined
  };
}
