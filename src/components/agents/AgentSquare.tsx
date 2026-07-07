// 文件路径: src/components/agents/AgentSquare.tsx
// 智能体广场组件 - 智能体奥德赛项目
// 展示主平台所有智能体本体、配置、迭代记录、量化得分等
// 支持部署状态、内容产出质量、资源消耗三维度筛选

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Tag,
  Button,
  Empty,
  Typography,
  Progress,
  Tooltip,
  Row,
  Col,
  Select,
  Space
} from 'antd';
import {
  PlusOutlined,
  RobotOutlined,
  ApiOutlined,
  EditOutlined,
  CloudServerOutlined,
  BarChartOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { Agent } from '@/types';
import { AgentType } from '@/types';
import { AGENT_TYPE_LABELS } from '@/constants';
import { formatDate, truncateText } from '@/utils';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 筛选维度接口
 */
interface FilterDimensions {
  deployStatus: string;
  contentQuality: string;
  resourceConsumption: string;
}

/**
 * 智能体广场属性接口
 */
interface AgentSquareProps {
  /** 智能体类型筛选 */
  agentType?: AgentType;
  /** 筛选维度 */
  filters?: FilterDimensions;
  /** 筛选变化回调 */
  onFilterChange?: (dimension: keyof FilterDimensions, value: string) => void;
}

/**
 * 扩展智能体数据（包含筛选维度模拟字段）
 */
interface ExtendedAgent extends Agent {
  deployStatus: '已部署' | '部署失败' | '未部署';
  contentQuality: '优' | '良' | '中' | '差';
  resourceConsumption: '高' | '中' | '低';
}

/**
 * 模拟智能体数据
 */
const mockAgents: ExtendedAgent[] = [
  {
    id: '1',
    name: '文案创作专家',
    description: '专业的营销文案、公众号文章、小红书种草文案创作智能体',
    type: AgentType.PROMPT,
    promptConfig: {
      systemPrompt: '你是一位专业的文案创作专家...',
      temperature: 0.8,
      maxTokens: 2048,
      model: 'gpt-4'
    },
    version: 'v1.2.3',
    iterationCount: 23,
    overallScore: 87.5,
    tags: ['文案', '营销', '创作'],
    enabled: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20'),
    deployStatus: '已部署',
    contentQuality: '优',
    resourceConsumption: '中'
  },
  {
    id: '2',
    name: '客户服务工作流',
    description: '自动化客户咨询处理、工单分配、常见问题解答工作流',
    type: AgentType.WORKFLOW,
    workflowConfig: {
      nodes: [],
      edges: [],
      variables: {}
    },
    version: 'v2.0.1',
    iterationCount: 15,
    overallScore: 92.3,
    tags: ['客服', '自动化', '工单'],
    enabled: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-18'),
    deployStatus: '已部署',
    contentQuality: '优',
    resourceConsumption: '低'
  },
  {
    id: '3',
    name: '数据分析助手',
    description: '数据清洗、可视化报告生成、趋势分析智能体',
    type: AgentType.PROMPT,
    promptConfig: {
      systemPrompt: '你是一位数据分析师...',
      temperature: 0.5,
      maxTokens: 4096,
      model: 'gpt-4'
    },
    version: 'v1.0.5',
    iterationCount: 8,
    overallScore: 78.2,
    tags: ['数据', '分析', '报告'],
    enabled: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-10'),
    deployStatus: '未部署',
    contentQuality: '良',
    resourceConsumption: '高'
  },
  {
    id: '4',
    name: '内容审核流水线',
    description: '多维度内容安全审核、质量评估、合规检查工作流',
    type: AgentType.WORKFLOW,
    workflowConfig: {
      nodes: [],
      edges: [],
      variables: {}
    },
    version: 'v1.5.0',
    iterationCount: 12,
    overallScore: 85.6,
    tags: ['审核', '合规', '质量'],
    enabled: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-15'),
    deployStatus: '部署失败',
    contentQuality: '中',
    resourceConsumption: '中'
  },
  {
    id: '5',
    name: '智能问答机器人',
    description: '基于知识库的智能问答、FAQ自动回复智能体',
    type: AgentType.PROMPT,
    promptConfig: {
      systemPrompt: '你是一个智能问答助手...',
      temperature: 0.7,
      maxTokens: 2048,
      model: 'gpt-4'
    },
    version: 'v1.3.2',
    iterationCount: 18,
    overallScore: 82.1,
    tags: ['问答', '知识库', '客服'],
    enabled: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-25'),
    deployStatus: '已部署',
    contentQuality: '良',
    resourceConsumption: '低'
  },
  {
    id: '6',
    name: '自动化测试流程',
    description: '测试用例生成、执行、报告生成自动化工作流',
    type: AgentType.WORKFLOW,
    workflowConfig: {
      nodes: [],
      edges: [],
      variables: {}
    },
    version: 'v2.1.0',
    iterationCount: 25,
    overallScore: 91.8,
    tags: ['测试', '自动化', '质量'],
    enabled: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-03-28'),
    deployStatus: '未部署',
    contentQuality: '差',
    resourceConsumption: '高'
  }
];

/**
 * 获取部署状态标签颜色
 */
const getDeployStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    '已部署': 'success',
    '部署失败': 'error',
    '未部署': 'default'
  };
  return colors[status] || 'default';
};

/**
 * 获取内容质量标签颜色
 */
const getContentQualityColor = (quality: string): string => {
  const colors: Record<string, string> = {
    '优': 'green',
    '良': 'blue',
    '中': 'orange',
    '差': 'red'
  };
  return colors[quality] || 'default';
};

/**
 * 获取资源消耗标签颜色
 */
const getResourceConsumptionColor = (consumption: string): string => {
  const colors: Record<string, string> = {
    '高': 'red',
    '中': 'orange',
    '低': 'green'
  };
  return colors[consumption] || 'default';
};

/**
 * 智能体广场组件
 * 展示主平台所有智能体本体信息，支持多维度筛选
 */
const AgentSquare: React.FC<AgentSquareProps> = ({ agentType, filters, onFilterChange }) => {
  const router = useRouter();
  const [agents, setAgents] = useState<ExtendedAgent[]>([]);
  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = mockAgents;

      // 按类型筛选
      if (agentType) {
        filtered = filtered.filter((a) => a.type === agentType);
      }

      // 按部署状态筛选
      if (filters?.deployStatus && filters.deployStatus !== '全部') {
        filtered = filtered.filter((a) => a.deployStatus === filters.deployStatus);
      }

      // 按内容产出质量筛选
      if (filters?.contentQuality && filters.contentQuality !== '全部') {
        filtered = filtered.filter((a) => a.contentQuality === filters.contentQuality);
      }

      // 按资源消耗筛选
      if (filters?.resourceConsumption && filters.resourceConsumption !== '全部') {
        filtered = filtered.filter((a) => a.resourceConsumption === filters.resourceConsumption);
      }

      setAgents(filtered);
      setLoading(false);
    }, 300);
  }, [agentType, filters]);

  /**
   * 渲染智能体卡片
   */
  const renderAgentCard = (agent: ExtendedAgent) => (
    <Card
      key={agent.id}
      hoverable
      style={{ height: '100%', cursor: 'pointer' }}
      styles={{
        body: {
          padding: 16,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      actions={[
        <Tooltip title="编辑" key="edit">
          <EditOutlined onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}`); }} />
        </Tooltip>,
        <Tooltip title="部署分身" key="deploy">
          <CloudServerOutlined onClick={(e) => { e.stopPropagation(); router.push(`/platforms/deploy?agentId=${agent.id}`); }} />
        </Tooltip>,
        <Tooltip title="查看迭代" key="iteration">
          <BarChartOutlined onClick={(e) => { e.stopPropagation(); router.push(`/agents/${agent.id}#iterations`); }} />
        </Tooltip>
      ]}
      onClick={() => router.push(`/agents/${agent.id}`)}
    >
      {/* 头部：类型图标 + 名称 + 类型标签 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {agent.type === AgentType.PROMPT ? (
            <RobotOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          ) : (
            <ApiOutlined style={{ fontSize: 20, color: '#52c41a' }} />
          )}
          <Title level={5} style={{ margin: 0, flex: 1 }}>
            {agent.name}
          </Title>
          <Tag color={agent.type === AgentType.PROMPT ? 'blue' : 'green'}>
            {AGENT_TYPE_LABELS[agent.type]}
          </Tag>
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {truncateText(agent.description || '', 60)}
        </Text>
      </div>

      {/* 标签 */}
      <div style={{ marginBottom: 12 }}>
        {(agent.tags || []).slice(0, 3).map((tag) => (
          <Tag key={tag} style={{ marginBottom: 4 }}>
            {tag}
          </Tag>
        ))}
      </div>

      {/* 综合得分 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>综合得分</Text>
          <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
            {agent.overallScore?.toFixed(1)}
          </Text>
        </div>
        <Progress
          percent={agent.overallScore || 0}
          size="small"
          showInfo={false}
          strokeColor={{
            '0%': '#1677ff',
            '100%': '#52c41a'
          }}
        />
      </div>

      {/* 筛选维度标签 */}
      <div style={{ marginBottom: 12 }}>
        <Space size={4}>
          <Tag color={getDeployStatusColor(agent.deployStatus)}>{agent.deployStatus}</Tag>
          <Tag color={getContentQualityColor(agent.contentQuality)}>{agent.contentQuality}</Tag>
          <Tag color={getResourceConsumptionColor(agent.resourceConsumption)}>{agent.resourceConsumption}</Tag>
        </Space>
      </div>

      {/* 底部信息 */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: '#8c8c8c'
        }}
      >
        <span>版本 {agent.version}</span>
        <span>迭代 {agent.iterationCount} 次</span>
      </div>
      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
        更新于 {formatDate(agent.updatedAt, 'YYYY-MM-DD')}
      </div>
    </Card>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>
      {/* 顶部操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          智能体广场
          <Text type="secondary" style={{ fontSize: 14, marginLeft: 8, fontWeight: 'normal' }}>
            共 {agents.length} 个智能体
          </Text>
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/agents/create')}>
          新建智能体
        </Button>
      </div>

      {/* 筛选维度下拉框 */}
      {onFilterChange && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: '#fafafa',
            borderRadius: 8
          }}
        >
          <Space size={8}>
            <FilterOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 14 }}>筛选维度:</Text>
          </Space>
          <Row gutter={16} style={{ marginTop: 12 }}>
            <Col xs={24} sm={8} md={6}>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>部署状态</Text>
              <Select
                value={filters?.deployStatus || '全部'}
                onChange={(value) => onFilterChange('deployStatus', value)}
                style={{ width: '100%' }}
              >
                <Option value="全部">全部</Option>
                <Option value="已部署">已部署</Option>
                <Option value="部署失败">部署失败</Option>
                <Option value="未部署">未部署</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>内容产出质量</Text>
              <Select
                value={filters?.contentQuality || '全部'}
                onChange={(value) => onFilterChange('contentQuality', value)}
                style={{ width: '100%' }}
              >
                <Option value="全部">全部</Option>
                <Option value="优">优</Option>
                <Option value="良">良</Option>
                <Option value="中">中</Option>
                <Option value="差">差</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>资源消耗</Text>
              <Select
                value={filters?.resourceConsumption || '全部'}
                onChange={(value) => onFilterChange('resourceConsumption', value)}
                style={{ width: '100%' }}
              >
                <Option value="全部">全部</Option>
                <Option value="高">高</Option>
                <Option value="中">中</Option>
                <Option value="低">低</Option>
              </Select>
            </Col>
          </Row>
        </div>
      )}

      {/* 智能体列表 */}
      {agents.length > 0 ? (
        <Row gutter={[16, 16]}>
          {agents.map((agent) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={agent.id}>
              {renderAgentCard(agent)}
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description={agentType ? `暂无${AGENT_TYPE_LABELS[agentType]}` : '暂无智能体'}
          style={{ marginTop: 60 }}
        />
      )}
    </div>
  );
};

export default AgentSquare;