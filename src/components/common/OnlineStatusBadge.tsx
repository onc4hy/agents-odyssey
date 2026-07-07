// 文件路径: src/components/common/OnlineStatusBadge.tsx
// 在线状态徽章组件 - 智能体奥德赛项目
// 显示当前在线/离线/同步中状态

'use client';

import React from 'react';
import { Badge, Tooltip } from 'antd';
import { OnlineStatus } from '@/types';

/**
 * 在线状态徽章属性接口
 */
interface OnlineStatusBadgeProps {
  /** 当前状态 */
  status: OnlineStatus;
  /** 是否显示文字 */
  showText?: boolean;
  /** 尺寸 */
  size?: 'medium' | 'small';
}

/**
 * 在线状态徽章组件
 * 显示在线/离线/同步中状态指示
 */
const OnlineStatusBadge: React.FC<OnlineStatusBadgeProps> = ({
  status,
  showText = false,
  size = 'medium'
}) => {
  /**
   * 获取状态配置
   */
  const getStatusConfig = () => {
    switch (status) {
      case OnlineStatus.ONLINE:
        return {
          status: 'success' as const,
          text: '在线',
          color: '#52c41a',
          tooltip: '当前在线，数据实时同步'
        };
      case OnlineStatus.OFFLINE:
        return {
          status: 'default' as const,
          text: '离线',
          color: '#8c8c8c',
          tooltip: '当前离线，所有操作将在本地保存，联网后自动同步'
        };
      case OnlineStatus.SYNCING:
        return {
          status: 'processing' as const,
          text: '同步中',
          color: '#1677ff',
          tooltip: '正在同步数据...'
        };
      default:
        return {
          status: 'default' as const,
          text: '未知',
          color: '#8c8c8c',
          tooltip: '状态未知'
        };
    }
  };

  const config = getStatusConfig();

  const badge = (
    <Badge
      status={config.status}
      text={showText ? config.text : undefined}
      size={size}
    />
  );

  return (
    <Tooltip title={config.tooltip} placement="bottom">
      <span className="online-status-badge">{badge}</span>
    </Tooltip>
  );
};

export default OnlineStatusBadge;
