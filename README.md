# Agents Odyssey / 智能体奥德赛

[English](./README.md) | [中文](./README.zh-CN.md)

---

### Overview

**Agents Odyssey** is a **Loop-style Agent/Avatar Evolution Automated Closed-Loop Platform**. The core concept draws from the ancient Greek Odyssey metaphor of "wandering and returning" — an agent body (principal) is created on the main platform, deployed as avatars to multiple third-party platforms, generates differentiated data across platforms, and forms an automated evolution loop through global data recovery, normalization, and quantitative optimization iteration.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| 🤖 Unified Creation & Management | Create and manage prompt-type and workflow-type agents on the main platform, one configuration for all platforms |
| 🌐 Multi-Platform Differentiated Deployment | Auto-adapt to mainstream domestic and overseas agent platforms, one-click batch deployment of avatars |
| 🔄 Global Data Recovery | Periodically recover differentiated content data and workflow logs from all platforms, aggregate global assets |
| 📊 Normalized Optimization Iteration | Eliminate platform capability differences, quantitatively select premium data, precisely iterate and optimize agent bodies |
| ⚡ Loop-style Evolution Closed-Loop | Body iteration → Avatar upgrade → Data recovery → Re-iteration, forming a fully automated agent evolution loop |
| 🛡️ Offline-First Architecture | PWA offline/online integration, secure local data storage, automatic bidirectional sync when online |

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| UI | React | 19 |
| Language | TypeScript | 5.6+ |
| Component Library | Ant Design | 6 |
| Cloud Database | SQLite (better-sqlite3) | 11 |
| Local Storage | IndexedDB (idb) | - |
| Full-Text Search | FlexSearch | 0.7 |
| Offline Support | PWA | - |

### Project Structure

```
src/
├── app/                          # Next.js App Router pages & API
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── agents/                   # Main Agent module
│   │   ├── page.tsx              # Agent platform page
│   │   ├── [id]/page.tsx         # Agent detail
│   │   └── create/page.tsx       # Create agent
│   ├── platforms/                # Avatar Platform module
│   │   ├── page.tsx              # Platform management
│   │   ├── create/page.tsx       # Add platform
│   │   ├── deploy/page.tsx       # Avatar deployment
│   │   ├── deployments/page.tsx  # Deployment records
│   │   ├── diff/page.tsx         # Difference ledger
│   │   └── collect/page.tsx      # Data recovery center
│   ├── iterations/page.tsx       # Iteration center
│   ├── profile/page.tsx          # User profile
│   ├── login/                    # Login
│   ├── register/                 # Register
│   ├── forgot-password/          # Forgot password
│   ├── settings/                 # Settings
│   └── api/                      # RESTful API
│       ├── agents/route.ts       # GET/POST
│       ├── agents/[id]/route.ts  # GET/PUT/DELETE
│       └── platforms/route.ts    # GET/POST
├── components/
│   ├── layout/                   # Layout components (AppLayout, SideNavbar, TopHeader)
│   ├── agents/                   # Agent components (AgentSquare, AgentsContentArea)
│   ├── platforms/                # Platform components (PlatformSquare)
│   └── common/                   # Common components (OnlineStatusBadge)
├── lib/                          # Core libraries
│   ├── db/sqlite.ts              # SQLite wrapper
│   ├── indexeddb/index.ts        # IndexedDB wrapper
│   ├── adaptation/engine.ts      # Workflow adaptation engine
│   ├── normalization/index.ts    # Normalization & quantitative optimization
│   └── search/index.ts           # FlexSearch full-text search
├── types/index.ts                # Global type definitions
├── constants/index.ts            # Constants configuration
├── utils/index.ts                # Utility functions
├── context/AuthContext.tsx        # Authentication context
├── hooks/useOnlineStatus.ts      # Network status hook
└── data/platforms.ts             # Platform initial data
```

### Getting Started

```bash
# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Build
pnpm run build

# Production mode
pnpm start

# Type checking
pnpm run typecheck
```

Visit http://localhost:3000 to view the application.

### Feature Modules

#### Agent Management
- Three-tab switching: All / Prompt Agents / Workflow Agents
- Multi-dimensional filtering: deployment status, content quality, resource consumption
- Agent creation, editing, detail viewing, deletion
- Overall score and iteration record tracking

#### Platform Management
- Domestic/overseas avatar platform categorized display
- Dark-contrast card theme for platform information
- Platform detail viewing, editing, synchronization
- Difference ledger management (component support rate, capability matrix, adaptation rules)
- Add platform and full synchronization

#### Avatar Deployment
- Four-step deployment wizard: Select agent → Select platform → Configure adaptation → Confirm deployment
- Deployment record management and status tracking

#### Iteration Center
- Quantitative scoring overview statistics
- Iteration history and version comparison
- Optimization suggestion generation

#### User System
- Login / Register / Forgot password
- User profile (basic info, edit profile, change password, avatar upload)
- Online/offline status indicator
- System settings

#### Data Layer
- SQLite cloud storage + IndexedDB local storage dual mode
- FlexSearch offline full-text search
- Cross-platform workflow adaptation engine (component replacement, node pruning, parameter adaptation)
- Data normalization and quantitative optimization algorithm

### Loop-style Evolution Closed-Loop Process

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1.Unified     │────▶│ 2.Different- │────▶│ 3.Global Data│
│    Creation   │     │    iated     │     │    Recovery  │
│ Main platform │     │  Deployment  │     │ Periodic     │
└──────────────┘     └──────────────┘     └──────┬───────┘
       ▲                                        │
       │                                        ▼
┌──────┴───────┐     ┌──────────────┐     ┌──────────────┐
│ 6.Global      │◀────│ 5.Quantified │◀────│ 4.Normalized │
│    Avatar     │     │  Optimized   │     │  Flattening  │
│    Upgrade    │     │  Iteration   │     │ Eliminate    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## License

MIT
