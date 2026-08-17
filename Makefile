.PHONY: up down build install-backend install-frontend migrate seed test logs shell-app shell-frontend fresh cache-clear queue-worker create-admin restart stop clean

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build --no-cache

rebuild:
	docker-compose up -d --build

install-backend:
	docker-compose exec app composer install

install-frontend:
	docker-compose exec node npm install

install: install-backend install-frontend

migrate:
	docker-compose exec app php artisan migrate

migrate-fresh:
	docker-compose exec app php artisan migrate:fresh

seed:
	docker-compose exec app php artisan db:seed

test:
	docker-compose exec app php artisan test

logs:
	docker-compose logs -f

logs-app:
	docker-compose logs -f app

logs-nginx:
	docker-compose logs -f nginx

logs-mysql:
	docker-compose logs -f mysql

logs-redis:
	docker-compose logs -f redis

logs-node:
	docker-compose logs -f node

logs-queue:
	docker-compose logs -f queue

logs-scheduler:
	docker-compose logs -f scheduler

shell-app:
	docker-compose exec app bash

shell-frontend:
	docker-compose exec node sh

shell-mysql:
	docker-compose exec mysql mysql -u root -p

shell-redis:
	docker-compose exec redis redis-cli

fresh:
	docker-compose exec app php artisan migrate:fresh --seed

cache-clear:
	docker-compose exec app php artisan optimize:clear

cache-config:
	docker-compose exec app php artisan config:cache

cache-route:
	docker-compose exec app php artisan route:cache

queue-worker:
	docker-compose exec queue php artisan queue:work redis --sleep=3 --tries=3

queue-restart:
	docker-compose exec queue php artisan queue:restart

create-admin:
	docker-compose exec app php artisan app:create-admin

tinker:
	docker-compose exec app php artisan tinker

horizon:
	docker-compose exec queue php artisan horizon

status:
	docker-compose ps

restart:
	docker-compose restart

stop:
	docker-compose stop

clean:
	docker-compose down -v --rmi all

optimize:
	docker-compose exec app php artisan optimize

key-generate:
	docker-compose exec app php artisan key:generate

storage-link:
	docker-compose exec app php artisan storage:link

version:
	docker-compose version
