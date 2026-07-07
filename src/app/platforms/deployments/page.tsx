// 文件路径: src/app/platforms/deployments/page.tsx
// 部署记录页面 - 智能体奥德赛项目
// 展示所有智能体分身的部署记录和状态

'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  DatePicker,
  Select,
  Input,
  Empty
} from 'antd';
import {
  CloudServerOutlined,
  RestOutlined,
  FilterOutlined
} from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import type { AvatarDeploymentRecord } from '@/types';
import { DeploymentStatus, PlatformType } from '@/types';
import { formatDate } from '@/utils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 部署记录页面
 */
const DeploymentsPage: React.FC = () => {
  const [deployments] = useState<AvatarDeploymentRecord[]>([
    {
      id: 'deploy-1',
      agentId: '1',
      platformKey: PlatformType.COZE,
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
      agentId: '1',
      platformKey: PlatformType.DIFY,
      avatarName: '文案创作专家-Dify',
      platformAvatarId: 'dify-avatar-456',
      status: DeploymentStatus.DEPLOYED,
      adaptationStatus: 'adapted' as any,
      deployedAt: new Date('2024-03-08'),
      lastRunAt: new Date('2024-03-19'),
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-19')
    },
    {
      id: 'deploy-3',
      agentId: '2',
      platformKey: PlatformType.WENXIN,
      avatarName: '客户服务工作流-文心',
      platformAvatarId: 'wenxin-avatar-789',
      status: DeploymentStatus.FAILED,
      adaptationStatus: 'failed' as any,
      errorMessage: 'API 调用失败，认证信息过期',
      deployedAt: new Date('2024-03-15'),
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    },
    {
      id: 'deploy-4',
      agentId: '2',
      platformKey: PlatformType.BAILIAN,
      avatarName: '客户服务工作流-百炼',
      platformAvatarId: 'bailian-avatar-012',
      status: DeploymentStatus.DEPLOYING,
      adaptationStatus: 'adapting' as any,
      deployedAt: new Date('2024-03-20'),
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    }
  ]);

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.DEPLOYED:
        return <Tag color="green">已部署</Tag>;
      case DeploymentStatus.DEPLOYING:
        return <Tag color="orange">部署中</Tag>;
      case DeploymentStatus.FAILED:
        return <Tag color="red">部署失败</Tag>;
      case DeploymentStatus.PENDING:
        return <Tag color="default">待部署</Tag>;
      case DeploymentStatus.OFFLINE:
        return <Tag color="gray">已下线</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <AppLayout activeNavKey="platforms" showSidebar={true}>
      <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
        {/* 页面头部 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudServerOutlined />
              部署记录
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              管理和查看所有智能体分身的部署状态
            </Text>
          </div>
          <Button type="primary" icon={<RestOutlined />}>
            刷新状态
          </Button>
        </div>

        {/* 筛选栏 */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary">筛选:</Text>
            </div>
            <Select placeholder="选择平台" style={{ width: 150 }}>
              <Option value="all">全部平台</Option>
              <Option value={PlatformType.COZE}>扣子 Coze</Option>
              <Option value={PlatformType.DIFY}>Dify</Option>
              <Option value={PlatformType.WENXIN}>百度文心</Option>
              <Option value={PlatformType.BAILIAN}>阿里云百炼</Option>
            </Select>
            <Select placeholder="选择状态" style={{ width: 120 }}>
              <Option value="all">全部状态</Option>
              <Option value={DeploymentStatus.DEPLOYED}>已部署</Option>
              <Option value={DeploymentStatus.DEPLOYING}>部署中</Option>
              <Option value={DeploymentStatus.FAILED}>部署失败</Option>
            </Select>
            <RangePicker placeholder={['开始时间', '结束时间']} />
            <Input.Search placeholder="搜索分身名称" style={{ width: 200 }} />
          </div>
        </Card>

        {/* 部署记录列表 */}
        <Card>
          {deployments.length > 0 ? (
            <Table
              dataSource={deployments}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '分身名称',
                  key: 'name',
                  dataIndex: 'avatarName',
                  ellipsis: true
                },
                {
                  title: '所属智能体',
                  key: 'agent',
                  render: () => <Text style={{ cursor: 'pointer', color: '#1677ff' }}>文案创作专家</Text>
                },
                {
                  title: '部署平台',
                  key: 'platform',
                  render: (_, record) => <Tag>{record.platformKey}</Tag>
                },
                {
                  title: '部署状态',
                  key: 'status',
                  render: (_, record) => getStatusTag(record.status)
                },
                {
                  title: '部署时间',
                  key: 'deployed',
                  render: (_, record) => record.deployedAt ? formatDate(record.deployedAt, 'YYYY-MM-DD') : '-'
                },
                {
                  title: '最近运行',
                  key: 'lastRun',
                  render: (_, record) => record.lastRunAt ? formatDate(record.lastRunAt, 'YYYY-MM-DD') : '-'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      <Button type="text" size="small">查看详情</Button>
                      {record.status === DeploymentStatus.FAILED && (
                        <Button type="primary" size="small">重新部署</Button>
                      )}
                      {record.status === DeploymentStatus.DEPLOYED && (
                        <Button danger size="small">下线</Button>
                      )}
                    </Space>
                  )
                }
              ]}
            />
          ) : (
            <Empty description="暂无部署记录" />
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default DeploymentsPage;
