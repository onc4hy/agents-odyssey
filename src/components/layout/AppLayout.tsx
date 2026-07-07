// 文件路径: src/components/layout/AppLayout.tsx
// 应用主布局组件 - 智能体奥德赛项目
// 实现顶部导航 + 左侧树形导航 + 右侧内容区的全局固定布局

'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import TopHeader from './TopHeader';
import SideNavbar from './SideNavbar';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { initDB } from '@/lib/indexeddb';
import { searchIndex } from '@/lib/search';

const { Header, Sider, Content } = Layout;

/**
 * 应用主布局属性接口
 */
interface AppLayoutProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 当前激活的导航 key */
  activeNavKey?: string;
  /** 是否显示侧边栏 */
  showSidebar?: boolean;
}

/**
 * 应用主布局组件
 * 全局固定布局：顶部导航 + 左侧树形导航 + 右侧内容区
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeNavKey = 'home',
  showSidebar = true
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOnline, isSyncing, setSyncing } = useOnlineStatus();
  const [isClient, setIsClient] = useState(false);

  // 客户端初始化
  useEffect(() => {
    setIsClient(true);

    // 初始化 IndexedDB
    initDB().catch((error) => {
      console.error('IndexedDB 初始化失败:', error);
    });

    // 初始化搜索索引
    searchIndex.init().catch((error) => {
      console.error('搜索索引初始化失败:', error);
    });
  }, []);

  // 监听在线状态，恢复在线时触发同步
  useEffect(() => {
    if (isClient && isOnline && !isSyncing) {
      // 这里可以触发增量同步逻辑
      // setSyncing(true);
      // 执行同步...
      // setSyncing(false);
    }
  }, [isOnline, isClient, isSyncing, setSyncing]);

  /**
   * 切换侧边栏折叠状态
   */
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  /**
   * 移动端切换侧边栏
   */
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
      {/* 顶部导航栏 */}
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: 64,
          lineHeight: '64px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* 左侧：Logo + 折叠按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {showSidebar && (
            <span
              onClick={toggleCollapsed}
              style={{
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center'
              }}
              className="sidebar-toggle-btn"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          )}
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff', whiteSpace: 'nowrap' }}>
            智能体奥德赛
          </div>
        </div>

        {/* 中间：空白占位区域 */}
        <div style={{ flex: 1 }} />

        {/* 右侧：顶部导航内容 */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <TopHeader activeNavKey={activeNavKey} />
        </div>
      </Header>

      <Layout>
        {/* 左侧侧边栏 */}
        {showSidebar && (
          <Sider
            width={240}
            collapsedWidth={64}
            collapsed={collapsed}
            trigger={null}
            style={{
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: 64,
              left: 0
            }}
            className="app-sider"
          >
            <SideNavbar activeNavKey={activeNavKey} collapsed={collapsed} />
          </Sider>
        )}

        {/* 右侧主内容区 */}
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
            background: '#f5f5f5'
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* 移动端遮罩层 */}
      {mobileOpen && showSidebar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 99,
            display: 'none'
          }}
          onClick={toggleMobileSidebar}
          className="mobile-overlay"
        />
      )}
    </Layout>
  );
};

export default AppLayout;
