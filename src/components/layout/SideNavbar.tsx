// 文件路径: src/components/layout/SideNavbar.tsx
// 左侧导航栏组件 - 三区域结构，支持三级导航、搜索过滤、折叠高亮

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  RobotOutlined,
  ApiOutlined,
  DeploymentUnitOutlined,
  AppstoreOutlined,
  SearchOutlined,
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { AGENTS_SIDEBAR_NAV, PLATFORMS_SIDEBAR_NAV, PRIMARY_NAV_ITEMS } from '@/constants';

interface SideNavbarProps {
  activeNavKey?: string;
  collapsed?: boolean;
}

/** 三级导航项类型 */
interface NavChild3 {
  key: string;
  title: string;
}
interface NavChild2 {
  key: string;
  title: string;
  children?: NavChild3[];
}
interface NavGroup {
  key: string;
  title: string;
  children: (NavChild2 | NavChild3)[];
}

const SideNavbar: React.FC<SideNavbarProps> = ({ activeNavKey: _activeNavKey, collapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  /** 获取一级导航图标 */
  const getPrimaryNavIcon = (key: string): React.ReactNode => {
    switch (key) {
      case 'home': return <HomeOutlined />;
      case 'agents': return <RobotOutlined />;
      case 'platforms': return <DeploymentUnitOutlined />;
      case 'collect': return <DatabaseOutlined />;
      case 'iterations': return <BarChartOutlined />;
      case 'settings': return <SettingOutlined />;
      default: return <AppstoreOutlined />;
    }
  };

  /** 获取二级导航图标 */
  const getMenuIcon = (key: string): React.ReactNode => {
    switch (key) {
      case 'agent-square': return <AppstoreOutlined />;
      case 'prompt-agents': return <RobotOutlined />;
      case 'workflow-agents': return <ApiOutlined />;
      case 'domestic-platforms': return <GlobalOutlined />;
      case 'overseas-platforms': return <CloudUploadOutlined />;
      case 'platform-common': return <DeploymentUnitOutlined />;
      case 'platform-list': return <AppstoreOutlined />;
      case 'avatar-platforms': return <DeploymentUnitOutlined />;
      default: return <AppstoreOutlined />;
    }
  };

  /** 将三级导航数据递归转为 Ant Design Menu items */
  const buildMenuItems = (groups: NavGroup[], trimmed: string): MenuProps['items'] => {
    return groups.map((group) => {
      // 过滤子项
      const filteredChildren = group.children.filter((child) => {
        if (!trimmed) return true;
        const titleMatch = child.title.toLowerCase().includes(trimmed);
        const childMatch = 'children' in child && child.children
          ? child.children.some((c) => c.title.toLowerCase().includes(trimmed))
          : false;
        return titleMatch || childMatch;
      }).map((child) => {
        // 如果有三级子项（NavChild2 类型）
        if ('children' in child && child.children && child.children.length > 0) {
          const filteredSubChildren = trimmed
            ? child.children.filter((c) => c.title.toLowerCase().includes(trimmed) || child.title.toLowerCase().includes(trimmed))
            : child.children;
          if (trimmed && filteredSubChildren.length === 0 && !child.title.toLowerCase().includes(trimmed)) {
            return null;
          }
          return {
            key: child.key,
            icon: getMenuIcon(child.key),
            label: child.title,
            children: filteredSubChildren.map((c) => ({
              key: c.key,
              label: c.title
            }))
          };
        }
        // 二级叶子节点（NavChild3 类型）
        if (trimmed && !child.title.toLowerCase().includes(trimmed)) {
          return null;
        }
        return {
          key: child.key,
          label: child.title
        };
      }).filter(Boolean);

      const groupMatches = trimmed ? group.title.toLowerCase().includes(trimmed) : true;
      if (trimmed && !groupMatches && filteredChildren.length === 0) return null;

      return {
        key: group.key,
        icon: getMenuIcon(group.key),
        label: group.title,
        children: filteredChildren
      };
    }).filter(Boolean) as MenuProps['items'];
  };

  /** 构建完整菜单项 */
  const menuItems: MenuProps['items'] = useMemo(() => {
    const trimmed = searchValue.trim().toLowerCase();
    const items: MenuProps['items'] = [];

    // 区域一：首页
    const homeItem = PRIMARY_NAV_ITEMS.find((item) => item.key === 'home');
    if (homeItem && (!trimmed || homeItem.label.toLowerCase().includes(trimmed))) {
      items.push({
        key: homeItem.key,
        icon: getPrimaryNavIcon(homeItem.key),
        label: homeItem.label
      });
    }

    // 区域二：根据当前路径显示对应的侧边导航（/platforms/collect 是独立功能，不显示平台侧边导航）
    if (pathname.startsWith('/agents')) {
      const agentItems = buildMenuItems(AGENTS_SIDEBAR_NAV as unknown as NavGroup[], trimmed);
      items.push(...(agentItems || []));
    } else if (pathname.startsWith('/platforms') && !pathname.startsWith('/platforms/collect')) {
      const platformItems = buildMenuItems(PLATFORMS_SIDEBAR_NAV as unknown as NavGroup[], trimmed);
      items.push(...(platformItems || []));
    }

    // 区域三：其他一级功能（排除首页和当前已展开的模块）
    const otherItems = PRIMARY_NAV_ITEMS.filter((item) => {
      if (item.key === 'home') return false;
      // 如果在 /agents 页面，折叠智能体相关项
      if (pathname.startsWith('/agents') && item.key === 'agents') return false;
      // 如果在 /platforms 页面（排除 /platforms/collect），折叠平台相关项
      if (pathname.startsWith('/platforms') && !pathname.startsWith('/platforms/collect') && item.key === 'platforms') return false;
      // 如果在 /platforms/collect 页面，折叠数据回收和平台管理
      if (pathname.startsWith('/platforms/collect') && (item.key === 'collect' || item.key === 'platforms')) return false;
      return true;
    }).filter((item) => {
      if (!trimmed) return true;
      return item.label.toLowerCase().includes(trimmed);
    }).map((item) => ({
      key: item.key,
      icon: getPrimaryNavIcon(item.key),
      label: item.label
    }));

    if (otherItems.length > 0) {
      items.push(...otherItems);
    }

    return items;
  }, [searchValue, pathname]);

  /** 计算当前路径应该自动展开的菜单组（仅展开当前路径对应的层级） */
  const getAutoOpenKeys = (): string[] => {
    const trimmed = searchValue.trim().toLowerCase();

    // 搜索模式：展开所有匹配的组
    if (trimmed) {
      const keys: string[] = [];
      const expandGroups = (groups: NavGroup[]) => {
        groups.forEach((group) => {
          const groupMatch = group.title.toLowerCase().includes(trimmed);
          const childMatch = group.children.some((child) => {
            if (child.title.toLowerCase().includes(trimmed)) return true;
            if ('children' in child && child.children) {
              return child.children.some((c) => c.title.toLowerCase().includes(trimmed));
            }
            return false;
          });
          if (groupMatch || childMatch) {
            keys.push(group.key);
            group.children.forEach((child) => {
              if ('children' in child && child.children) {
                const subMatch = child.title.toLowerCase().includes(trimmed) ||
                  child.children.some((c) => c.title.toLowerCase().includes(trimmed));
                if (subMatch) keys.push(child.key);
              }
            });
          }
        });
      };
      if (pathname.startsWith('/agents')) expandGroups(AGENTS_SIDEBAR_NAV as unknown as NavGroup[]);
      if (pathname.startsWith('/platforms') && !pathname.startsWith('/platforms/collect')) {
        expandGroups(PLATFORMS_SIDEBAR_NAV as unknown as NavGroup[]);
      }
      return keys;
    }

    // /platforms/collect 是独立功能，不展开平台侧边导航
    if (pathname.startsWith('/platforms/collect')) return [];

    // /agents 页面：只展开主智能体广场 + 当前类型对应的子组
    if (pathname.startsWith('/agents')) {
      const keys: string[] = ['agent-square']; // 始终展开主智能体广场
      if (pathname.includes('workflow')) {
        keys.push('workflow-agents');
      } else {
        keys.push('prompt-agents');
      }
      return keys;
    }

    // /platforms 页面：只展开包含当前选中项的组
    if (pathname.startsWith('/platforms')) {
      const selectedKeys = getSelectedKeys();
      const keys: string[] = [];
      (PLATFORMS_SIDEBAR_NAV as unknown as NavGroup[]).forEach((group) => {
        const hasSelected = group.children.some((child) => {
          if (selectedKeys.includes(child.key)) return true;
          if ('children' in child && (child as NavChild2).children) {
            return (child as NavChild2).children!.some((c) => selectedKeys.includes(c.key));
          }
          return false;
        });
        if (hasSelected) keys.push(group.key);
      });
      return keys;
    }

    return [];
  };

  // 路径或搜索变化时，重新计算应该展开的 keys
  React.useEffect(() => {
    setOpenKeys(getAutoOpenKeys());
  }, [pathname, searchValue]);

  /** 获取当前选中的菜单项 */
  const getSelectedKeys = (): string[] => {
    // /platforms/collect 是独立功能，不选中平台子项
    if (pathname.startsWith('/platforms/collect')) return ['collect'];

    if (pathname.startsWith('/agents')) {
      if (pathname.includes('workflow') && !pathname.includes('create')) return ['workflow-list'];
      if (pathname.includes('/agents/create')) {
        return pathname.includes('type=workflow') ? ['workflow-create'] : ['prompt-create'];
      }
      return ['prompt-list'];
    }

    if (pathname.startsWith('/platforms')) {
      if (pathname.includes('/platforms/deployments')) return ['deployment-record-domestic', 'deployment-record-overseas'];
      if (pathname.includes('/platforms/collect')) return ['collect'];
      if (pathname.includes('/platforms/deploy')) return ['avatar-deploy-domestic', 'avatar-deploy-overseas'];
      if (pathname.includes('/platforms/create')) return ['platform-create'];
      if (pathname.includes('/platforms/diff')) return ['platform-diff'];
      return ['platform-all'];
    }

    if (pathname.startsWith('/iterations')) return ['iterations'];
    if (pathname.startsWith('/settings')) return ['settings'];
    if (pathname === '/') return ['home'];
    return ['home'];
  };

  /** 菜单点击处理 */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // 一级导航项
    const primaryNavItem = PRIMARY_NAV_ITEMS.find((item) => item.key === key);
    if (primaryNavItem) {
      router.push(primaryNavItem.path);
      return;
    }

    // 二级/三级导航项
    switch (key) {
      case 'prompt-list':
        router.push('/agents?type=prompt');
        break;
      case 'prompt-create':
        router.push('/agents/create?type=prompt');
        break;
      case 'workflow-list':
        router.push('/agents?type=workflow');
        break;
      case 'workflow-create':
        router.push('/agents/create?type=workflow');
        break;
      case 'platform-all':
      case 'platform-all-domestic':
      case 'platform-all-overseas':
        router.push('/platforms');
        break;
      case 'platform-create':
        router.push('/platforms/create');
        break;
      case 'platform-diff':
        router.push('/platforms/diff');
        break;
      case 'avatar-deploy-domestic':
      case 'avatar-deploy-overseas':
        router.push('/platforms/deploy');
        break;
      case 'deployment-record-domestic':
      case 'deployment-record-overseas':
        router.push('/platforms/deployments');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!collapsed && (
        <div style={{ padding: 12 }}>
          <Input
            placeholder="搜索导航"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
            allowClear
          />
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          mode="inline"
          theme="dark"
          items={menuItems}
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
          inlineCollapsed={collapsed}
        />
      </div>

      {!collapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.45)'
          }}
        >
          <div style={{ marginBottom: 4 }}>智能体总数: 12</div>
          <div>部署平台: 5</div>
        </div>
      )}
    </div>
  );
};

export default SideNavbar;
