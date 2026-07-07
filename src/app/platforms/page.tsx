'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  Typography,
  Button,
  Space,
  Tabs,
  Table,
  Tag,
  Progress,
  Popover,
  message
} from 'antd';
import {
  GlobalOutlined,
  LinkOutlined,
  SyncOutlined,
  PlusOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import PlatformSquare from '@/components/platforms/PlatformSquare';
import { INITIAL_PLATFORMS } from '@/data/platforms';
import type { ThirdPartyPlatform, PlatformComponentSupport } from '@/types';
import { PlatformRegion } from '@/types';

const { Title, Text } = Typography;

const DiffLedgerPanel: React.FC = () => {
  const [platforms] = useState<ThirdPartyPlatform[]>(INITIAL_PLATFORMS);

  const columns = [
    {
      title: '平台名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string, record: ThirdPartyPlatform) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GlobalOutlined style={{ color: '#722ed1' }} />
          <span>{name}</span>
          <Tag color={record.region === PlatformRegion.DOMESTIC ? 'blue' : 'purple'}>
            {record.region === PlatformRegion.DOMESTIC ? '国内' : '海外'}
          </Tag>
        </div>
      )
    },
    {
      title: '组件支持率',
      dataIndex: 'supportRate',
      key: 'supportRate',
      width: 150,
      render: (_: unknown, record: ThirdPartyPlatform) => {
        const supported = record.capabilityMatrix.components.filter((c) => c.supported).length;
        const total = record.capabilityMatrix.components.length;
        const rate = total > 0 ? Math.round((supported / total) * 100) : 0;
        return (
          <div>
            <Progress percent={rate} size="small" showInfo={false} />
            <span style={{ fontSize: 12, marginLeft: 8 }}>{supported}/{total}</span>
          </div>
        );
      }
    },
    {
      title: '组件差异详情',
      dataIndex: 'components',
      key: 'components',
      render: (_: unknown, record: ThirdPartyPlatform) => {
        const components = record.capabilityMatrix.components;

        const content = (
          <div style={{ width: 400 }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong>组件支持清单</Text>
            </div>
            {components.map((comp: PlatformComponentSupport) => (
              <div
                key={comp.componentType}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {comp.supported ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <WarningOutlined style={{ color: '#faad14' }} />
                  )}
                  <span style={{ fontSize: 12 }}>{comp.componentType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                    {comp.nativeComponentName || '-'}
                  </span>
                  {comp.limitations && (
                    <Popover content={comp.limitations} title="限制说明">
                      <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    </Popover>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

        return (
          <Popover content={content} title={`${record.name} - 组件差异`}>
            <Button size="small">查看详情</Button>
          </Popover>
        );
      }
    },
    {
      title: '能力矩阵',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (_: unknown, record: ThirdPartyPlatform) => {
        const matrix = record.capabilityMatrix;
        const tags = [];
        if (matrix.ragNative) tags.push(<Tag key="rag" color="green">RAG</Tag>);
        if (matrix.loopSupport) tags.push(<Tag key="loop" color="blue">循环</Tag>);
        if (matrix.branchSupport) tags.push(<Tag key="branch" color="cyan">分支</Tag>);
        if (matrix.autoExecution) tags.push(<Tag key="auto" color="purple">自动化</Tag>);
        if (matrix.privateDeployment) tags.push(<Tag key="private" color="orange">私有化</Tag>);
        return <Space>{tags}</Space>;
      }
    },
    {
      title: '适配规则版本',
      dataIndex: 'ruleVersion',
      key: 'ruleVersion',
      width: 120,
      render: () => <Tag>v1.0.0</Tag>
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      render: () => (
        <Space>
          <Button size="small">编辑差异</Button>
          <Button size="small">同步规则</Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="分身平台差异台账" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        <div>
          <Text type="secondary">
            记录各分身平台组件支持情况和适配规则差异，为跨平台工作流适配提供数据支撑
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          添加差异记录
        </Button>
      </div>
      <Table
        dataSource={platforms}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};

const PlatformsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('platforms');
  const [syncing, setSyncing] = useState(false);

  // 全量同步
  const handleFullSync = async () => {
    setSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success('全量同步完成，共同步 7 个平台数据');
    } catch {
      message.error('同步失败，请重试');
    } finally {
      setSyncing(false);
    }
  };

  // 新增平台
  const handleCreatePlatform = () => {
    router.push('/platforms/create');
  };

  // 绑定新平台
  const handleBindPlatform = () => {
    message.info('绑定平台功能开发中');
  };

  return (
    <AppLayout activeNavKey="platforms" showSidebar={true}>
      <div style={{ padding: 16, height: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            <GlobalOutlined style={{ marginRight: 8 }} />
            分身平台管理
          </Title>
          <Space>
            <Button icon={<LinkOutlined />} onClick={handleBindPlatform}>绑定新平台</Button>
            <Button type="primary" icon={<SyncOutlined />} loading={syncing} onClick={handleFullSync}>
              全量同步
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePlatform}>
              新增平台
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'platforms',
              label: (
                <span>
                  <GlobalOutlined />
                  分身平台广场
                </span>
              ),
              children: (
                <Card style={{ height: 'calc(100% - 60px)', border: 'none' }} styles={{ body: { padding: 0 } }}>
                  <PlatformSquare />
                </Card>
              )
            },
            {
              key: 'diff',
              label: (
                <span>
                  <ApiOutlined />
                  平台差异台账
                </span>
              ),
              children: <DiffLedgerPanel />
            }
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PlatformsPage;