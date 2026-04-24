#!/bin/bash
set -e

echo "Warte auf Datenbank..."
while ! nc -z database 5432; do
  sleep 1
done

echo "Datenbank ist ready. Führe Migrations aus..."
npx prisma migrate deploy

echo "Starte Server..."
node server.js
