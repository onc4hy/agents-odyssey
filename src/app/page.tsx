// 文件路径: src/app/page.tsx
// 首页 Landing 页面 - 智能体奥德赛项目
// 产品介绍 + 核心价值展示，支持 Web/H5 响应式

'use client';

import React, { useState } from 'react';
import { Button, Typography, Row, Col, Card, Space, Tag, Tabs, Dropdown, Avatar, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  RocketOutlined,
  SyncOutlined,
  BarChartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  ApiOutlined,
  RobotOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { APP_NAME, APP_NAME_EN, PRIMARY_NAV_ITEMS } from '@/constants';
import { useAuth } from '@/context/AuthContext';

const { Title, Text, Paragraph } = Typography;

/**
 * 首页 Landing 页面组件
 * 产品介绍、核心功能、价值展示
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTabChange = (key: string) => {
    const navItem = PRIMARY_NAV_ITEMS.find((item) => item.key === key);
    if (navItem) {
      router.push(navItem.path);
    }
  };

  const getActiveKey = (): string => {
    for (const item of [...PRIMARY_NAV_ITEMS].sort((a, b) => b.path.length - a.path.length)) {
      if (item.path === '/') {
        if (pathname === '/') return item.key;
      } else if (pathname === item.path || pathname.startsWith(item.path + '/') || pathname.startsWith(item.path + '?')) {
        return item.key;
      }
    }
    for (const item of PRIMARY_NAV_ITEMS) {
      if (item.path !== '/' && pathname.startsWith(item.path)) {
        return item.key;
      }
    }
    return 'home';
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        logout();
        router.push('/');
        break;
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ];

  /**
   * 核心功能数据
   */
  const features = [
    {
      icon: <RobotOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      title: '统一创建管理',
      description: '在主平台统一创建和管理提示词型、工作流型智能体，一套配置，全域复用'
    },
    {
      icon: <GlobalOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: '多平台差异化部署',
      description: '自动适配国内外主流智能体平台，一键批量部署分身，无需逐平台手动配置'
    },
    {
      icon: <SyncOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: '全域数据回收',
      description: '定时回收各平台差异化运行产生的内容数据与工作流日志，聚合全域资产'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      title: '归一化择优迭代',
      description: '抹平平台能力差异，多维度量化择取优质数据，精准迭代优化智能体本体'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
      title: 'Loop 式进化闭环',
      description: '本体迭代→分身升级→数据回收→再迭代，形成全自动智能体进化闭环'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
      title: '离线优先架构',
      description: 'PWA 离线在线一体化，本地数据安全存储，联网自动双向同步'
    }
  ];

  /**
   * 支持的平台数量
   */
  const platformStats = [
    { label: '支持平台', value: '20+', desc: '国内外主流智能体平台' },
    { label: '适配组件', value: '200+', desc: '跨平台组件映射规则' },
    { label: '迭代维度', value: '6 大', desc: '多维度量化择优模型' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* 顶部导航栏 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        {/* 左侧：Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* 手机端汉堡菜单按钮 */}
          <Button
            className="mobile-nav-btn"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileNavOpen(true)}
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/')}
          >
            A
          </div>
        </div>

        {/* 中间：空白占位区域 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 桌面端导航标签 */}
          <div className="desktop-nav-tabs" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tabs
              activeKey={getActiveKey()}
              onChange={handleTabChange}
              items={PRIMARY_NAV_ITEMS.map((item) => ({
                key: item.key,
                label: item.label
              }))}
              size="small"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        {/* 右侧：用户区域 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 8px',
                  borderRadius: 6
                }}
              >
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ fontSize: 14 }}>{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          ) : (
            <Space size={8}>
              <Button
                type="text"
                size="small"
                icon={<LoginOutlined />}
                onClick={() => router.push('/login')}
              >
                登录
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => router.push('/register')}
              >
                注册
              </Button>
            </Space>
          )}
        </div>
      </div>

      {/* Hero 区域 */}
      <div
        style={{
          padding: '120px 24px 80px',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff'
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Tag style={{ marginBottom: 24, fontSize: 14, padding: '4px 12px', color: '#764ba2', background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <ApiOutlined /> Loop 式智能体进化闭环
          </Tag>
          <Title style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>
            {APP_NAME}
          </Title>
          <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'normal', marginBottom: 24 }}>
            {APP_NAME_EN}
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 32 }}>
            统一创建 · 多平台分身差异化部署 · 全域数据回收 · 跨平台差异抹平 · 量化择优迭代
            <br />
            奥德赛漂泊归巢、外放进化，让智能体在多平台探索中持续成长
          </Paragraph>
          <Space size={16} wrap>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => router.push('/agents')}
              style={{ height: 48, padding: '0 32px', fontSize: 16 }}
            >
              立即体验
              <ArrowRightOutlined />
            </Button>
            <Button
              size="large"
              onClick={() => router.push('/platforms')}
              style={{ height: 48, padding: '0 32px', fontSize: 16 }}
            >
              查看支持平台
            </Button>
          </Space>
        </div>
      </div>

      {/* 核心数据 */}
      <div
        style={{
          padding: '60px 24px',
          background: '#fafafa'
        }}
      >
        <Row gutter={[32, 32]} style={{ maxWidth: 960, margin: '0 auto' }}>
          {platformStats.map((stat, index) => (
            <Col xs={24} sm={8} key={index}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: '#1677ff',
                    marginBottom: 8
                  }}
                >
                  {stat.value}
                </div>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                  {stat.label}
                </Text>
                <Text type="secondary">{stat.desc}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 核心功能 */}
      <div style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={2} style={{ marginBottom: 12 }}>
              核心能力
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              六大核心能力，构建智能体全自动进化闭环
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  styles={{ body: { padding: 24, textAlign: 'center' } }}
                >
                  <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                  <Title level={4} style={{ marginBottom: 12 }}>
                    {feature.title}
                  </Title>
                  <Text type="secondary">{feature.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 闭环流程图 */}
      <div style={{ padding: '80px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 12 }}>
            Loop 式进化闭环
          </Title>
          <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 48 }}>
            奥德赛漂泊归巢、外放进化的智能体成长路径
          </Text>

          <Row gutter={[16, 16]} justify="center">
            {[
              { step: 1, title: '统一创建', desc: '主平台创建标准化智能体' },
              { step: 2, title: '差异化部署', desc: '多平台自动适配分身' },
              { step: 3, title: '全域数据回收', desc: '定时回收运行数据' },
              { step: 4, title: '归一化抹平', desc: '剔除平台差异干扰' },
              { step: 5, title: '量化择优迭代', desc: '多维度优选进化本体' },
              { step: 6, title: '全域分身升级', desc: '差异化同步升级分身' }
            ].map((item, index) => (
              <Col xs={12} sm={8} md={4} key={index}>
                <Card size="small" style={{ height: '100%' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#1677ff',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.step}
                  </div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.desc}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA 区域 */}
      <div
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff'
        }}
      >
        <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
          开启你的智能体奥德赛之旅
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 32 }}>
          让智能体在多平台探索中持续进化，打造专属 AI 能力壁垒
        </Paragraph>
        <Button
          type="primary"
          size="large"
          icon={<RocketOutlined />}
          onClick={() => router.push('/agents')}
          style={{ height: 48, padding: '0 40px', fontSize: 16 }}
        >
          免费开始使用
        </Button>
      </div>

      {/* 页脚 */}
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          background: '#001529',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 12
        }}
      >
        <div style={{ marginBottom: 8 }}>
          {APP_NAME} {APP_NAME_EN}
        </div>
        <div>© 2024 智能体奥德赛团队. 保留所有权利.</div>
      </div>

      {/* 手机端导航抽屉 */}
      <Drawer
        title="导航菜单"
        placement="right"
        onClose={() => setMobileNavOpen(false)}
        open={mobileNavOpen}
        width={260}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Button
              key={item.key}
              type="text"
              block
              onClick={() => {
                router.push(item.path);
                setMobileNavOpen(false);
              }}
              style={{
                textAlign: 'left',
                height: 48,
                fontSize: 15,
                borderBottom: '1px solid #f0f0f0',
                borderRadius: 0
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

export default HomePage;
