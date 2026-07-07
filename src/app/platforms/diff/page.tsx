'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Progress,
  Popover,
  Select,
  Input,
  Row,
  Col,
  Modal,
  Form,
  Switch,
  InputNumber,
  message,
  Divider
} from 'antd';
import {
  GlobalOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { INITIAL_PLATFORMS } from '@/data/platforms';
import type { ThirdPartyPlatform, PlatformComponentSupport } from '@/types';
import { PlatformRegion } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

const DiffLedgerPage: React.FC = () => {
  const [platforms] = useState<ThirdPartyPlatform[]>(INITIAL_PLATFORMS);
  const [searchText, setSearchText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<ThirdPartyPlatform | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  const filteredPlatforms = platforms.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEditDiff = (platform: ThirdPartyPlatform) => {
    setSelectedPlatform(platform);
    form.setFieldsValue({
      ...platform,
      capabilityMatrix: platform.capabilityMatrix,
      components: platform.capabilityMatrix.components
    });
    setShowModal(true);
  };

  const handleSaveDiff = () => {
    message.success('差异台账更新成功');
    setShowModal(false);
  };

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
      title: '不支持组件',
      dataIndex: 'unsupported',
      key: 'unsupported',
      width: 150,
      render: (_: unknown, record: ThirdPartyPlatform) => {
        const unsupported = record.capabilityMatrix.components.filter((c) => !c.supported);
        return (
          <div>
            {unsupported.length > 0 ? (
              <Tag color="warning">{unsupported.length} 个</Tag>
            ) : (
              <Tag color="success">全部支持</Tag>
            )}
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
      title: '能力特性',
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
      render: (_: unknown, record: ThirdPartyPlatform) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditDiff(record)}>
            编辑
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

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
            智能体平台差异台账
          </Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              添加差异记录
            </Button>
          </Space>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Text type="secondary">
            记录各平台组件支持情况和适配规则差异，为跨平台工作流适配提供数据支撑。
            通过差异台账，系统可以自动进行组件替换、节点裁剪和参数映射。
          </Text>
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <Space>
              <Input
                placeholder="搜索平台"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Select placeholder="按区域筛选" style={{ width: 150 }}>
                <Option value="all">全部</Option>
                <Option value={PlatformRegion.DOMESTIC}>国内平台</Option>
                <Option value={PlatformRegion.OVERSEAS}>海外平台</Option>
              </Select>
            </Space>
          </div>

          <Table
            dataSource={filteredPlatforms}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </Card>

        <Modal
          title={`编辑 ${selectedPlatform?.name} 差异台账`}
          open={showModal}
          onCancel={() => setShowModal(false)}
          onOk={handleSaveDiff}
          width={800}
        >
          {selectedPlatform && (
            <Form form={form} layout="vertical">
              <Divider orientation={'start' as any}>能力矩阵</Divider>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item label="组件颗粒度">
                    <InputNumber min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="插件开放度">
                    <InputNumber min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="日志粒度">
                    <InputNumber min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={4}>
                  <Form.Item label="循环支持">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="分支支持">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="RAG">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="自动化">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="私有化">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation={'start' as any}>组件支持清单</Divider>
              <Table
                dataSource={selectedPlatform.capabilityMatrix.components}
                columns={[
                  {
                    title: '组件类型',
                    dataIndex: 'componentType'
                  },
                  {
                    title: '是否支持',
                    dataIndex: 'supported',
                    render: (supported: boolean) => (
                      supported ? (
                        <Tag color="success">支持</Tag>
                      ) : (
                        <Tag color="warning">不支持</Tag>
                      )
                    )
                  },
                  {
                    title: '支持程度',
                    dataIndex: 'supportLevel'
                  },
                  {
                    title: '原生名称',
                    dataIndex: 'nativeComponentName'
                  }
                ]}
                rowKey="componentType"
                pagination={false}
                size="small"
              />
            </Form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
};

export default DiffLedgerPage;