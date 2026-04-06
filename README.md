# 💳 SubTrack — Smart Subscription Management System

> A production-ready, full-stack DevOps project for tracking, managing, and analyzing all your subscriptions in one place.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20Redis%20%7C%20Docker-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📐 Architecture Diagram

```
                         ┌─────────────────────────────────────────┐
                         │              Internet / Client           │
                         └──────────────────┬──────────────────────┘
                                            │ :80
                         ┌──────────────────▼──────────────────────┐
                         │               NGINX                      │
                         │   (Reverse Proxy + Gzip + Security)      │
                         └────────┬──────────────────┬─────────────┘
                                  │ /api/*            │ /*
                    ┌─────────────▼──────┐   ┌───────▼──────────┐
                    │  Backend (Node.js)  │   │ Frontend (React)  │
                    │  Express + Prisma   │   │  Vite + Tailwind  │
                    │    Port: 5000       │   │   Port: 3000      │
                    └─────┬──────┬───────┘   └──────────────────┘
                          │      │
             ┌────────────▼──┐ ┌─▼──────────┐
             │  PostgreSQL   │ │    Redis    │
             │  (Prisma ORM) │ │  (Cache +  │
             │  Port: 5432   │ │   Queue)   │
             └───────────────┘ └────────────┘
                    │
         ┌──────────▼────────────┐
         │        Monitoring      │
         │  Prometheus + Grafana  │
         │  :9090        :3001    │
         └────────────────────────┘

         CI/CD: GitHub Actions → Docker Hub → SSH Deploy
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT-based register/login with bcrypt hashing |
| 💳 CRUD | Full subscription management (create, read, update, delete) |
| 🔍 Search & Filter | Filter by category, status, and search by name |
| 📊 Analytics | Monthly/annual spend, category breakdown, 6-month trend chart |
| 🔔 Renewal Alerts | Daily cron + UI banner for subscriptions due within 3 days |
| ⚡ Redis Caching | Analytics endpoints cached for 5 minutes |
| 📈 Prometheus Metrics | Request count, duration histograms, active subscriptions gauge |
| 📉 Grafana Dashboards | Pre-built 4-panel monitoring dashboard |
| 🐳 Docker | Full containerized stack with docker-compose |
| 🚀 CI/CD | GitHub Actions pipeline with test → build → deploy → notify |

---

## 🛠️ Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x
- [Node.js](https://nodejs.org/) ≥ 18.x (for local dev only)
- [Git](https://git-scm.com/)

---

## 🚀 Running Locally (Development)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/smart-sub-mgmt.git
cd smart-sub-mgmt
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your values (defaults work for local dev)
```

### 3. Start all services

```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Backend API** on port 5000
- **Frontend** on port 3000
- **Nginx** (entry point) on **port 80** → visit http://localhost
- **Prometheus** on port 9090
- **Grafana** on port 3001 (admin / admin123)

### 4. Run database migrations

```bash
docker-compose exec backend npx prisma migrate dev --name init
```

### 5. Seed demo data (optional)

```bash
docker-compose exec backend npm run seed
```

Login with: `demo@smartsub.io` / `demo1234`

---

## 🏭 Running in Production

### 1. Set up secrets

Fill in all variables in `.env` with production values (strong passwords, real JWT secret, etc.)

### 2. Build and push Docker images

```bash
docker login
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push
```

### 3. On your production server

```bash
git clone https://github.com/yourusername/smart-sub-mgmt.git
cd smart-sub-mgmt
cp .env.example .env  # fill in production values

docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | `subadmin` |
| `POSTGRES_PASSWORD` | PostgreSQL password | — |
| `POSTGRES_DB` | Database name | `smart_sub_db` |
| `DATABASE_URL` | Prisma connection string | auto-built |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | — |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost` |
| `DOCKER_USERNAME` | Docker Hub username for CI/CD | — |
| `VITE_API_URL` | Frontend API base URL | `/api` |
| `GRAFANA_USER` | Grafana admin username | `admin` |
| `GRAFANA_PASSWORD` | Grafana admin password | `admin123` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for CI/CD | — |
| `DEPLOY_HOST` | Production server IP/hostname | — |
| `DEPLOY_USER` | SSH username | — |

> **Set GitHub Actions Secrets**: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`, `VITE_API_URL`, `SLACK_WEBHOOK_URL`

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Subscriptions (`/api/subscriptions`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/subscriptions` | ✅ | List all subscriptions (supports `?category=`, `?status=`, `?search=`) |
| POST | `/api/subscriptions` | ✅ | Create new subscription |
| PUT | `/api/subscriptions/:id` | ✅ | Update subscription |
| DELETE | `/api/subscriptions/:id` | ✅ | Delete subscription |
| GET | `/api/subscriptions/upcoming` | ✅ | Get renewals in next 7 days (`?days=N`) |

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/spend` | ✅ | Monthly + annual total spend |
| GET | `/api/analytics/by-category` | ✅ | Spend grouped by category |
| GET | `/api/analytics/trend` | ✅ | Monthly spend for last 6 months |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Health check → `{status, timestamp, uptime}` |
| GET | `/metrics` | Internal | Prometheus metrics endpoint |

---

## 🖼️ Screenshots Description

| Page | Description |
|---|---|
| **Login** | Dark-themed auth form with toggle between Sign In / Create Account, gradient orbs background, demo credentials hint |
| **Dashboard** | 4 KPI cards (Monthly Spend, Annual, Active Count, Upcoming Renewals), donut chart for category breakdown, recent subscriptions list, yellow alert banner for urgent renewals |
| **Subscriptions** | Searchable/filterable card grid with category and status chips, each card shows logo, name, cost, billing cycle, next billing date, status badge, edit/delete buttons. Urgent cards have yellow accent stripe |
| **Analytics** | 3 summary stats + line chart (6-month trend) + bar chart (by category) + top 5 most expensive subscriptions with progress bars |
| **Settings** | User profile card with avatar initial, currency selector, logout button |

---

## 📁 Project Structure

```
smart-sub-mgmt/
├── docker-compose.yml         # Development stack
├── docker-compose.prod.yml    # Production stack with resource limits
├── .env.example               # All environment variable templates
├── .gitignore
├── README.md
├── nginx/                     # Reverse proxy
│   ├── Dockerfile
│   └── nginx.conf             # Gzip, security headers, upstreams
├── backend/                   # Express API
│   ├── Dockerfile             # Multi-stage, non-root user
│   ├── package.json
│   ├── server.js              # Entry: middleware, routes, cron, health
│   ├── prisma/schema.prisma   # User + Subscription models + enums
│   └── src/
│       ├── config/            # db.js (Prisma) + redis.js (ioredis)
│       ├── middleware/        # auth.js (JWT) + errorHandler.js
│       ├── routes/            # auth, subscription, analytics
│       ├── controllers/       # auth, subscription, analytics
│       ├── services/          # subscription.service + notification.service
│       └── utils/             # metrics.js (Prometheus) + seed.js
├── frontend/                  # React + Vite + Tailwind
│   ├── Dockerfile             # Multi-stage: Vite build → nginx serve
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js     # Custom navy/cyan theme
│   ├── index.html
│   └── src/
│       ├── api/client.js      # Axios + JWT interceptor
│       ├── store/useStore.js  # Zustand (auth + subscriptions)
│       ├── pages/             # Login, Dashboard, Subscriptions, Analytics, Settings
│       └── components/        # Navbar, SubscriptionCard, AddSubscriptionModal, SpendingChart, AlertBanner
├── monitoring/
│   ├── prometheus.yml         # Scrape config (15s interval, 15d retention)
│   └── grafana/dashboards/    # Pre-built 4-panel Grafana dashboard JSON
└── .github/workflows/
    └── ci-cd.yml              # Test → Build+Push → SSH Deploy → Slack notify
```

---

## 🔧 Useful Commands

```bash
# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Open Prisma Studio (DB GUI)
docker-compose exec backend npx prisma studio

# Seed database
docker-compose exec backend npm run seed

# Stop everything
docker-compose down

# Stop + remove volumes (clean slate)
docker-compose down -v
```

---

## 📜 License

MIT © 2024 — Smart Subscription Management System
