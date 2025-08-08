#!/bin/bash

# PM2 自动构建启动脚本
# 用法: ./scripts/start-pm2.sh [development|production]

set -e  # 遇到错误就退出

ENVIRONMENT=${1:-production}

echo "🚀 开始自动构建和部署流程..."
echo "📋 环境: $ENVIRONMENT"

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull

# 2. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 3. 构建项目
echo "🔨 构建项目..."
pnpm build

# 4. 检查dist目录是否存在
if [ ! -f "dist/src/main.js" ]; then
    echo "❌ 构建失败: dist/src/main.js 不存在"
    exit 1
fi

# 5. 创建必要的目录
mkdir -p logs pids

# 6. 停止已运行的PM2进程（如果存在）
echo "🛑 停止已存在的PM2进程..."
pm2 delete admin-nestjs 2>/dev/null || echo "没有找到已运行的进程"

# 7. 启动PM2
echo "🎯 启动PM2进程..."
if [ "$ENVIRONMENT" = "development" ]; then
    pm2 restart ecosystem.config.js --env development
else
    pm2 restart ecosystem.config.js --env production
fi

# 8. 显示PM2状态
echo "📊 PM2状态:"
pm2 list

echo "✅ 启动完成！"
echo "📝 查看日志: pm2 logs admin-nestjs"
echo "📊 查看状态: pm2 status"
echo "🔄 重启应用: pm2 restart admin-nestjs" 