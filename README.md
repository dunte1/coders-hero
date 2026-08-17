# Coder's Hero ERP & LMS

An enterprise-grade ERP and Learning Management System built with Laravel 12 (PHP 8.3) backend and React 19 (TypeScript) frontend.

## Features

- **ERP Module**: Departments, employees, positions, project management, task tracking
- **LMS Module**: Courses, lessons, quizzes, enrollments, certificates, announcements
- **RBAC**: Role-based access control with granular permissions
- **Dashboard**: Real-time analytics with charts and metrics
- **Queue System**: Redis-backed job processing with Horizon
- **Notifications**: Real-time and email notifications

## Prerequisites

- Docker & Docker Compose (recommended)
- OR: PHP 8.3+, MySQL 8.0, Redis 7, Node.js 20+, Composer 2

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone <repository-url> coders-hero
cd coders-hero

# 2. Copy environment file
cp .env.example .env

# 3. Build and start containers
make build
make up

# 4. Install backend dependencies
make install-backend

# 5. Generate application key
make key-generate

# 6. Run database migrations and seed
make fresh

# 7. Install frontend dependencies
make install-frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

## Manual Installation

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Setup

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | local | Application environment |
| `APP_DEBUG` | true | Debug mode |
| `DB_HOST` | mysql | Database host |
| `DB_DATABASE` | coders_hero | Database name |
| `DB_USERNAME` | root | Database user |
| `DB_PASSWORD` | secret | Database password |
| `REDIS_HOST` | redis | Redis host |
| `QUEUE_CONNECTION` | redis | Queue driver |
| `CACHE_STORE` | redis | Cache driver |
| `SESSION_DRIVER` | redis | Session driver |

## API Documentation

The backend exposes RESTful API endpoints under `/api`. Key endpoint groups:

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Authentication (login, register, logout) |
| `/api/departments` | Department CRUD |
| `/api/employees` | Employee management |
| `/api/courses` | Course management |
| `/api/lessons` | Lesson content |
| `/api/quizzes` | Quiz system |
| `/api/enrollments` | Enrollment management |
| `/api/projects` | Project management |
| `/api/tasks` | Task tracking |
| `/api/announcements` | Announcements |
| `/api/dashboard` | Dashboard data |

Authentication uses Laravel Sanctum token-based auth. Include `Authorization: Bearer <token>` header.

## Architecture

```
┌─────────────┐     ┌─────────────┐
│   React 19  │────▶│  Nginx 1.25 │
│  (Vite Dev) │     │  :8000      │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PHP 8.3    │
                    │  FPM        │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──┐  ┌──────▼──────┐
       │  MySQL 8.0  │ │Redis│  │   Horizon   │
       │  :3306      │ │:6379│  │  (Queue)    │
       └─────────────┘ └─────┘  └─────────────┘
```

## Folder Structure

```
coders-hero/
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   ├── Services/
│   │   └── Traits/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── public/
├── frontend/                 # React 19 SPA
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── public/
├── docker/
│   ├── nginx/default.conf
│   ├── mysql/my.cnf
│   └── redis/redis.conf
├── docker-compose.yml
├── Dockerfile
├── Makefile
└── README.md
```

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all containers |
| `make down` | Stop all containers |
| `make build` | Build all Docker images |
| `make rebuild` | Rebuild and start containers |
| `make install` | Install all dependencies |
| `make install-backend` | Install backend (Composer) |
| `make install-frontend` | Install frontend (npm) |
| `make migrate` | Run migrations |
| `make seed` | Run database seeders |
| `make fresh` | Migrate fresh + seed |
| `make test` | Run test suite |
| `make logs` | Tail all container logs |
| `make shell-app` | Bash into app container |
| `make shell-frontend` | Shell into node container |
| `make shell-mysql` | MySQL CLI |
| `make shell-redis` | Redis CLI |
| `make cache-clear` | Clear all caches |
| `make queue-worker` | Start queue worker |
| `make queue-restart` | Restart queue workers |
| `make create-admin` | Create admin user |
| `make tinker` | Laravel REPL |
| `make status` | Container status |
| `make clean` | Remove all containers/volumes |

## Development Workflow

1. Start services: `make up`
2. Make changes to `backend/` or `frontend/`
3. Backend changes are hot-reloaded via FPM
4. Frontend changes are hot-reloaded via Vite HMR
5. Run migrations after model changes: `make migrate`
6. Clear caches after config changes: `make cache-clear`

## Testing

```bash
# Run all tests
make test

# Run specific test file
docker-compose exec app php artisan test --filter=CourseTest

# Run with verbose output
docker-compose exec app php artisan test --verbose
```

## Deployment

### Production Build

```bash
# Set environment
export APP_ENV=production
export APP_DEBUG=false

# Build and deploy
make build
make up

# Optimize
make cache-config
make cache-route
docker-compose exec app php artisan optimize
```

### Docker Production Checklist

1. Set `APP_DEBUG=false` in `.env`
2. Generate strong `APP_KEY`
3. Set secure `DB_PASSWORD`
4. Configure SSL/TLS (add Certbot or use a reverse proxy)
5. Set up automated backups for MySQL
6. Configure log rotation
7. Set `APP_URL` to production domain
8. Update `SANCTUM_STATEFUL_DOMAINS`

## License

Proprietary - Coder's Hero
