#!/bin/bash

# 停止所有后端服务
# Stop all backend services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🛑 停止后端服务..."
cd "$PROJECT_ROOT/backend"
docker compose down

echo "✅ 后端服务已停止"
