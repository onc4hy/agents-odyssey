// 文件路径: src/hooks/useOnlineStatus.ts
// 在线/离线状态管理 Hook - 智能体奥德赛项目
// 监听网络状态变化，提供实时在线状态与同步管理能力

import { useState, useEffect, useCallback, useRef } from 'react';
import { OnlineStatus } from '@/types';
import { isOnline } from '@/utils';

/**
 * 在线状态 Hook 返回值接口
 */
interface UseOnlineStatusReturn {
  /** 当前在线状态 */
  status: OnlineStatus;
  /** 是否在线 */
  isOnline: boolean;
  /** 是否离线 */
  isOffline: boolean;
  /** 是否正在同步 */
  isSyncing: boolean;
  /** 设置同步状态 */
  setSyncing: (syncing: boolean) => void;
  /** 手动刷新状态 */
  refreshStatus: () => void;
}

/**
 * 在线/离线状态管理 Hook
 * 监听浏览器 online/offline 事件，实时更新状态
 * 提供同步状态管理能力
 * @returns 在线状态与操作方法
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [status, setStatus] = useState<OnlineStatus>(OnlineStatus.ONLINE);
  const [isSyncingState, setIsSyncingState] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 更新在线状态
   */
  const updateStatus = useCallback(() => {
    const online = isOnline();
    if (online) {
      if (!isSyncingState) {
        setStatus(OnlineStatus.ONLINE);
      }
    } else {
      setStatus(OnlineStatus.OFFLINE);
    }
  }, [isSyncingState]);

  /**
   * 设置同步状态
   * @param syncing 是否正在同步
   */
  const setSyncing = useCallback((syncing: boolean) => {
    setIsSyncingState(syncing);

    if (syncing) {
      setStatus(OnlineStatus.SYNCING);
      // 防止同步状态卡死，最多 5 分钟后自动恢复
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = setTimeout(() => {
        setIsSyncingState(false);
        if (isOnline()) {
          setStatus(OnlineStatus.ONLINE);
        } else {
          setStatus(OnlineStatus.OFFLINE);
        }
      }, 5 * 60 * 1000);
    } else {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      if (isOnline()) {
        setStatus(OnlineStatus.ONLINE);
      } else {
        setStatus(OnlineStatus.OFFLINE);
      }
    }
  }, []);

  /**
   * 手动刷新状态
   */
  const refreshStatus = useCallback(() => {
    updateStatus();
  }, [updateStatus]);

  useEffect(() => {
    // 初始化状态
    updateStatus();

    // 监听在线事件
    const handleOnline = () => {
      if (isSyncingState) {
        setStatus(OnlineStatus.SYNCING);
      } else {
        setStatus(OnlineStatus.ONLINE);
      }
    };

    // 监听离线事件
    const handleOffline = () => {
      setStatus(OnlineStatus.OFFLINE);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [updateStatus, isSyncingState]);

  return {
    status,
    isOnline: status === OnlineStatus.ONLINE,
    isOffline: status === OnlineStatus.OFFLINE,
    isSyncing: status === OnlineStatus.SYNCING,
    setSyncing,
    refreshStatus
  };
}

export default useOnlineStatus;
