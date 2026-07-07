// 文件路径: src/app/agents/page.tsx
// 智能体平台页面 - 智能体奥德赛项目
// 左侧树形导航 + 右侧双标签页（智能体广场 + 平台广场）

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import AppLayout from '@/components/layout/AppLayout';
import AgentsContentArea from '@/components/agents/AgentsContentArea';
import { AgentType } from '@/types';

/**
 * 智能体平台内容组件
 * 使用 useSearchParams，需要被 Suspense 包裹
 */
const AgentsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [selectedType, setSelectedType] = useState<AgentType | undefined>();

  useEffect(() => {
    if (typeParam === 'prompt') {
      setSelectedType(AgentType.PROMPT);
    } else if (typeParam === 'workflow') {
      setSelectedType(AgentType.WORKFLOW);
    } else {
      setSelectedType(undefined);
    }
  }, [typeParam]);

  return (
    <div style={{ height: '100%' }}>
      <AgentsContentArea
        defaultActiveKey="all"
        selectedAgentType={selectedType}
      />
    </div>
  );
};

/**
 * 智能体平台页面
 * 用 Suspense 包裹使用 useSearchParams 的子组件
 */
const AgentsPage: React.FC = () => {
  return (
    <AppLayout activeNavKey="agents" showSidebar={true}>
      <Suspense fallback={<div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spin /></div>}>
        <AgentsContent />
      </Suspense>
    </AppLayout>
  );
};

export default AgentsPage;
