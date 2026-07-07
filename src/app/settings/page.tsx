// 文件路径: src/app/settings/page.tsx
// 设置页面 - 智能体奥德赛项目
// 用户设置、同步设置、平台绑定管理

'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, Typography, List, Switch, Button, Space } from 'antd';
import {
  SettingOutlined,
  CloudOutlined,
  UserOutlined,
  SafetyOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 设置页面
 */
const SettingsPage: React.FC = () => {
  const [autoSync, setAutoSync] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(false);

  const settingsGroups = [
    {
      key: 'account',
      title: '账户设置',
      icon: <UserOutlined />,
      items: [
        { label: '个人资料', desc: '修改头像、昵称、个人简介', action: <Button type="link">编辑</Button> },
        { label: '密码修改', desc: '修改登录密码', action: <Button type="link">修改</Button> }
      ]
    },
    {
      key: 'sync',
      title: '同步设置',
      icon: <CloudOutlined />,
      items: [
        {
          label: '自动同步',
          desc: '联网时自动同步本地数据到云端',
          action: (
            <Switch
              checked={autoSync}
              onChange={setAutoSync}
            />
          )
        },
        {
          label: '离线模式',
          desc: '强制使用本地数据，不进行云端同步',
          action: (
            <Switch
              checked={offlineMode}
              onChange={setOfflineMode}
            />
          )
        },
        { label: '同步状态', desc: '查看同步日志和冲突处理', action: <Button type="link">查看</Button> }
      ]
    },
    {
      key: 'data',
      title: '数据管理',
      icon: <DatabaseOutlined />,
      items: [
        { label: '导出数据', desc: '导出所有本地数据为 JSON 文件', action: <Button type="link">导出</Button> },
        { label: '导入数据', desc: '从 JSON 文件导入数据', action: <Button type="link">导入</Button> },
        { label: '清空本地数据', desc: '删除所有本地存储的数据', action: <Button type="link" danger>清空</Button> }
      ]
    },
    {
      key: 'security',
      title: '安全设置',
      icon: <SafetyOutlined />,
      items: [
        { label: '平台 API 密钥管理', desc: '管理各第三方平台的 API 配置', action: <Button type="link">管理</Button> },
        { label: '数据加密', desc: '本地数据加密存储', action: <Button type="link">配置</Button> }
      ]
    }
  ];

  return (
    <AppLayout activeNavKey="settings" showSidebar={true}>
      <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          <SettingOutlined style={{ marginRight: 8 }} />
          设置
        </Title>

        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {settingsGroups.map((group) => (
            <Card key={group.key} title={group.title}>
              <List
                dataSource={group.items}
                renderItem={(item) => (
                  <List.Item
                    actions={[item.action]}
                    style={{ borderBottom: 'none', padding: '12px 0' }}
                  >
                    <List.Item.Meta
                      title={item.label}
                      description={<Text type="secondary">{item.desc}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </Space>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
