// 文件路径: src/components/agents/PlatformSquare.tsx
// 智能体平台广场组件 - 智能体奥德赛项目
// 展示所有已绑定的第三方智能体平台、差异台账、分身部署状态等

'use client';

import React, { useState } from 'react';
import {
  Card,
  Tag,
  Button,
  Space,
  Empty,
  Typography,
  Row,
  Col,
  Progress,
  Modal,
  Descriptions,
  message,
  Drawer,
  Form,
  Input,
  Select,
  Switch
} from 'antd';
import {
  GlobalOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ThirdPartyPlatform } from '@/types';
import { PlatformRegion, PlatformType } from '@/types';
import { INITIAL_PLATFORMS } from '@/data/platforms';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 深色卡片主题色常量
const CARD_BG = '#1a1a2e';
const CARD_BORDER = '#16213e';
const CARD_TEXT_PRIMARY = '#e8e8e8';
const CARD_TEXT_SECONDARY = '#a0a0b0';

interface PlatformSquareProps {
  onEdit?: (platform: ThirdPartyPlatform) => void;
  onView?: (platform: ThirdPartyPlatform) => void;
  onSync?: (platform: ThirdPartyPlatform) => void;
}

/**
 * 平台广场组件
 * 展示所有第三方智能体平台及分身部署信息
 */
const PlatformSquare: React.FC<PlatformSquareProps> = ({ onEdit, onView, onSync }) => {
  const [platforms, setPlatforms] = useState<ThirdPartyPlatform[]>(INITIAL_PLATFORMS);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<ThirdPartyPlatform | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [editForm] = Form.useForm();
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 获取区域标签颜色
   */
  const getRegionTagColor = (region: PlatformRegion): string => {
    return region === PlatformRegion.DOMESTIC ? 'blue' : 'purple';
  };

  /**
   * 获取区域标签文本
   */
  const getRegionLabel = (region: PlatformRegion): string => {
    return region === PlatformRegion.DOMESTIC ? '国内' : '海外';
  };

  /**
   * 获取绑定状态显示
   */
  const getBindStatus = (isBound: boolean) => {
    if (isBound) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          已绑定
        </Tag>
      );
    }
    return (
      <Tag icon={<WarningOutlined />} color="default">
        未绑定
      </Tag>
    );
  };

  /**
   * 渲染平台能力评分条
   */
  const renderCapabilityScore = (platform: ThirdPartyPlatform) => {
    const matrix = platform.capabilityMatrix;
    const overallScore = Math.round(
      (matrix.componentGranularity + matrix.pluginOpenness + matrix.logGranularity) / 3
    );

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: CARD_TEXT_SECONDARY }}>综合能力</Text>
          <Text strong style={{ fontSize: 12, color: CARD_TEXT_PRIMARY }}>{overallScore}</Text>
        </div>
        <Progress percent={overallScore} size="small" showInfo={false} strokeColor="#533483" />
      </div>
    );
  };

  // 查看详情
  const handleViewDetail = (platform: ThirdPartyPlatform) => {
    setCurrentPlatform(platform);
    setDetailVisible(true);
    if (onView) {
      onView(platform);
    }
  };

  // 编辑平台
  const handleEdit = (platform: ThirdPartyPlatform) => {
    setCurrentPlatform(platform);
    editForm.setFieldsValue({
      name: platform.name,
      platformKey: platform.platformKey,
      region: platform.region,
      description: platform.description,
      website: platform.website,
      apiDocsUrl: platform.apiDocsUrl,
      isBound: platform.isBound
    });
    setEditVisible(true);
    if (onEdit) {
      onEdit(platform);
    }
  };

  // 保存编辑
  const handleEditSave = async (values: {
    name: string;
    platformKey: PlatformType;
    region: PlatformRegion;
    description: string;
    website: string;
    apiDocsUrl: string;
    isBound: boolean;
  }) => {
    if (!currentPlatform) return;
    try {
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === currentPlatform.id
            ? { ...p, ...values, updatedAt: new Date() }
            : p
        )
      );
      message.success('平台信息更新成功');
      setEditVisible(false);
    } catch {
      message.error('保存失败，请重试');
    }
  };

  // 同步单个平台
  const handleSync = async (platform: ThirdPartyPlatform) => {
    setSyncingId(platform.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platform.id ? { ...p, updatedAt: new Date() } : p
        )
      );
      message.success(`${platform.name} 同步成功`);
      if (onSync) {
        onSync(platform);
      }
    } catch {
      message.error('同步失败，请重试');
    } finally {
      setSyncingId(null);
    }
  };

  // 刷新全部平台数据
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPlatforms([...INITIAL_PLATFORMS]);
      message.success(`刷新成功，共 ${INITIAL_PLATFORMS.length} 个平台`);
    } catch {
      message.error('刷新失败，请重试');
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 渲染平台卡片 - 深色对比主题
   */
  const renderPlatformCard = (platform: ThirdPartyPlatform) => (
    <Card
      key={platform.id}
      hoverable
      style={{
        height: '100%',
        background: CARD_BG,
        borderColor: CARD_BORDER,
        borderRadius: 12
      }}
      styles={{
        body: {
          padding: 16,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      actions={[
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(platform)}
          style={{ color: '#9d4edd' }}
          key="detail"
        >
          详情
        </Button>,
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(platform)}
          style={{ color: '#4cc9f0' }}
          key="edit"
        >
          编辑
        </Button>,
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined spin={syncingId === platform.id} />}
          onClick={() => handleSync(platform)}
          style={{ color: '#f72585' }}
          disabled={syncingId === platform.id}
          key="sync"
        >
          {syncingId === platform.id ? '同步中' : '同步'}
        </Button>
      ]}
    >
      {/* 头部：平台名称 + 区域标签 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <GlobalOutlined style={{ fontSize: 20, color: '#9d4edd' }} />
          <Title level={5} style={{ margin: 0, flex: 1, fontSize: 15, color: CARD_TEXT_PRIMARY }}>
            {platform.name}
          </Title>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag color={getRegionTagColor(platform.region)} style={{ margin: 0 }}>
            {getRegionLabel(platform.region)}
          </Tag>
          {getBindStatus(platform.isBound)}
        </div>
      </div>

      {/* 平台描述 */}
      <Text style={{ fontSize: 12, marginBottom: 12, minHeight: 36, color: CARD_TEXT_SECONDARY }}>
        {platform.description}
      </Text>

      {/* 能力评分 */}
      <div style={{ marginBottom: 12 }}>
        {renderCapabilityScore(platform)}
      </div>

      {/* 能力特性标签 */}
      <div style={{ marginBottom: 12 }}>
        {platform.capabilityMatrix.ragNative && (
          <Tag color="green" style={{ marginBottom: 4, background: 'rgba(82, 196, 26, 0.15)', borderColor: 'rgba(82, 196, 26, 0.3)' }}>RAG</Tag>
        )}
        {platform.capabilityMatrix.loopSupport && (
          <Tag color="blue" style={{ marginBottom: 4, background: 'rgba(22, 119, 255, 0.15)', borderColor: 'rgba(22, 119, 255, 0.3)' }}>循环</Tag>
        )}
        {platform.capabilityMatrix.branchSupport && (
          <Tag color="cyan" style={{ marginBottom: 4, background: 'rgba(19, 194, 194, 0.15)', borderColor: 'rgba(19, 194, 194, 0.3)' }}>分支</Tag>
        )}
        {platform.capabilityMatrix.autoExecution && (
          <Tag color="purple" style={{ marginBottom: 4, background: 'rgba(114, 46, 209, 0.15)', borderColor: 'rgba(114, 46, 209, 0.3)' }}>自动化</Tag>
        )}
        {platform.capabilityMatrix.privateDeployment && (
          <Tag color="orange" style={{ marginBottom: 4, background: 'rgba(250, 173, 20, 0.15)', borderColor: 'rgba(250, 173, 20, 0.3)' }}>私有化</Tag>
        )}
      </div>

      {/* 底部：组件支持数 */}
      <div
        style={{
          marginTop: 'auto',
          fontSize: 12,
          color: CARD_TEXT_SECONDARY,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span>
          支持组件:{' '}
          {platform.capabilityMatrix.components.filter((c) => c.supported).length}/
          {platform.capabilityMatrix.components.length}
        </span>
      </div>
    </Card>
  );

  const domesticPlatforms = platforms.filter((p) => p.region === PlatformRegion.DOMESTIC);
  const overseasPlatforms = platforms.filter((p) => p.region === PlatformRegion.OVERSEAS);

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* 顶部操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          分身平台广场
          <Text type="secondary" style={{ fontSize: 14, marginLeft: 8, fontWeight: 'normal' }}>
            共 {platforms.length} 个平台
          </Text>
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} loading={refreshing} onClick={handleRefresh}>刷新</Button>
          <Button icon={<LinkOutlined />}>绑定平台</Button>
        </Space>
      </div>

      {/* 国内平台 */}
      {domesticPlatforms.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <Tag color="blue" style={{ marginRight: 8 }}>国内平台</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {domesticPlatforms.length} 个平台
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {domesticPlatforms.map((platform) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={platform.id}>
                {renderPlatformCard(platform)}
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 海外平台 */}
      {overseasPlatforms.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <Tag color="purple" style={{ marginRight: 8 }}>海外平台</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {overseasPlatforms.length} 个平台
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {overseasPlatforms.map((platform) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={platform.id}>
                {renderPlatformCard(platform)}
              </Col>
            ))}
          </Row>
        </div>
      )}

      {platforms.length === 0 && <Empty description="暂无平台数据" style={{ marginTop: 60 }} />}

      {/* 详情弹窗 */}
      <Modal
        title={`平台详情 - ${currentPlatform?.name || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary" onClick={() => { setDetailVisible(false); handleEdit(currentPlatform!); }}>
            编辑平台
          </Button>
        ]}
        width={700}
      >
        {currentPlatform && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="平台名称" span={2}>{currentPlatform.name}</Descriptions.Item>
            <Descriptions.Item label="平台标识">{currentPlatform.platformKey}</Descriptions.Item>
            <Descriptions.Item label="所属区域">
              {getRegionLabel(currentPlatform.region)}
            </Descriptions.Item>
            <Descriptions.Item label="绑定状态">
              {currentPlatform.isBound ? '已绑定' : '未绑定'}
            </Descriptions.Item>
            <Descriptions.Item label="官网">
              <a href={currentPlatform.website} target="_blank" rel="noopener noreferrer">
                {currentPlatform.website || '-'}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="API 文档">
              <a href={currentPlatform.apiDocsUrl} target="_blank" rel="noopener noreferrer">
                {currentPlatform.apiDocsUrl || '-'}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="平台描述" span={2}>
              {currentPlatform.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="组件支持率" span={2}>
              {currentPlatform.capabilityMatrix.components.filter((c) => c.supported).length}/
              {currentPlatform.capabilityMatrix.components.length}
            </Descriptions.Item>
            <Descriptions.Item label="组件颗粒度">
              {currentPlatform.capabilityMatrix.componentGranularity}/100
            </Descriptions.Item>
            <Descriptions.Item label="插件开放度">
              {currentPlatform.capabilityMatrix.pluginOpenness}/100
            </Descriptions.Item>
            <Descriptions.Item label="日志粒度">
              {currentPlatform.capabilityMatrix.logGranularity}/100
            </Descriptions.Item>
            <Descriptions.Item label="API鉴权复杂度">
              {currentPlatform.capabilityMatrix.authComplexity}/100
            </Descriptions.Item>
            <Descriptions.Item label="能力特性" span={2}>
              <Space wrap>
                {currentPlatform.capabilityMatrix.loopSupport && <Tag color="blue">循环</Tag>}
                {currentPlatform.capabilityMatrix.branchSupport && <Tag color="cyan">分支</Tag>}
                {currentPlatform.capabilityMatrix.ragNative && <Tag color="green">RAG</Tag>}
                {currentPlatform.capabilityMatrix.autoExecution && <Tag color="purple">自动化</Tag>}
                {currentPlatform.capabilityMatrix.privateDeployment && <Tag color="orange">私有化</Tag>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 编辑抽屉 */}
      <Drawer
        title="编辑平台信息"
        placement="right"
        width={480}
        open={editVisible}
        onClose={() => setEditVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setEditVisible(false)}>取消</Button>
            <Button type="primary" onClick={() => editForm.submit()}>保存</Button>
          </Space>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSave}
        >
          <Form.Item
            label="平台名称"
            name="name"
            rules={[{ required: true, message: '请输入平台名称' }]}
          >
            <Input placeholder="请输入平台名称" />
          </Form.Item>

          <Form.Item
            label="平台标识"
            name="platformKey"
            rules={[{ required: true, message: '请选择平台标识' }]}
          >
            <Select placeholder="请选择平台标识">
              {Object.values(PlatformType).map((key) => (
                <Option key={key} value={key}>{key}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="所属区域"
            name="region"
            rules={[{ required: true, message: '请选择区域' }]}
          >
            <Select placeholder="请选择区域">
              <Option value={PlatformRegion.DOMESTIC}>国内</Option>
              <Option value={PlatformRegion.OVERSEAS}>海外</Option>
            </Select>
          </Form.Item>

          <Form.Item label="平台描述" name="description">
            <TextArea rows={3} placeholder="请输入平台描述" maxLength={200} showCount />
          </Form.Item>

          <Form.Item label="官网地址" name="website">
            <Input placeholder="请输入官网地址" />
          </Form.Item>

          <Form.Item label="API 文档地址" name="apiDocsUrl">
            <Input placeholder="请输入 API 文档地址" />
          </Form.Item>

          <Form.Item
            label="绑定状态"
            name="isBound"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PlatformSquare;
