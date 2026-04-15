#!/bin/bash

# ========================================
# 员工风采展示系统 - 生产环境启动脚本
# ========================================
# 用途: 使用 PM2 进程管理启动应用（生产模式）
# 使用: chmod +x start-production.sh && ./start-production.sh

set -e

cd "$(dirname "$0")/.."

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   员工风采展示系统 - 生产环境启动脚本                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js 是否已安装
echo "[1/5] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi
echo "✅ Node.js 版本: $(node --version)"

# 检查 PM2 是否已安装
echo ""
echo "[2/5] 检查 PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 正在安装 PM2..."
    npm install -g pm2
fi
echo "✅ PM2 版本: $(pm2 --version)"

# 检查 MySQL 是否正在运行
echo ""
echo "[3/5] 检查 MySQL 数据库..."
if ! mysql -h localhost -u root -p"${MYSQL_PASSWORD}" -e "SELECT 1" &> /dev/null; then
    echo "❌ 错误: 无法连接到 MySQL"
    echo "请先启动 MySQL 服务"
    exit 1
fi
echo "✅ MySQL 连接成功"

# 构建应用
echo ""
echo "[4/5] 构建应用..."
if [ ! -d "dist" ]; then
    echo "📦 正在构建应用..."
    pnpm build
else
    echo "✅ 应用已构建"
fi

# 启动应用
echo ""
echo "[5/5] 启动应用..."
echo "════════════════════════════════════════════════════════════"

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'employee-showcase',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'dist', 'logs', '.git'],
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# 停止旧进程（如果存在）
pm2 delete employee-showcase 2>/dev/null || true

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

echo ""
echo "✅ 应用已启动"
echo ""
echo "应用信息:"
echo "  • 进程名: employee-showcase"
echo "  • 访问地址: http://localhost:3000"
echo "  • 日志文件: ./logs/"
echo ""
echo "常用命令:"
echo "  • 查看状态: pm2 status"
echo "  • 查看日志: pm2 logs employee-showcase"
echo "  • 重启应用: pm2 restart employee-showcase"
echo "  • 停止应用: pm2 stop employee-showcase"
echo "  • 删除应用: pm2 delete employee-showcase"
echo ""

pm2 status
