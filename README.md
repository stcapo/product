# 电商行为BI分析平台 (ecom-behavior-bi-dual)

一个生产级别的电商数据可视化分析平台，集成完整的大数据后端 (Kafka + Spark + MySQL + Redis)。

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Docker & Docker Compose
- npm 或 yarn

### 一键启动

```bash
# 使用快速启动脚本（推荐）
./scripts/quick-start.sh

# 或者分步启动：
npm install                              # 安装前端依赖
cd backend && docker compose up -d       # 启动后端服务
cd .. && npm run dev                     # 启动前端开发服务器
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端仪表板 | http://localhost:5173 |
| API 文档 | http://localhost:8000/docs |
| API 健康检查 | http://localhost:8000/api/health |

---

## 🐳 后端服务管理

### 启动后端服务

```bash
cd backend
docker compose up -d
```

### 查看服务状态

```bash
cd backend
docker compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs producer --tail 20
docker compose logs spark-consumer --tail 20
docker compose logs api --tail 20
```

### 停止后端服务

```bash
cd backend
docker compose down
```

### 完全清理（包括数据）

```bash
cd backend
docker compose down -v  # 删除所有容器和数据卷
```

---

## 📊 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kafka         │    │   Spark         │    │   FastAPI       │
│   Producer      │───▶│   Consumer      │───▶│   API           │
│   (模拟数据)     │    │   (ML处理)       │    │   (REST接口)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │  │                     │
                              ▼  ▼                     │
                       ┌──────────────┐               │
                       │MySQL  │Redis │               │
                       │(持久化)│(缓存) │               │
                       └──────────────┘               │
                                                      ▼
                                            ┌─────────────────┐
                                            │   React         │
                                            │   Frontend      │
                                            └─────────────────┘
```

### 后端服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| Zookeeper | 2181 | Kafka 协调服务 |
| Kafka | 9093, 29092 | 消息队列 |
| MySQL | 3306 | 数据持久化 |
| Redis | 6379 | 实时指标缓存 |
| FastAPI | 8000 | RESTful API |
| Producer | - | 交易数据模拟器 (5条/秒) |
| Consumer | - | Spark ML + 数据处理 |

---

## 📋 核心功能

### 数据管道
- ✅ Kafka 实时数据流
- ✅ Spark 流处理 + ML 模型
- ✅ RFM 客户分群
- ✅ 流失预测模型
- ✅ MySQL 批量分析
- ✅ Redis 实时缓存

### 前端可视化
- ✅ 深色分析版主题
- ✅ 实时 KPI 仪表板
- ✅ 6 个核心图表
- ✅ 全局筛选系统
- ✅ 响应式设计

### 页面结构
1. **总览大盘** - KPI概览 + 核心图表
2. **用户画像** - 性别、年龄、支付方式分析
3. **品类洞察** - 趋势、增长、客单价分析
4. **复购分析** - 队列留存和复购追踪

---

## 🔧 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/transactions` | GET | 交易数据（支持筛选） |
| `/api/metrics/summary` | GET | KPI 汇总 |
| `/api/metrics/trends` | GET | 趋势数据 |
| `/api/analytics/categories` | GET | 品类分析 |
| `/api/analytics/segments` | GET | 用户分群 |
| `/api/realtime/latest` | GET | 实时指标 |

---

## 📁 项目结构

```
├── backend/                    # 后端服务
│   ├── docker-compose.yml      # Docker 编排
│   ├── init/mysql/            # MySQL 初始化脚本
│   ├── kafka/producer/        # Kafka 生产者
│   ├── spark/consumer/        # Spark 消费者 + ML
│   └── api/                   # FastAPI 服务
├── scripts/                   # 启动脚本
│   └── quick-start.sh         # 一键启动脚本
├── src/                       # 前端源码
│   ├── components/            # React 组件
│   ├── pages/                 # 页面
│   ├── services/api.ts        # API 集成层
│   └── ...
└── ...
```

---

## 📦 Docker 打包与迁移

### 导出 Docker 镜像

```bash
cd backend

# 保存所有自定义镜像到 tar 文件
docker save backend-producer backend-spark-consumer backend-api \
  -o ecommerce-images.tar

# 压缩（可选，减小文件大小）
gzip ecommerce-images.tar
```

### 导出数据卷（可选）

```bash
# 导出 MySQL 数据
docker run --rm -v backend_mysql_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mysql-data.tar.gz -C /data .

# 导出 Redis 数据
docker run --rm -v backend_redis_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/redis-data.tar.gz -C /data .
```

### 在新机器上导入

```bash
# 1. 复制项目文件到新机器
scp -r backend/ user@newhost:/path/to/project/

# 2. 复制镜像文件
scp ecommerce-images.tar.gz user@newhost:/path/to/project/backend/

# 3. 在新机器上导入镜像
cd /path/to/project/backend
gunzip ecommerce-images.tar.gz
docker load -i ecommerce-images.tar

# 4. 导入数据卷（如果有）
docker volume create backend_mysql_data
docker run --rm -v backend_mysql_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/mysql-data.tar.gz -C /data

# 5. 启动服务
docker compose up -d
```

### 完整打包脚本

```bash
# 创建完整打包
cd backend
mkdir -p dist
docker compose down
docker save backend-producer backend-spark-consumer backend-api -o dist/images.tar
cp -r ../scripts dist/
cp docker-compose.yml dist/
cp -r init dist/
tar czf ecommerce-bi-backend.tar.gz dist/
rm -rf dist/

# 打包文件: ecommerce-bi-backend.tar.gz (~500MB)
```

---

## 🌐 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 📝 许可证

MIT

## 🤝 支持

如有问题或建议，请提交 Issue 或 Pull Request。
