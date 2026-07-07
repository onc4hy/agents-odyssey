// 文件路径: src/app/iterations/page.tsx
// 迭代中心页面 - 智能体奥德赛项目
// 展示量化迭代记录、择优内容、版本对比

'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, Typography, List, Tag, Progress, Space, Button, Empty, Row, Col } from 'antd';
import {
  BarChartOutlined,
  RocketOutlined,
  HistoryOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { formatDate } from '@/utils';

const { Title, Text } = Typography;

/**
 * 模拟迭代记录数据
 */
const mockIterations = [
  {
    id: '1',
    agentName: '文案创作专家',
    fromVersion: 'v1.2.2',
    toVersion: 'v1.2.3',
    beforeScore: 82.5,
    afterScore: 87.5,
    improvement: 5.0,
    sampleCount: 156,
    createdAt: new Date('2024-03-20'),
    status: 'completed'
  },
  {
    id: '2',
    agentName: '客户服务工作流',
    fromVersion: 'v2.0.0',
    toVersion: 'v2.0.1',
    beforeScore: 88.3,
    afterScore: 92.3,
    improvement: 4.0,
    sampleCount: 234,
    createdAt: new Date('2024-03-18'),
    status: 'completed'
  },
  {
    id: '3',
    agentName: '数据分析助手',
    fromVersion: 'v1.0.4',
    toVersion: 'v1.0.5',
    beforeScore: 75.2,
    afterScore: 78.2,
    improvement: 3.0,
    sampleCount: 89,
    createdAt: new Date('2024-03-10'),
    status: 'completed'
  }
];

/**
 * 迭代中心页面
 */
const IterationsPage: React.FC = () => {
  return (
    <AppLayout activeNavKey="iterations" showSidebar={true}>
      <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
        {/* 页面标题 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            <BarChartOutlined style={{ marginRight: 8 }} />
            迭代中心
          </Title>
          <Button type="primary" icon={<RocketOutlined />}>
            触发新一轮迭代
          </Button>
        </div>

        {/* 概览统计 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1677ff' }}>
                    12
                  </div>
                  <Text type="secondary">累计迭代次数</Text>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                    +8.5
                  </div>
                  <Text type="secondary">平均得分提升</Text>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#722ed1' }}>
                    1,256
                  </div>
                  <Text type="secondary">累计优质样本</Text>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
                    5
                  </div>
                  <Text type="secondary">当前迭代智能体</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 迭代记录列表 */}
        <Card title="迭代记录" extra={<a>查看全部</a>}>
          {mockIterations.length > 0 ? (
            <List
              dataSource={mockIterations}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">
                      查看详情
                    </Button>,
                    <Button type="link" size="small">
                      回滚
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<HistoryOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                    title={
                      <Space>
                        <Text strong>{item.agentName}</Text>
                        <Tag color="blue">
                          {item.fromVersion} → {item.toVersion}
                        </Tag>
                        <Tag color="green" icon={<ArrowUpOutlined />}>
                          +{item.improvement.toFixed(1)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space size={24}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          优质样本: {item.sampleCount}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(item.createdAt, 'YYYY-MM-DD HH:mm')}
                        </Text>
                      </Space>
                    }
                  />
                  <div style={{ width: 200 }}>
                    <Progress
                      percent={item.afterScore}
                      showInfo={true}
                      size="small"
                      strokeColor={{
                        '0%': '#52c41a',
                        '100%': '#1677ff'
                      }}
                    />
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无迭代记录" />
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default IterationsPage;
