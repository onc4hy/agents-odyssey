// 文件路径: src/app/agents/create/page.tsx
// 智能体创建页面 - 智能体奥德赛项目
// 支持提示词型和工作流型智能体的创建

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Radio,
  message,
  Divider,
  Spin
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, RobotOutlined, ApiOutlined } from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import { AgentType } from '@/types';
import { AGENT_TYPE_LABELS } from '@/constants';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 智能体创建表单内容组件
 * 使用 useSearchParams，需要被 Suspense 包裹
 */
const AgentCreateForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [form] = Form.useForm();
  const [agentType, setAgentType] = useState<AgentType>(
    typeParam === 'workflow' ? AgentType.WORKFLOW : AgentType.PROMPT
  );
  const [loading, setLoading] = useState(false);

  // 监听 URL 参数变化，同步更新状态
  useEffect(() => {
    if (typeParam === 'workflow') {
      setAgentType(AgentType.WORKFLOW);
    } else {
      setAgentType(AgentType.PROMPT);
    }
    // 重置表单
    form.resetFields();
  }, [typeParam, form]);

  /**
   * 处理类型切换
   */
  const handleTypeChange = (e: any) => {
    const newType = e.target.value;
    setAgentType(newType);
    // 更新 URL 参数
    const newTypeParam = newType === AgentType.WORKFLOW ? 'workflow' : 'prompt';
    router.push(`/agents/create?type=${newTypeParam}`);
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // 调用 API 创建智能体
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          type: agentType,
          promptConfig:
            agentType === AgentType.PROMPT
              ? {
                  systemPrompt: values.systemPrompt,
                  temperature: values.temperature || 0.7,
                  maxTokens: values.maxTokens || 2048
                }
              : undefined,
          tags: (values as Record<string, any>).tags ? (values as Record<string, any>).tags.split(',').map((t: string) => t.trim()) : []
        })
      });

      const result = await response.json();

      if (result.code === 0) {
        message.success('智能体创建成功');
        router.push('/agents');
      } else {
        message.error(result.message || '创建失败');
      }
    } catch (error) {
      message.error('创建失败，请重试');
      console.error('创建智能体失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 返回列表
   */
  const handleBack = () => {
    router.back();
  };

  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
      {/* 页面头部 */}
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
          新建智能体
        </Title>
      </div>

      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            temperature: 0.7,
            maxTokens: 2048
          }}
        >
          {/* 智能体类型选择 */}
          <Form.Item label="智能体类型" required>
            <Radio.Group value={agentType} onChange={handleTypeChange} size="large">
              <Radio.Button value={AgentType.PROMPT}>
                <RobotOutlined style={{ marginRight: 6 }} />
                {AGENT_TYPE_LABELS[AgentType.PROMPT]}
              </Radio.Button>
              <Radio.Button value={AgentType.WORKFLOW}>
                <ApiOutlined style={{ marginRight: 6 }} />
                {AGENT_TYPE_LABELS[AgentType.WORKFLOW]}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider />

          {/* 基础信息 */}
          <Form.Item
            label="智能体名称"
            name="name"
            rules={[{ required: true, message: '请输入智能体名称' }]}
          >
            <Input placeholder="请输入智能体名称" maxLength={50} showCount />
          </Form.Item>

          <Form.Item label="智能体描述" name="description">
            <TextArea
              placeholder="请输入智能体的功能描述和使用场景"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>

          {/* 提示词型智能体配置 */}
          {agentType === AgentType.PROMPT && (
            <>
              <Divider orientation={'start' as any}>提示词配置</Divider>

              <Form.Item
                label="系统提示词"
                name="systemPrompt"
                rules={[{ required: true, message: '请输入系统提示词' }]}
              >
                <TextArea
                  placeholder="定义智能体的角色、能力、输出规则等系统级指令"
                  rows={8}
                  maxLength={4000}
                  showCount
                />
              </Form.Item>

              <Form.Item label="温度 (Temperature)" name="temperature">
                <Select style={{ width: 200 }}>
                  <Option value={0.1}>0.1 - 非常精确</Option>
                  <Option value={0.3}>0.3 - 偏精确</Option>
                  <Option value={0.5}>0.5 - 平衡</Option>
                  <Option value={0.7}>0.7 - 偏创意</Option>
                  <Option value={0.9}>0.9 - 非常创意</Option>
                  <Option value={1.0}>1.0 - 最大随机性</Option>
                </Select>
              </Form.Item>

              <Form.Item label="最大 Token 数" name="maxTokens">
                <Select style={{ width: 200 }}>
                  <Option value={512}>512</Option>
                  <Option value={1024}>1024</Option>
                  <Option value={2048}>2048</Option>
                  <Option value={4096}>4096</Option>
                  <Option value={8192}>8192</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {/* 工作流型智能体配置（简化版） */}
          {agentType === AgentType.WORKFLOW && (
            <>
              <Divider orientation={'start' as any}>工作流配置</Divider>

              <Card type="inner" style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  工作流编辑器将在后续迭代中完整实现。当前可先创建基础配置，后续在编辑器中完善工作流节点。
                </Text>
              </Card>

              <Form.Item label="初始节点数量" name="initialNodes">
                <Select style={{ width: 200 }} defaultValue={3}>
                  <Option value={3}>3 个节点（简单）</Option>
                  <Option value={5}>5 个节点（标准）</Option>
                  <Option value={10}>10 个节点（复杂）</Option>
                </Select>
              </Form.Item>
            </>
          )}

          <Divider />

          {/* 提交按钮 */}
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
  );
};

/**
 * 智能体创建页面
 * 用 Suspense 包裹使用 useSearchParams 的子组件
 */
const AgentCreatePage: React.FC = () => {
  return (
    <AppLayout activeNavKey="agents" showSidebar={true}>
      <Suspense fallback={<div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spin /></div>}>
        <AgentCreateForm />
      </Suspense>
    </AppLayout>
  );
};

export default AgentCreatePage;
