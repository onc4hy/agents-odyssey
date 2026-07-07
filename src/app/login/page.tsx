// 文件路径: src/app/login/page.tsx
// 登录页面 - 智能体奥德赛项目
// 用户登录入口页面

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  message,
  Space,
  Spin
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  GithubOutlined,
  GoogleOutlined
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

/**
 * 登录页面
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      // 模拟登录请求
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (values.username && values.password) {
        login({
          id: '1',
          username: values.username,
          email: `${values.username}@example.com`
        });
        message.success('登录成功');
        router.push('/agents');
      } else {
        message.error('请输入用户名和密码');
      }
    } catch (error) {
      message.error('登录失败，请重试');
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 跳转到注册页面
   */
  const handleRegister = () => {
    router.push('/register');
  };

  /**
   * 处理忘记密码
   */
  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
        {/* Logo 和标题 */}
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

        {/* 登录表单 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="请输入用户名或邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="请输入密码"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox>记住我</Checkbox>
              <Text
                style={{ cursor: 'pointer', fontSize: 13, color: '#1677ff' }}
                onClick={handleForgotPassword}
              >
                忘记密码?
              </Text>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: 44, fontSize: 16 }}
            >
              {loading ? <Spin /> : '登 录'}
            </Button>
          </Form.Item>
        </Form>

        {/* 第三方登录 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
            <Text type="secondary" style={{ margin: '0 12px', fontSize: 13 }}>其他登录方式</Text>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          </div>
          <Space style={{ justifyContent: 'center', width: '100%' }}>
            <Button
              icon={<GithubOutlined />}
              onClick={() => message.info('GitHub 登录开发中')}
            >
              GitHub
            </Button>
            <Button
              icon={<GoogleOutlined />}
              onClick={() => message.info('Google 登录开发中')}
            >
              Google
            </Button>
          </Space>
        </div>

        {/* 注册链接 */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
              还没有账号?{' '}
              <Text style={{ cursor: 'pointer', color: '#1677ff' }} onClick={handleRegister}>
                立即注册
              </Text>
            </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
