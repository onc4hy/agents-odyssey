// 文件路径: src/app/agents/[id]/page.tsx
// 智能体详情页面 - 智能体奥德赛项目
// 展示单个智能体的完整信息、配置、迭代记录和部署状态

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Tabs,
  Tag,
  Button,
  Space,
  Typography,
  Progress,
  Descriptions,
  Table,
  Empty,
  Spin,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CloudServerOutlined,
  BarChartOutlined,
  RobotOutlined,
  ApiOutlined,
  DashOutlined
} from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import type { Agent, AgentIterationRecord, AvatarDeploymentRecord, QuantificationScores } from '@/types';
import { AgentType, DeploymentStatus, IterationStatus } from '@/types';
import { AGENT_TYPE_LABELS } from '@/constants';
import { formatDate, truncateText } from '@/utils';

const { Title, Text } = Typography;

/**
 * 智能体详情内容组件
 */
const AgentDetailContent: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  /**
   * 模拟智能体数据
   */
  const mockAgent: Agent = {
    id: id,
    name: '文案创作专家',
    description: '专业的营销文案、公众号文章、小红书种草文案创作智能体，支持多平台内容生成与优化。',
    type: AgentType.PROMPT,
    promptConfig: {
      systemPrompt: '你是一位专业的文案创作专家，精通各类营销文案、公众号文章、小红书种草文案的写作技巧。',
      userPromptTemplate: '请为产品「{{product}}」创作一篇{{platform}}平台的{{contentType}}文案。',
      persona: '年轻时尚的营销达人',
      outputRules: ['语言生动活泼', '突出产品卖点', '符合平台调性', '控制在500字以内'],
      temperature: 0.8,
      maxTokens: 2048,
      model: 'gpt-4'
    },
    version: 'v1.2.3',
    iterationCount: 23,
    overallScore: 87.5,
    tags: ['文案', '营销', '创作', '多平台'],
    author: '张三',
    enabled: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20')
  };

  /**
   * 模拟迭代记录数据
   */
  const mockIterations: AgentIterationRecord[] = [
    {
      id: 'iter-1',
      agentId: id,
      fromVersion: 'v1.2.2',
      toVersion: 'v1.2.3',
      status: IterationStatus.COMPLETED,
      beforeScores: { contentQuality: 85, taskSuccessRate: 82, executionSpeed: 78, resourceEfficiency: 80, promptAccuracy: 88, workflowStability: 90 },
      afterScores: { contentQuality: 88, taskSuccessRate: 85, executionSpeed: 80, resourceEfficiency: 82, promptAccuracy: 90, workflowStability: 92 },
      scoreImprovement: 3.5,
      sampleCount: 50,
      changes: '优化了系统提示词，增强了产品卖点识别能力',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    },
    {
      id: 'iter-2',
      agentId: id,
      fromVersion: 'v1.2.1',
      toVersion: 'v1.2.2',
      status: IterationStatus.COMPLETED,
      beforeScores: { contentQuality: 82, taskSuccessRate: 78, executionSpeed: 75, resourceEfficiency: 78, promptAccuracy: 85, workflowStability: 88 },
      afterScores: { contentQuality: 85, taskSuccessRate: 82, executionSpeed: 78, resourceEfficiency: 80, promptAccuracy: 88, workflowStability: 90 },
      scoreImprovement: 3.2,
      sampleCount: 45,
      changes: '增加了小红书平台专属文案模板',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }
  ];

  /**
   * 模拟部署记录数据
   */
  const mockDeployments: AvatarDeploymentRecord[] = [
    {
      id: 'deploy-1',
      agentId: id,
      platformKey: 'coze' as any,
      avatarName: '文案创作专家-扣子',
      platformAvatarId: 'coze-avatar-123',
      status: DeploymentStatus.DEPLOYED,
      adaptationStatus: 'adapted' as any,
      deployedAt: new Date('2024-03-10'),
      lastRunAt: new Date('2024-03-20'),
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-20')
    },
    {
      id: 'deploy-2',
      agentId: id,
      platformKey: 'dify' as any,
      avatarName: '文案创作专家-Dify',
      platformAvatarId: 'dify-avatar-456',
      status: DeploymentStatus.DEPLOYED,
      adaptationStatus: 'adapted' as any,
      deployedAt: new Date('2024-03-08'),
      lastRunAt: new Date('2024-03-19'),
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-19')
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAgent(mockAgent);
      setLoading(false);
    }, 300);
  }, [id]);

  /**
   * 返回列表
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * 编辑智能体
   */
  const handleEdit = () => {
    router.push(`/agents/create?type=${agent?.type}`);
  };

  /**
   * 删除智能体
   */
  const handleDelete = () => {
    router.push('/agents');
  };

  /**
   * 部署分身
   */
  const handleDeploy = () => {
    router.push(`/platforms/deploy?agentId=${id}`);
  };

  /**
   * 渲染量化得分
   */
  const renderScores = (scores: QuantificationScores) => {
    const scoreItems = [
      { key: 'contentQuality', label: '内容质量', value: scores.contentQuality },
      { key: 'taskSuccessRate', label: '任务成功率', value: scores.taskSuccessRate },
      { key: 'executionSpeed', label: '执行速度', value: scores.executionSpeed },
      { key: 'resourceEfficiency', label: '资源效率', value: scores.resourceEfficiency },
      { key: 'promptAccuracy', label: 'Prompt准确率', value: scores.promptAccuracy },
      { key: 'workflowStability', label: '工作流稳定性', value: scores.workflowStability }
    ];

    return (
      <div>
        {scoreItems.map((item) => (
          <div key={item.key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>{item.label}</Text>
              <Text strong>{item.value}</Text>
            </div>
            <Progress
              percent={item.value}
              size="small"
              showInfo={false}
              strokeColor={{
                '0%': '#1677ff',
                '100%': '#52c41a'
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading || !agent) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
      {/* 页面头部 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginRight: 12 }}>
          返回
        </Button>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {agent.type === AgentType.PROMPT ? (
              <RobotOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            ) : (
              <ApiOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            )}
            {agent.name}
            <Tag color={agent.type === AgentType.PROMPT ? 'blue' : 'green'}>
              {AGENT_TYPE_LABELS[agent.type]}
            </Tag>
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {truncateText(agent.description || '', 80)}
          </Text>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
          <Button type="primary" icon={<CloudServerOutlined />} onClick={handleDeploy}>部署分身</Button>
          <Button danger icon={<DashOutlined />} onClick={handleDelete}>删除</Button>
        </Space>
      </div>

      {/* 详情内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" items={[
        {
          key: 'info',
          label: '基本信息',
          children: (
            <Card>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="智能体名称">{agent.name}</Descriptions.Item>
                <Descriptions.Item label="智能体类型">
                  <Tag color={agent.type === AgentType.PROMPT ? 'blue' : 'green'}>
                    {AGENT_TYPE_LABELS[agent.type]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="版本">{agent.version}</Descriptions.Item>
                <Descriptions.Item label="迭代次数">{agent.iterationCount} 次</Descriptions.Item>
                <Descriptions.Item label="综合得分">
                  <Text strong style={{ fontSize: 20, color: '#1677ff' }}>{agent.overallScore?.toFixed(1)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={agent.enabled ? 'green' : 'red'}>{agent.enabled ? '启用' : '禁用'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间" span={2}>
                  {formatDate(agent.createdAt, 'YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间" span={2}>
                  {formatDate(agent.updatedAt, 'YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>标签</Text>
                {(agent.tags || []).map((tag) => (
                  <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>描述</Text>
                <Text type="secondary">{agent.description}</Text>
              </div>

              {agent.promptConfig && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>提示词配置</Text>
                  <Card type="inner" title="系统提示词" style={{ marginBottom: 12 }}>
                    <Text type="secondary">{agent.promptConfig.systemPrompt}</Text>
                  </Card>
                  <Card type="inner" title="人设" style={{ marginBottom: 12 }}>
                    <Text type="secondary">{agent.promptConfig.persona || '-'}</Text>
                  </Card>
                  <Card type="inner" title="输出规则" style={{ marginBottom: 12 }}>
                    {agent.promptConfig.outputRules?.map((rule, index) => (
                      <div key={index} style={{ marginBottom: 4 }}>{index + 1}. {rule}</div>
                    ))}
                  </Card>
                </>
              )}
            </Card>
          )
        },
        {
          key: 'scores',
          label: '量化得分',
          children: (
            <Card>
              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ fontSize: 16, marginBottom: 8, display: 'block' }}>综合得分</Text>
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <Text style={{ fontSize: 48, color: '#1677ff', fontWeight: 'bold' }}>
                    {agent.overallScore?.toFixed(1)}
                  </Text>
                </div>
                <Progress
                  percent={agent.overallScore || 0}
                  strokeColor={{
                    '0%': '#1677ff',
                    '100%': '#52c41a'
                  }}
                />
              </div>

              <Divider />

              <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>各维度得分</Text>
              {agent.iterationCount > 0 && (
                renderScores({
                  contentQuality: 85,
                  taskSuccessRate: 82,
                  executionSpeed: 78,
                  resourceEfficiency: 80,
                  promptAccuracy: 88,
                  workflowStability: 90
                })
              )}
            </Card>
          )
        },
        {
          key: 'iterations',
          label: '迭代记录',
          children: (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>迭代历史</Text>
                <Button type="primary" icon={<BarChartOutlined />}>开始迭代</Button>
              </div>
              {mockIterations.length > 0 ? (
                <Table
                  dataSource={mockIterations}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '迭代版本', key: 'version', render: (_, record) => `${record.fromVersion} → ${record.toVersion}` },
                    { title: '状态', key: 'status', render: (_, record) => <Tag color={record.status === IterationStatus.COMPLETED ? 'green' : 'blue'}>{record.status === IterationStatus.COMPLETED ? '已完成' : '迭代中'}</Tag> },
                    { title: '得分提升', key: 'improvement', render: (_, record) => <Text strong style={{ color: record.scoreImprovement! > 0 ? '#52c41a' : '#ff4d4f' }}>{record.scoreImprovement! > 0 ? '+' : ''}{record.scoreImprovement?.toFixed(1)}</Text> },
                    { title: '样本数', key: 'samples', dataIndex: 'sampleCount' },
                    { title: '变更描述', key: 'changes', dataIndex: 'changes' },
                    { title: '迭代时间', key: 'time', render: (_, record) => formatDate(record.createdAt, 'YYYY-MM-DD') }
                  ]}
                />
              ) : (
                <Empty description="暂无迭代记录" />
              )}
            </div>
          )
        },
        {
          key: 'deployments',
          label: '部署记录',
          children: (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>分身部署</Text>
                <Button type="primary" icon={<CloudServerOutlined />} onClick={handleDeploy}>新增部署</Button>
              </div>
              {mockDeployments.length > 0 ? (
                <Table
                  dataSource={mockDeployments}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '分身名称', key: 'name', dataIndex: 'avatarName' },
                    { title: '部署平台', key: 'platform', render: (_, record) => <Tag>{record.platformKey}</Tag> },
                    { title: '状态', key: 'status', render: (_, record) => <Tag color={record.status === DeploymentStatus.DEPLOYED ? 'green' : record.status === DeploymentStatus.FAILED ? 'red' : 'orange'}>{record.status === DeploymentStatus.DEPLOYED ? '已部署' : record.status === DeploymentStatus.FAILED ? '部署失败' : '部署中'}</Tag> },
                    { title: '部署时间', key: 'deployed', render: (_, record) => formatDate(record.deployedAt!, 'YYYY-MM-DD') },
                    { title: '最近运行', key: 'lastRun', render: (_, record) => formatDate(record.lastRunAt!, 'YYYY-MM-DD') },
                    { title: '操作', key: 'action', render: () => <Space><Button type="text" size="small">查看</Button><Button type="text" size="small">同步</Button></Space> }
                  ]}
                />
              ) : (
                <Empty description="暂无部署记录" />
              )}
            </div>
          )
        }
      ]} />
    </div>
  );
};

/**
 * 智能体详情页面
 */
const AgentDetailPage: React.FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;

  return (
    <AppLayout activeNavKey="agents" showSidebar={true}>
      <Suspense fallback={<div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spin /></div>}>
        <AgentDetailContent id={id} />
      </Suspense>
    </AppLayout>
  );
};

export default AgentDetailPage;
