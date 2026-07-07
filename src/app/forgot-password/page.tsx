'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  MailOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

type Step = 'email' | 'verify' | 'reset';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');

  const handleBack = () => {
    if (currentStep === 'email') {
      router.push('/login');
    } else {
      setCurrentStep(currentStep === 'verify' ? 'email' : 'verify');
    }
  };

  const handleSendEmail = async (values: { email: string }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEmail(values.email);
      setCurrentStep('verify');
      message.success('验证码已发送到您的邮箱');
    } catch {
      message.error('发送验证码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (values: { code: string }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (values.code.length === 6) {
        setCurrentStep('reset');
        message.success('验证码验证成功');
      } else {
        message.error('请输入6位验证码');
      }
    } catch {
      message.error('验证码验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (values: { password: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      if (values.password !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        setLoading(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('密码重置成功');
      router.push('/login');
    } catch {
      message.error('密码重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)'
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: '#1677ff',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 28,
              color: '#fff'
            }}
          >
            🤖
          </div>
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
            智能体奥德赛
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Agents-Odyssey
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回
          </Button>
          <Title level={4} style={{ margin: 0, marginLeft: 8 }}>
            忘记密码
          </Title>
        </div>

        {currentStep === 'email' && (
          <Form form={form} layout="vertical" onFinish={handleSendEmail}>
            <Form.Item
              name="email"
              label="邮箱地址"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="请输入注册时使用的邮箱"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%', height: 44, fontSize: 16 }}
              >
                {loading ? <Spin /> : '发送验证码'}
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 'verify' && (
          <Form form={form} layout="vertical" onFinish={handleVerify}>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Text type="secondary">
                验证码已发送到 <Text strong>{email}</Text>
              </Text>
            </div>

            <Form.Item
              name="code"
              label="验证码"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input
                placeholder="请输入6位验证码"
                size="large"
                maxLength={6}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%', height: 44, fontSize: 16 }}
              >
                {loading ? <Spin /> : '验证'}
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 'reset' && (
          <Form form={form} layout="vertical" onFinish={handleReset}>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 8 }} />
              <div>
                <Text strong>验证通过</Text>
              </div>
            </div>

            <Form.Item
              name="password"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少为6位' }
              ]}
            >
              <Input.Password
                placeholder="请输入新密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              rules={[{ required: true, message: '请确认密码' }]}
            >
              <Input.Password
                placeholder="请再次输入密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%', height: 44, fontSize: 16 }}
              >
                {loading ? <Spin /> : '重置密码'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;