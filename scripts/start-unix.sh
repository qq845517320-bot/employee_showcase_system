#!/bin/bash

# ========================================
# 员工风采展示系统 - Linux/macOS 快速启动脚本
# ========================================
# 用途: 一键启动应用（开发模式）
# 使用: chmod +x start-unix.sh && ./start-unix.sh

set -e

cd "$(dirname "$0")/.."

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   员工风采展示系统 - 快速启动脚本 (Linux/macOS)          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js 是否已安装
echo "[1/4] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先从 https://nodejs.org 下载并安装 Node.js LTS 版本"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js 版本: $NODE_VERSION"

# 检查 pnpm 是否已安装
echo ""
echo "[2/4] 检查 pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm 未安装，正在安装..."
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm --version)
echo "✅ pnpm 版本: $PNPM_VERSION"

# 检查 MySQL 是否正在运行
echo ""
echo "[3/4] 检查 MySQL 数据库..."
if mysql -h localhost -u root -p"${MYSQL_PASSWORD}" -e "SELECT 1" &> /dev/null; then
    echo "✅ MySQL 连接成功"
else
    echo "⚠️  警告: 无法连接到 MySQL"
    echo "请确保:"
    echo "  1. MySQL 服务正在运行 (sudo systemctl start mysql)"
    echo "  2. 设置了 MYSQL_PASSWORD 环境变量"
    echo "  3. 数据库用户和密码正确"
    echo ""
    read -p "继续启动应用? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查依赖是否已安装
echo ""
echo "[4/4] 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖 (首次运行，可能需要几分钟)..."
    pnpm install
else
    echo "✅ 依赖已安装"
fi

# 启动应用
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 启动应用..."
echo "════════════════════════════════════════════════════════════"
echo ""
echo "应用将在以下地址运行:"
echo "  • 首页: http://localhost:3000"
echo "  • 大屏展示: http://localhost:3000/showcase"
echo "  • 管理系统: http://localhost:3000/admin"
echo ""
echo "按 Ctrl+C 停止应用"
echo ""

pnpm dev
