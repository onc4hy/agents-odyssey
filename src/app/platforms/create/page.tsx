'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  message,
  Divider,
  Switch,
  InputNumber,
  Table,
  Popconfirm,
  Row
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import { PlatformRegion, PlatformType } from '@/types';
import type { PlatformComponentSupport, PlatformCapabilityMatrix } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PlatformCreatePage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<PlatformComponentSupport[]>([
    { componentType: '', supported: false, supportLevel: 0 }
  ]);

  const handleAddComponent = () => {
    setComponents([...components, { componentType: '', supported: false, supportLevel: 0 }]);
  };

  const handleRemoveComponent = (index: number) => {
    if (components.length > 1) {
      setComponents(components.filter((_, i) => i !== index));
    }
  };

  const handleComponentChange = (index: number, field: keyof PlatformComponentSupport, value: unknown) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setComponents(newComponents);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const capabilityMatrix: PlatformCapabilityMatrix = {
        componentGranularity: (values.componentGranularity as number) || 0,
        loopSupport: values.loopSupport as boolean,
        branchSupport: values.branchSupport as boolean,
        batchSupport: values.batchSupport as boolean,
        ragNative: values.ragNative as boolean,
        pluginOpenness: (values.pluginOpenness as number) || 0,
        authComplexity: (values.authComplexity as number) || 0,
        logGranularity: (values.logGranularity as number) || 0,
        autoExecution: values.autoExecution as boolean,
        privateDeployment: values.privateDeployment as boolean,
        components: components.filter((c) => c.componentType.trim())
      };

      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          capabilityMatrix
        })
      });

      const result = await response.json();

      if (result.code === 0) {
        message.success('平台创建成功');
        router.push('/platforms');
      } else {
        message.error(result.message || '创建失败');
      }
    } catch (error) {
      message.error('创建失败，请重试');
      console.error('创建平台失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const componentColumns = [
    {
      title: '组件类型',
      dataIndex: 'componentType',
      key: 'componentType',
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={components[index].componentType}
          onChange={(e) => handleComponentChange(index, 'componentType', e.target.value)}
          placeholder="如：LLM节点"
        />
      )
    },
    {
      title: '是否支持',
      dataIndex: 'supported',
      key: 'supported',
      width: 100,
      render: (_: unknown, __: unknown, index: number) => (
        <Switch
          checked={components[index].supported}
          onChange={(checked) => handleComponentChange(index, 'supported', checked)}
        />
      )
    },
    {
      title: '支持程度',
      dataIndex: 'supportLevel',
      key: 'supportLevel',
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <InputNumber
          min={0}
          max={1}
          step={0.1}
          value={components[index].supportLevel}
          onChange={(value) => handleComponentChange(index, 'supportLevel', value)}
        />
      )
    },
    {
      title: '原生组件名称',
      dataIndex: 'nativeComponentName',
      key: 'nativeComponentName',
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={components[index].nativeComponentName}
          onChange={(e) => handleComponentChange(index, 'nativeComponentName', e.target.value)}
          placeholder="平台原生名称"
        />
      )
    },
    {
      title: '限制说明',
      dataIndex: 'limitations',
      key: 'limitations',
      render: (_: unknown, __: unknown, index: number) => (
        <Input
          value={components[index].limitations}
          onChange={(e) => handleComponentChange(index, 'limitations', e.target.value)}
          placeholder="限制条件"
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <Popconfirm
          title="确定删除该组件？"
          onConfirm={() => handleRemoveComponent(index)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={components.length <= 1}
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <AppLayout activeNavKey="platforms" showSidebar={true}>
      <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginRight: 12 }}
          >
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            新增智能体平台
          </Title>
        </div>

        <Card style={{ maxWidth: 900, margin: '0 auto' }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Divider orientation={'start' as any}>基础信息</Divider>

            <Form.Item
              label="平台标识"
              name="platformKey"
              rules={[{ required: true, message: '请输入平台标识' }]}
            >
              <Select style={{ width: 200 }} placeholder="选择平台类型">
                {Object.values(PlatformType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="平台名称"
              name="name"
              rules={[{ required: true, message: '请输入平台名称' }]}
            >
              <Input placeholder="请输入平台名称" maxLength={50} showCount />
            </Form.Item>

            <Form.Item label="平台区域" name="region" rules={[{ required: true }]}>
              <Select style={{ width: 200 }}>
                <Option value={PlatformRegion.DOMESTIC}>国内平台</Option>
                <Option value={PlatformRegion.OVERSEAS}>海外平台</Option>
              </Select>
            </Form.Item>

            <Form.Item label="平台描述" name="description">
              <TextArea
                placeholder="请输入平台的功能描述和特点"
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item label="官网地址" name="website">
              <Input placeholder="https://" />
            </Form.Item>

            <Form.Item label="API文档地址" name="apiDocsUrl">
              <Input placeholder="https://" />
            </Form.Item>

            <Divider orientation={'start' as any}>能力矩阵</Divider>

            <Row gutter={[16, 16]}>
              <Form.Item label="组件颗粒度" name="componentGranularity">
                <InputNumber min={0} max={100} style={{ width: 150 }} />
              </Form.Item>
              <Form.Item label="插件开放度" name="pluginOpenness">
                <InputNumber min={0} max={100} style={{ width: 150 }} />
              </Form.Item>
              <Form.Item label="API鉴权复杂度" name="authComplexity">
                <InputNumber min={0} max={100} style={{ width: 150 }} />
              </Form.Item>
              <Form.Item label="日志粒度" name="logGranularity">
                <InputNumber min={0} max={100} style={{ width: 150 }} />
              </Form.Item>
            </Row>

            <Row gutter={[16, 16]}>
              <Form.Item label="循环节点支持" name="loopSupport" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="分支节点支持" name="branchSupport" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="批量节点支持" name="batchSupport" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="RAG原生能力" name="ragNative" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="自动化执行" name="autoExecution" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="私有化部署" name="privateDeployment" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Row>

            <Divider orientation={'start' as any}>组件差异台账</Divider>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 12
              }}
            >
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddComponent}>
                添加组件
              </Button>
            </div>

            <Table
              dataSource={components}
              columns={componentColumns}
              rowKey={(_, index) => String(index)}
              pagination={false}
              size="small"
            />

            <Text type="secondary" style={{ fontSize: 12 }}>
              请详细填写各平台的组件支持情况，这些信息将用于跨平台工作流适配引擎进行组件替换和参数映射。
            </Text>

            <Divider />

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  保存
                </Button>
                <Button onClick={handleBack}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PlatformCreatePage;