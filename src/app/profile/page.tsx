// 文件路径: src/app/profile/page.tsx
// 个人中心页面 - 基本信息查看、编辑资料、修改密码、头像上传

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Space,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  Table
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  UploadOutlined,
  SaveOutlined,
  RobotOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn, updateUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // 未登录时跳转到登录页
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // 初始化头像和表单数据
  React.useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar || undefined);
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, profileForm]);

  if (!isLoggedIn || !user) {
    return null;
  }

  // 将图片文件转为 base64 Data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 头像上传配置 - 本地存储 base64
  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    accept: 'image/png,image/jpeg,image/gif,image/webp',
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const dataUrl = await readFileAsDataURL(file as File);
        // 更新头像到用户数据（localStorage 持久化）
        updateUser({ avatar: dataUrl });
        setAvatarUrl(dataUrl);
        message.success('头像上传成功');
        onSuccess?.(null);
      } catch {
        message.error('头像上传失败，请重试');
        onError?.(new Error('上传失败'));
      }
    }
  };

  // 保存个人信息
  const handleSaveProfile = async (values: { username: string; email: string; phone: string }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateUser({
        username: values.username,
        email: values.email,
        phone: values.phone
      });
      message.success('个人信息更新成功');
    } catch {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch {
      message.error('修改密码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 用户统计数据（模拟）
  const userStats = {
    agentsCount: 5,
    deploymentsCount: 12,
    platformsCount: 3,
    iterationsCount: 8
  };

  // 智能体列表（模拟）
  const agentsData = [
    { id: '1', name: '智能客服助手', type: '提示词型', status: '运行中', createTime: '2024-01-15' },
    { id: '2', name: '数据分析专家', type: '工作流型', status: '已部署', createTime: '2024-01-10' },
    { id: '3', name: '文档生成器', type: '提示词型', status: '开发中', createTime: '2024-01-08' }
  ];

  const agentsColumns = [
    { title: '智能体名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color={type === '提示词型' ? 'blue' : 'purple'}>{type}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === '运行中' ? 'success' : status === '已部署' ? 'processing' : 'warning'}>{status}</Tag> },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' }
  ];

  // 基本信息标签页内容
  const renderInfoTab = () => (
    <>
      {/* 用户头像和基本信息 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Upload {...uploadProps}>
            <div style={{ cursor: 'pointer', position: 'relative' }}>
              <Avatar size={80} src={avatarUrl} icon={!avatarUrl ? <UserOutlined /> : undefined} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#1677ff',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <EditOutlined style={{ fontSize: 12 }} />
              </div>
            </div>
          </Upload>
          <div>
            <Title level={5} style={{ margin: 0 }}>{user.username}</Title>
            <Text type="secondary">{user.email || '未设置邮箱'}</Text>
            <br />
            <Tag color="blue" style={{ marginTop: 8 }}>普通用户</Tag>
          </div>
        </div>
      </Card>

      {/* 用户统计 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="智能体数量"
              value={userStats.agentsCount}
              prefix={<RobotOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="部署次数"
              value={userStats.deploymentsCount}
              prefix={<DeploymentUnitOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="使用平台"
              value={userStats.platformsCount}
              prefix={<GlobalOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="迭代次数"
              value={userStats.iterationsCount}
              prefix={<CalendarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Col>
        </Row>
      </Card>

      {/* 我的智能体 */}
      <Card title="我的智能体">
        <Table
          dataSource={agentsData}
          columns={agentsColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </>
  );

  // 编辑资料标签页内容
  const renderEditTab = () => (
    <Card>
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleSaveProfile}
      >
        <Divider>个人信息</Divider>

        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" maxLength={50} showCount />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>

        <Form.Item
          label="手机号"
          name="phone"
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Divider>头像设置</Divider>

        <Form.Item label="更换头像">
          <Space>
            <Avatar size={64} src={avatarUrl} icon={!avatarUrl ? <UserOutlined /> : undefined} />
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传头像</Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: 12 }}>
              支持 JPG、PNG 格式，大小不超过 2MB
            </Text>
          </Space>
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            保存修改
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // 修改密码标签页内容
  const renderPasswordTab = () => (
    <Card>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
      >
        <Divider>密码修改</Divider>

        <Form.Item
          label="当前密码"
          name="oldPassword"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password placeholder="请输入当前密码" />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6位' }
          ]}
        >
          <Input.Password placeholder="请输入新密码（至少6位）" />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              }
            })
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <AppLayout activeNavKey="profile" showSidebar={false}>
      <div style={{ padding: 16, height: '100%', overflowY: 'auto', maxWidth: 900, margin: '0 auto' }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          个人中心
        </Title>

        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: 'info',
              label: <span><UserOutlined />基本信息</span>,
              children: renderInfoTab()
            },
            {
              key: 'edit',
              label: <span><EditOutlined />编辑资料</span>,
              children: renderEditTab()
            },
            {
              key: 'password',
              label: <span><LockOutlined />修改密码</span>,
              children: renderPasswordTab()
            }
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
