// 文件路径: src/app/platforms/collect/page.tsx
// 数据回收中心页面 - 智能体奥德赛项目
// 管理和监控各平台分身的数据回收任务

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
  Empty,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  DatabaseOutlined,
  RestOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import type { DataCollectionRecord } from '@/types';
import { CollectionStatus, PlatformType } from '@/types';
import { formatDate } from '@/utils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 数据回收中心页面
 */
const CollectPage: React.FC = () => {
  const [collections] = useState<DataCollectionRecord[]>([
    {
      id: 'collect-1',
      agentId: '1',
      platformKey: PlatformType.COZE,
      deploymentId: 'deploy-1',
      status: CollectionStatus.COMPLETED,
      startedAt: new Date('2024-03-20 08:00:00'),
      completedAt: new Date('2024-03-20 08:15:30'),
      contentCount: 256,
      dataSize: 52428800,
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    },
    {
      id: 'collect-2',
      agentId: '1',
      platformKey: PlatformType.DIFY,
      deploymentId: 'deploy-2',
      status: CollectionStatus.COLLECTING,
      startedAt: new Date('2024-03-20 09:00:00'),
      contentCount: 156,
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    },
    {
      id: 'collect-3',
      agentId: '2',
      platformKey: PlatformType.WENXIN,
      deploymentId: 'deploy-3',
      status: CollectionStatus.FAILED,
      startedAt: new Date('2024-03-19 10:00:00'),
      contentCount: 0,
      errorMessage: 'API 调用失败，请求超时',
      createdAt: new Date('2024-03-19'),
      updatedAt: new Date('2024-03-19')
    },
    {
      id: 'collect-4',
      agentId: '2',
      platformKey: PlatformType.BAILIAN,
      deploymentId: 'deploy-4',
      status: CollectionStatus.PENDING,
      contentCount: 0,
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    }
  ]);

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: CollectionStatus) => {
    switch (status) {
      case CollectionStatus.COMPLETED:
        return <Tag color="green">已完成</Tag>;
      case CollectionStatus.COLLECTING:
        return <Tag color="blue">回收中</Tag>;
      case CollectionStatus.PENDING:
        return <Tag color="default">待回收</Tag>;
      case CollectionStatus.FAILED:
        return <Tag color="red">失败</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  /**
   * 格式化数据大小
   */
  const formatDataSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppLayout activeNavKey="platforms" showSidebar={true}>
      <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
        {/* 页面头部 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <DatabaseOutlined />
              数据回收中心
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              管理和监控各平台分身的数据回收任务
            </Text>
          </div>
          <Space>
            <Button icon={<RestOutlined />}>刷新</Button>
            <Button type="primary" icon={<PlayCircleOutlined />}>
              开始回收
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic title="总回收任务" value={collections.length} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="已完成" value={collections.filter((c) => c.status === CollectionStatus.COMPLETED).length} suffix="/项" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="回收内容" value={collections.reduce((sum, c) => sum + c.contentCount, 0)} suffix="/条" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="数据大小" value={formatDataSize(collections.reduce((sum, c) => sum + (c.dataSize || 0), 0))} />
            </Card>
          </Col>
        </Row>

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
            </Select>
            <Select placeholder="选择状态" style={{ width: 120 }}>
              <Option value="all">全部状态</Option>
              <Option value={CollectionStatus.COMPLETED}>已完成</Option>
              <Option value={CollectionStatus.COLLECTING}>回收中</Option>
              <Option value={CollectionStatus.FAILED}>失败</Option>
            </Select>
            <RangePicker placeholder={['开始时间', '结束时间']} />
            <Input.Search placeholder="搜索智能体" style={{ width: 200 }} />
          </div>
        </Card>

        {/* 回收任务列表 */}
        <Card>
          {collections.length > 0 ? (
            <Table
              dataSource={collections}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '智能体',
                  key: 'agent',
                  render: () => <Text style={{ cursor: 'pointer', color: '#1677ff' }}>文案创作专家</Text>
                },
                {
                  title: '来源平台',
                  key: 'platform',
                  render: (_, record) => <Tag>{record.platformKey}</Tag>
                },
                {
                  title: '回收状态',
                  key: 'status',
                  render: (_, record) => getStatusTag(record.status)
                },
                {
                  title: '回收内容',
                  key: 'count',
                  dataIndex: 'contentCount',
                  render: (count) => `${count} 条`
                },
                {
                  title: '数据大小',
                  key: 'size',
                  render: (_, record) => formatDataSize(record.dataSize)
                },
                {
                  title: '开始时间',
                  key: 'started',
                  render: (_, record) => record.startedAt ? formatDate(record.startedAt, 'YYYY-MM-DD HH:mm') : '-'
                },
                {
                  title: '完成时间',
                  key: 'completed',
                  render: (_, record) => record.completedAt ? formatDate(record.completedAt, 'YYYY-MM-DD HH:mm') : '-'
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      {record.status === CollectionStatus.COLLECTING && (
                        <Button type="text" size="small" icon={<PauseCircleOutlined />}>暂停</Button>
                      )}
                      {record.status === CollectionStatus.PENDING && (
                        <Button type="primary" size="small" icon={<PlayCircleOutlined />}>开始</Button>
                      )}
                      {record.status === CollectionStatus.FAILED && (
                        <Button type="primary" size="small">重试</Button>
                      )}
                      {record.status === CollectionStatus.COMPLETED && (
                        <Button type="text" size="small" icon={<DownloadOutlined />}>下载</Button>
                      )}
                    </Space>
                  )
                }
              ]}
            />
          ) : (
            <Empty description="暂无回收任务" />
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default CollectPage;
