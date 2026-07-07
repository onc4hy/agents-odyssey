# Agents Odyssey / 智能体奥德赛

[English](./README.md) | [中文](./README.zh-CN.md)

---


### 项目简介

**智能体奥德赛（Agents Odyssey）** 是一个 **Loop 式主体/分身智能体进化全自动闭环平台**。核心理念源于古希腊奥德赛的"漂泊归巢"隐喻——智能体本体（主体）在主平台创建后，以分身形式部署到多个第三方平台，在多平台探索中产生差异化数据，通过全域数据回收、归一化抹平、量化择优迭代，形成全自动进化闭环。

### 核心能力

| 能力 | 描述 |
|------|------|
| 🤖 统一创建管理 | 在主平台统一创建和管理提示词型、工作流型智能体，一套配置，全域复用 |
| 🌐 多平台差异化部署 | 自动适配国内外主流智能体平台，一键批量部署分身，无需逐平台手动配置 |
| 🔄 全域数据回收 | 定时回收各平台差异化运行产生的内容数据与工作流日志，聚合全域资产 |
| 📊 归一化择优迭代 | 抹平平台能力差异，多维度量化择取优质数据，精准迭代优化智能体本体 |
| ⚡ Loop 式进化闭环 | 本体迭代→分身升级→数据回收→再迭代，形成全自动智能体进化闭环 |
| 🛡️ 离线优先架构 | PWA 离线在线一体化，本地数据安全存储，联网自动双向同步 |

### 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16 |
| UI | React | 19 |
| 语言 | TypeScript | 5.6+ |
| 组件库 | Ant Design | 6 |
| 云端数据库 | SQLite (better-sqlite3) | 11 |
| 本地存储 | IndexedDB (idb) | - |
| 全文检索 | FlexSearch | 0.7 |
| 离线支持 | PWA | - |

### 项目结构

```
src/
├── app/                          # Next.js App Router 页面与 API
│   ├── page.tsx                  # 首页 Landing
│   ├── layout.tsx                # 根布局
│   ├── agents/                   # 主智能体模块
│   │   ├── page.tsx              # 智能体平台页
│   │   ├── [id]/page.tsx         # 智能体详情
│   │   └── create/page.tsx       # 新建智能体
│   ├── platforms/                # 分身平台模块
│   │   ├── page.tsx              # 平台管理页
│   │   ├── create/page.tsx       # 新增平台
│   │   ├── deploy/page.tsx       # 分身部署
│   │   ├── deployments/page.tsx  # 部署记录
│   │   ├── diff/page.tsx         # 差异台账
│   │   └── collect/page.tsx      # 数据回收中心
│   ├── iterations/page.tsx       # 迭代中心
│   ├── profile/page.tsx          # 个人中心
│   ├── login/                    # 登录
│   ├── register/                 # 注册
│   ├── forgot-password/          # 忘记密码
│   ├── settings/                 # 设置
│   └── api/                      # RESTful API
│       ├── agents/route.ts       # GET/POST
│       ├── agents/[id]/route.ts  # GET/PUT/DELETE
│       └── platforms/route.ts    # GET/POST
├── components/
│   ├── layout/                   # 布局组件（AppLayout, SideNavbar, TopHeader）
│   ├── agents/                   # 智能体组件（AgentSquare, AgentsContentArea）
│   ├── platforms/                # 平台组件（PlatformSquare）
│   └── common/                   # 通用组件（OnlineStatusBadge）
├── lib/                          # 核心库
│   ├── db/sqlite.ts              # SQLite 封装
│   ├── indexeddb/index.ts        # IndexedDB 封装
│   ├── adaptation/engine.ts      # 工作流适配引擎
│   ├── normalization/index.ts    # 归一化与量化择优
│   └── search/index.ts           # FlexSearch 全文检索
├── types/index.ts                # 全局类型定义
├── constants/index.ts            # 常量配置
├── utils/index.ts                # 工具函数
├── context/AuthContext.tsx        # 认证上下文
├── hooks/useOnlineStatus.ts      # 网络状态 Hook
└── data/platforms.ts             # 平台初始数据
```

### 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build

# 生产模式
pnpm start

# 类型检查
pnpm run typecheck
```

访问 http://localhost:3000 查看应用。

### 功能模块

#### 智能体管理
- 全部/提示词智能体/工作流智能体三标签页切换
- 多维度筛选：部署状态、内容产出质量、资源消耗
- 智能体创建、编辑、详情查看、删除
- 综合得分与迭代记录跟踪

#### 平台管理
- 国内/海外分身平台分类展示
- 深色对比卡片主题展示平台信息
- 平台详情查看、编辑、同步
- 差异台账管理（组件支持率、能力矩阵、适配规则）
- 新增平台与全量同步

#### 分身部署
- 四步骤部署向导：选择智能体→选择平台→配置适配→确认部署
- 部署记录管理与状态跟踪

#### 迭代中心
- 量化评分概览统计
- 迭代历史与版本对比
- 优化建议生成

#### 用户系统
- 登录/注册/忘记密码
- 个人中心（基本信息、编辑资料、修改密码、头像上传）
- 在线/离线状态指示
- 系统设置

#### 数据层
- SQLite 云端存储 + IndexedDB 本地存储双模式
- FlexSearch 离线全文检索
- 跨平台工作流适配引擎（组件替换、节点裁剪、参数适配）
- 数据归一化与量化择优算法

### Loop 式进化闭环流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1.统一创建   │────▶│ 2.差异化部署  │────▶│ 3.全域数据回收│
│ 主平台创建    │     │ 多平台自动适配 │     │ 定时回收数据  │
└──────────────┘     └──────────────┘     └──────┬───────┘
       ▲                                        │
       │                                        ▼
┌──────┴───────┐     ┌──────────────┐     ┌──────────────┐
│ 6.全域分身升级│◀────│ 5.量化择优迭代│◀────│ 4.归一化抹平  │
│ 差异化同步    │     │ 多维度优选    │     │ 剔除平台差异  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## License

MIT
