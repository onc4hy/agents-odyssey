// 文件路径: src/app/layout.tsx
// 根布局组件 - 智能体奥德赛项目
// 定义全局 HTML 结构、元数据与全局样式

import type { Metadata, Viewport } from 'next';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: '智能体奥德赛 - Agents-Odyssey',
  description:
    'Loop式主体/分身智能体进化全自动闭环。统一创建、多平台分身差异化部署、全域数据回收、归一化择优迭代的智能体进化平台。',
  keywords: [
    '智能体',
    'AI Agent',
    '工作流',
    '多平台部署',
    '智能体进化',
    'Agents-Odyssey',
    '奥德赛'
  ],
  authors: [{ name: '智能体奥德赛团队' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1677ff'
};

/**
 * 根布局组件
 * 包裹所有页面，提供全局配置和样式
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 6,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
            },
            components: {
              Layout: {
                headerBg: '#fff',
                siderBg: '#001529',
                bodyBg: '#f5f5f5'
              }
            }
          }}
        >
          <AntdApp>
            <AuthProvider>{children}</AuthProvider>
          </AntdApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
