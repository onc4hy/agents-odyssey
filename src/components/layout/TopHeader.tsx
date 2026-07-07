// 文件路径: src/components/layout/TopHeader.tsx
// 顶部导航栏组件 - 智能体奥德赛项目
// 实现一级功能导航标签与用户登录/注册/状态显示区域

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs, Dropdown, Avatar, Button, Space, message } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { PRIMARY_NAV_ITEMS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import OnlineStatusBadge from '../common/OnlineStatusBadge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * 顶部导航栏属性接口
 */
interface TopHeaderProps {
  /** 当前激活的导航 key */
  activeNavKey?: string;
}

/**
 * 顶部导航栏组件
 * 包含一级功能导航标签和用户状态区域
 */
const TopHeader: React.FC<TopHeaderProps> = ({ activeNavKey }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const { status } = useOnlineStatus();

  // 根据路径计算当前激活的导航项（优先匹配更具体的路径）
  const getActiveKey = (): string => {
    if (activeNavKey) return activeNavKey;

    // 按路径长度降序排列，优先匹配更具体的路径
    const sorted = [...PRIMARY_NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
    for (const item of sorted) {
      if (item.path === '/') {
        if (pathname === '/') return item.key;
      } else if (pathname === item.path || pathname.startsWith(item.path + '/') || pathname.startsWith(item.path + '?')) {
        return item.key;
      }
    }
    // 兜底：检查是否以某个路径开头
    for (const item of sorted) {
      if (item.path !== '/' && pathname.startsWith(item.path)) {
        return item.key;
      }
    }
    return 'home';
  };

  /**
   * 处理导航标签切换
   */
  const handleTabChange = (key: string) => {
    const navItem = PRIMARY_NAV_ITEMS.find((item) => item.key === key);
    if (navItem) {
      router.push(navItem.path);
    }
  };

  /**
   * 处理用户菜单点击
   */
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
        message.success('已退出登录');
        router.push('/');
        break;
    }
  };

  /**
   * 用户下拉菜单配置
   */
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* 一级导航标签 */}
      <div className="desktop-nav-tabs">
        <Tabs
          activeKey={getActiveKey()}
          onChange={handleTabChange}
          items={PRIMARY_NAV_ITEMS.map((item) => ({
            key: item.key,
            label: item.label
          }))}
          style={{ marginBottom: 0 }}
          size="small"
        />
      </div>

      {/* 在线状态 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <OnlineStatusBadge status={status} />
      </div>

      {/* 用户区域 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {isLoggedIn ? (
          <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
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
  );
};

export default TopHeader;
