// 文件路径: src/components/agents/AgentsContentArea.tsx
// 智能体平台右侧双标签页内容区组件 - 智能体奥德赛项目
// 实现全部 + 提示词智能体 + 工作流智能体三标签页展示，支持多维度筛选

'use client';

import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import type { TabsProps } from 'antd';
import AgentSquare from './AgentSquare';
import { AgentType } from '@/types';

/**
 * 筛选维度接口
 */
interface FilterDimensions {
  /** 部署状态: 全部 | 已部署 | 部署失败 | 未部署 */
  deployStatus: string;
  /** 内容产出质量: 全部 | 优 | 良 | 中 | 差 */
  contentQuality: string;
  /** 资源消耗: 全部 | 高 | 中 | 低 */
  resourceConsumption: string;
}

/**
 * 智能体内容区属性接口
 */
interface AgentsContentAreaProps {
  /** 初始激活的标签页 */
  defaultActiveKey?: string;
  /** 当前选中的智能体类型筛选 */
  selectedAgentType?: AgentType;
}

/**
 * 智能体平台右侧三标签页内容区组件
 * 包含全部、提示词智能体、工作流智能体三个标签页
 */
const AgentsContentArea: React.FC<AgentsContentAreaProps> = ({
  defaultActiveKey = 'all',
  selectedAgentType
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [filters, setFilters] = useState<FilterDimensions>({
    deployStatus: '全部',
    contentQuality: '全部',
    resourceConsumption: '全部'
  });

  /**
   * 标签页切换处理
   */
  const handleTabChange: TabsProps['onChange'] = (key) => {
    setActiveKey(key);
  };

  /**
   * 筛选变化处理
   */
  const handleFilterChange = (dimension: keyof FilterDimensions, value: string) => {
    setFilters((prev) => ({ ...prev, [dimension]: value }));
  };

  /**
   * 根据标签页 key 映射智能体类型
   */
  const getAgentTypeByTabKey = (key: string): AgentType | undefined => {
    if (key === 'prompt') return AgentType.PROMPT;
    if (key === 'workflow') return AgentType.WORKFLOW;
    return undefined; // 全部
  };

  /**
   * 标签页配置
   */
  const tabItems: TabsProps['items'] = [
    {
      key: 'all',
      label: '全部',
      children: (
        <Card
          style={{ height: '100%', border: 'none', borderRadius: 0 }}
          styles={{ body: { padding: 0, height: '100%' } }}
        >
          <AgentSquare
            agentType={selectedAgentType ?? getAgentTypeByTabKey(activeKey)}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </Card>
      )
    },
    {
      key: 'prompt',
      label: '提示词智能体',
      children: (
        <Card
          style={{ height: '100%', border: 'none', borderRadius: 0 }}
          styles={{ body: { padding: 0, height: '100%' } }}
        >
          <AgentSquare
            agentType={AgentType.PROMPT}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </Card>
      )
    },
    {
      key: 'workflow',
      label: '工作流智能体',
      children: (
        <Card
          style={{ height: '100%', border: 'none', borderRadius: 0 }}
          styles={{ body: { padding: 0, height: '100%' } }}
        >
          <AgentSquare
            agentType={AgentType.WORKFLOW}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={tabItems}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
        size="large"
        tabBarStyle={{
          marginBottom: 0,
          paddingLeft: 16,
          paddingRight: 16,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0'
        }}
      />
    </div>
  );
};

export default AgentsContentArea;