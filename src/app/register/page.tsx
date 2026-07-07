// 文件路径: src/app/register/page.tsx
// 注册页面 - 智能体奥德赛项目
// 用户注册入口页面

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
  Spin
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 注册页面
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: { username: string; email: string; password: string; confirmPassword: string; agree: boolean }) => {
    setLoading(true);
    try {
      // 验证密码一致
      if (values.password !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        setLoading(false);
        return;
      }

      // 模拟注册请求
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success('注册成功');
      router.push('/login');
    } catch (error) {
      message.error('注册失败，请重试');
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 跳转到登录页面
   */
  const handleLogin = () => {
    router.push('/login');
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
            创建账号
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            开启智能体奥德赛之旅
          </Text>
        </div>

        {/* 注册表单 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="请输入邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
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

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="请再次输入密码"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item name="agree" valuePropName="checked" rules={[{ required: true, message: '请阅读并同意服务条款' }]}>
            <Checkbox>
              我已阅读并同意{' '}
              <Text style={{ cursor: 'pointer', color: '#1677ff' }}>服务条款</Text>{' '}
              和{' '}
              <Text style={{ cursor: 'pointer', color: '#1677ff' }}>隐私政策</Text>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: 44, fontSize: 16 }}
            >
              {loading ? <Spin /> : '注 册'}
            </Button>
          </Form.Item>
        </Form>

        {/* 登录链接 */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            已有账号?{' '}
            <Text style={{ cursor: 'pointer', color: '#1677ff' }} onClick={handleLogin}>
              立即登录
            </Text>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
