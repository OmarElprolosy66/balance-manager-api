#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready on host db, port 5432..."
until pg_isready -h db -p 5432 -U postgres; do
  echo "Database is not ready yet. Retrying..."
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Running database migrations..."
npx drizzle-kit migrate

echo "Seeding default currencies..."
npm run db:seedCurrencies

echo "Starting backend server..."
npm run start:prod
