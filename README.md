# Base UI – Admin Core Platform

> A metadata-driven admin framework with dynamic CRUD, query builder, relation engine, and reusable UI components.

---

## Vision

Build a **production-grade internal admin platform** that allows developers to:

1. **Define entity schemas** (JSON/metadata) → get full CRUD UI automatically
2. **Compose UI** from a battle-tested component library
3. **Extend freely** — override any component, hook, or layout
4. **Scale** from prototype to enterprise without rewriting

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    client/                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  Admin Platform Client (Vite + React 18)      │  │
│  │                                               │  │
│  │  components/base/   – Button, Table, Modal…   │  │
│  │  components/auth/   – PrivateRoute            │  │
│  │  components/query-builder/ – QueryBuilder     │  │
│  │  hooks/             – useCrud, useSchema      │  │
│  │  stores/            – auth, table, ui         │  │
│  │  modules/           – dashboard, crud, ai…    │  │
│  │  core/              – apiClient, providers    │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│                    server/                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  NestJS Backend                               │  │
│  │  - Multi-DB (pg, mysql2, oracledb)            │  │
│  │  - JWT Auth (Passport)                        │  │
│  │  - Dynamic schema discovery                   │  │
│  │  - Generic CRUD endpoints                     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Language       | TypeScript 5.x (strict mode)        |
| Framework      | React 18                            |
| Build          | Vite 5                              |
| Monorepo       | pnpm workspaces                     |
| Styling        | Tailwind CSS 3 + CVA                |
| State (client) | Zustand                             |
| State (server) | TanStack React Query v5             |
| Forms          | React Hook Form + Zod               |
| Routing        | React Router v6 (lazy loading)      |
| HTTP Client    | Axios (singleton with interceptors) |
| Icons          | Lucide React                        |
| Linting        | ESLint + Prettier                   |
| Commits        | Commitlint + Husky                  |

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the client app
pnpm dev

# Run the server
pnpm dev:server

# Build
pnpm build

# Lint & format
pnpm lint
pnpm format
```

---

## Project Structure

```
base-ui/
├── client/                  # Frontend (Vite + React 18)
│   ├── src/
│   │   ├── components/      # Base UI + auth + query-builder
│   │   ├── config/          # Entity registry
│   │   ├── core/            # API client, providers, utils
│   │   ├── hooks/           # useCrud, useSchema
│   │   ├── layouts/         # AdminLayout
│   │   ├── modules/         # Feature pages (dashboard, crud, ai)
│   │   ├── stores/          # Zustand stores (auth, table, ui)
│   │   └── types/           # TypeScript types
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                  # Backend (NestJS)
├── docs/                    # Documentation
├── rules/                   # Architecture rules
├── pnpm-workspace.yaml
├── package.json             # Root scripts & dev deps
├── .eslintrc.cjs
├── .prettierrc
├── commitlint.config.js
└── README.md
```

---

## Phases

| Phase | Description                     | Status |
| ----- | ------------------------------- | ------ |
| 0     | Foundation Setup (monorepo)     | ✅     |
| 1     | Design System + Base Components | 🔲     |
| 2     | Core Engine (Dynamic UI)        | 🔲     |
| 3     | Relation + Query Builder        | 🔲     |
| 4     | Example Config App              | 🔲     |
| 5     | Hardening + Polish              | 🔲     |

---

## Contributing

1. Follow [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages
2. Run `pnpm lint` and `pnpm format` before pushing
3. All PRs must pass type-check

---

## License

MIT
