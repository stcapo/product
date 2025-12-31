#!/bin/bash

# 电商BI分析平台 - 快速启动脚本
# Quick start script for E-commerce BI Analytics Platform

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "======================================"
echo "  电商BI分析平台 - 快速启动"
echo "======================================"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ 错误: Docker 服务未运行"
    exit 1
fi

echo "✅ Docker 已就绪"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    exit 1
fi

echo "✅ Node.js 已就绪 ($(node --version))"

# 安装前端依赖
echo ""
echo "📦 安装前端依赖..."
cd "$PROJECT_ROOT"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   依赖已存在，跳过安装"
fi

# 启动后端服务
echo ""
echo "🐳 启动后端 Docker 服务..."
cd "$PROJECT_ROOT/backend"
docker compose up -d

# 等待服务就绪
echo ""
echo "⏳ 等待服务就绪..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态:"
docker compose ps

# 检查 API 健康
echo ""
echo "🔍 检查 API 健康..."
for i in {1..10}; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "✅ API 服务已就绪"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️  API 服务未响应，请检查日志: docker compose logs api"
    fi
    sleep 2
done

# 启动前端
echo ""
echo "🌐 启动前端开发服务器..."
cd "$PROJECT_ROOT"
echo ""
echo "======================================"
echo "  🎉 启动完成！"
echo "======================================"
echo ""
echo "  前端地址: http://localhost:5173"
echo "  API 文档: http://localhost:8000/docs"
echo ""
echo "  停止后端: cd backend && docker compose down"
echo "  查看日志: cd backend && docker compose logs -f"
echo ""
echo "======================================"
echo ""

npm run dev
