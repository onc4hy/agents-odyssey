// 文件路径: src/app/platforms/deploy/page.tsx
// 分身部署页面 - 智能体奥德赛项目
// 选择智能体和平台，创建分身部署

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Steps,
  Tag,
  Spin,
  Divider,
  Progress
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import { DOMESTIC_PLATFORMS, OVERSEAS_PLATFORMS } from '@/constants';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 部署步骤枚举
 */
enum DeployStep {
  SELECT_AGENT = 0,
  SELECT_PLATFORM = 1,
  ADAPT_CONFIG = 2,
  CONFIRM_DEPLOY = 3
}

/**
 * 部署内容组件
 */
const DeployContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<DeployStep>(DeployStep.SELECT_AGENT);
  const [loading, setLoading] = useState(false);
  const [adaptProgress, setAdaptProgress] = useState(0);

  /**
   * 模拟智能体列表
   */
  const mockAgents = [
    { id: '1', name: '文案创作专家', type: 'prompt', score: 87.5 },
    { id: '2', name: '客户服务工作流', type: 'workflow', score: 92.3 },
    { id: '3', name: '数据分析助手', type: 'prompt', score: 78.2 },
    { id: '4', name: '内容审核流水线', type: 'workflow', score: 85.6 }
  ];

  /**
   * 处理步骤前进
   */
  const handleNext = () => {
    if (currentStep < DeployStep.CONFIRM_DEPLOY) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  /**
   * 处理步骤后退
   */
  const handlePrev = () => {
    if (currentStep > DeployStep.SELECT_AGENT) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  /**
   * 处理部署
   */
  const handleDeploy = async () => {
    setLoading(true);
    try {
      // 模拟适配过程
      setCurrentStep(DeployStep.ADAPT_CONFIG);
      setAdaptProgress(0);

      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setAdaptProgress(i);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('部署成功');
      router.push('/platforms/deployments');
    } catch (error) {
      message.error('部署失败，请重试');
      console.error('部署失败:', error);
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginRight: 12 }}>
          返回
        </Button>
        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudServerOutlined />
          部署分身
        </Title>
      </div>

      {/* 步骤条 */}
      <Steps
        current={currentStep}
        style={{ marginBottom: 24 }}
        items={[
          { title: '选择智能体', icon: <RobotOutlined /> },
          { title: '选择平台', icon: <CloudServerOutlined /> },
          { title: '适配配置', icon: <SaveOutlined /> },
          { title: '确认部署', icon: <CheckCircleOutlined /> }
        ]}
      />

      {/* 步骤内容 */}
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form form={form} layout="vertical">
          {/* 步骤1：选择智能体 */}
          {currentStep === DeployStep.SELECT_AGENT && (
            <div>
              <Form.Item
                name="agentId"
                label="选择智能体"
                rules={[{ required: true, message: '请选择要部署的智能体' }]}
                initialValue={agentId}
              >
                <Select placeholder="请选择智能体" style={{ width: '100%' }}>
                  {mockAgents.map((agent) => (
                    <Option key={agent.id} value={agent.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{agent.name}</span>
                        <Tag color={agent.type === 'prompt' ? 'blue' : 'green'}>
                          {agent.type === 'prompt' ? '提示词型' : '工作流型'}
                        </Tag>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="avatarName" label="分身名称" rules={[{ required: true, message: '请输入分身名称' }]}>
                <Input placeholder="请输入在目标平台显示的分身名称" />
              </Form.Item>
            </div>
          )}

          {/* 步骤2：选择平台 */}
          {currentStep === DeployStep.SELECT_PLATFORM && (
            <div>
              <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>国内平台</Text>
              <Form.Item
                name="platformKey"
                label="选择目标平台"
                rules={[{ required: true, message: '请选择目标平台' }]}
              >
                <Select placeholder="请选择目标平台" style={{ width: '100%' }}>
                  {DOMESTIC_PLATFORMS.slice(0, 5).map((platform) => (
                    <Option key={platform.key} value={platform.key}>
                      {platform.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider>海外平台</Divider>
              <Select placeholder="海外平台（开发中）" disabled style={{ width: '100%', marginBottom: 16 }}>
                {OVERSEAS_PLATFORMS.slice(0, 5).map((platform) => (
                  <Option key={platform.key} value={platform.key}>
                    {platform.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* 步骤3：适配配置 */}
          {currentStep === DeployStep.ADAPT_CONFIG && (
            <div>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <CloudServerOutlined style={{ fontSize: 48, color: '#1677ff' }} />
                </div>
                <Text strong style={{ fontSize: 16 }}>正在适配配置...</Text>
                <div style={{ marginTop: 16 }}>
                  <Progress percent={adaptProgress} status={adaptProgress === 100 ? 'success' : 'active'} />
                </div>
                <Text type="secondary" style={{ fontSize: 13, marginTop: 8, display: 'block' }}>
                  {adaptProgress < 50 ? '分析平台差异...' : adaptProgress < 80 ? '转换组件配置...' : '生成适配规则...'}
                </Text>
              </div>
            </div>
          )}

          {/* 步骤4：确认部署 */}
          {currentStep === DeployStep.CONFIRM_DEPLOY && (
            <div>
              <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>部署信息确认</Text>
              <Card type="inner">
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">智能体：</Text>
                  <Text>文案创作专家</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">分身名称：</Text>
                  <Text>{form.getFieldValue('avatarName') || '未填写'}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">目标平台：</Text>
                  <Tag>{form.getFieldValue('platformKey') || '未选择'}</Tag>
                </div>
                <div>
                  <Text type="secondary">适配状态：</Text>
                  <Tag color="green">已完成</Tag>
                </div>
              </Card>
            </div>
          )}

          {/* 操作按钮 */}
          <Form.Item style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {currentStep > DeployStep.SELECT_AGENT && (
                <Button onClick={handlePrev}>上一步</Button>
              )}
              {currentStep < DeployStep.CONFIRM_DEPLOY ? (
                <Button type="primary" onClick={handleNext} loading={loading}>
                  下一步
                </Button>
              ) : (
                <Button type="primary" onClick={handleDeploy} loading={loading} icon={<CloudServerOutlined />}>
                  确认部署
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

/**
 * 分身部署页面
 */
const DeployPage: React.FC = () => {
  return (
    <AppLayout activeNavKey="platforms" showSidebar={true}>
      <Suspense fallback={<div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spin /></div>}>
        <DeployContent />
      </Suspense>
    </AppLayout>
  );
};

export default DeployPage;
