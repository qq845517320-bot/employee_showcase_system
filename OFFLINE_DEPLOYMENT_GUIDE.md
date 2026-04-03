# 员工风采大屏展示系统 - 本地离线部署完整教程（2026-04-03 最新版）

## 📋 快速导航

- [版本同步状态](#版本同步状态)
- [系统要求](#系统要求)
- [第一步：软件安装](#第一步软件安装)
- [第二步：项目克隆](#第二步项目克隆)
- [第三步：环境配置](#第三步环境配置)
- [第四步：数据库设置](#第四步数据库设置)
- [第五步：代码修改](#第五步代码修改)
- [第六步：本地运行](#第六步本地运行)
- [第七步：生产部署](#第七步生产部署)
- [常见问题排查](#常见问题排查)

---

## ✅ 版本同步状态

### 当前最新版本信息

**最新提交**: `86d22ab` (2026-04-03)

**最新修改内容**:
- ✅ 隐藏首页的"快速开始"部分
- ✅ 将首页图标文字从"ES"改为"深"
- ✅ 在员工管理列表中添加序号列功能
- ✅ 所有修改已同步至 GitHub (`user_github/main` 和 `origin/main`)

**GitHub 同步状态**: ✅ **已完全同步**

```
On branch main
nothing to commit, working tree clean
HEAD -> main, user_github/main, origin/main
```

您可以放心地从 GitHub 克隆最新版本，所有修改都已保存。

---

## 🖥️ 系统要求

### 操作系统
- **Windows 10/11** (推荐用于大屏展示)
- **macOS 10.15+**
- **Linux (Ubuntu 20.04+)**

### 硬件要求
- **CPU**: Intel i5 或同等级以上
- **内存**: 8GB RAM 最低，16GB 推荐（用于大屏展示）
- **存储**: 至少 30GB 可用空间（包括数据库）
- **网络**: 初始安装需要网络连接下载依赖包

### 网络要求
- 初始安装时需要网络下载 npm 包
- 运行时可以完全离线（除非使用在线 API）

---

## 第一步：软件安装

### 1.1 安装 Node.js (必需)

**Windows 用户:**
1. 访问 [https://nodejs.org](https://nodejs.org)
2. 下载 LTS 版本（推荐 v20.x 或更新）
3. 运行安装程序，**务必勾选 "Add to PATH"**
4. 完成后，打开 PowerShell 或 CMD 验证：
   ```bash
   node --version
   npm --version
   ```

**macOS 用户:**
```bash
# 使用 Homebrew
brew install node

# 验证
node --version
npm --version
```

**Linux 用户 (Ubuntu/Debian):**
```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证
node --version
npm --version
```

### 1.2 安装 Git (必需)

**Windows 用户:**
1. 访问 [https://git-scm.com](https://git-scm.com)
2. 下载 Git for Windows
3. 运行安装程序，使用默认设置
4. 验证：
   ```bash
   git --version
   ```

**macOS 用户:**
```bash
brew install git
git --version
```

**Linux 用户:**
```bash
sudo apt-get install git
git --version
```

### 1.3 安装 MySQL 数据库 (必需)

**Windows 用户:**
1. 下载 MySQL Community Server: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. 选择 Windows 版本，下载 MSI 安装程序
3. 运行安装程序：
   - 选择 "Developer Default" 或 "Server only"
   - 配置 MySQL Server 作为 Windows 服务
   - 设置 root 用户密码（**请记住此密码！**）
   - 设置默认字符集为 utf8mb4
4. 验证安装：
   ```bash
   mysql --version
   mysql -u root -p
   # 输入密码后，如果进入 MySQL 提示符说明安装成功
   EXIT;
   ```

**macOS 用户:**
```bash
# 安装 MySQL
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 初始化安全设置
mysql_secure_installation

# 验证
mysql --version
mysql -u root -p
```

**Linux 用户 (Ubuntu):**
```bash
# 安装 MySQL
sudo apt-get install mysql-server

# 初始化安全设置
sudo mysql_secure_installation

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 验证
mysql --version
mysql -u root -p
```

### 1.4 安装 pnpm 包管理器 (推荐)

```bash
# 使用 npm 全局安装 pnpm
npm install -g pnpm

# 验证
pnpm --version

# 如果需要，可以更新 pnpm
pnpm add -g pnpm@latest
```

### 1.5 安装 Visual Studio Code (推荐)

1. 访问 [https://code.visualstudio.com](https://code.visualstudio.com)
2. 下载并安装
3. 安装推荐扩展：
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Prettier - Code formatter
   - SQLTools
   - Thunder Client (用于测试 API)

---

## 第二步：项目克隆

### 2.1 从 GitHub 克隆项目

```bash
# 创建工作目录
mkdir ~/projects
cd ~/projects

# 克隆项目（使用最新版本）
git clone https://github.com/your-username/employee_showcase_system.git
cd employee_showcase_system

# 查看当前分支和提交
git status
git log --oneline -3
```

### 2.2 验证项目结构

```bash
# 查看项目目录结构
ls -la

# 应该看到以下目录：
# client/          - 前端代码
# server/          - 后端代码
# drizzle/         - 数据库迁移文件
# public/          - 静态资源
# .env.example     - 环境变量示例
```

### 2.3 安装依赖

```bash
# 使用 pnpm 安装依赖（推荐，速度快）
pnpm install

# 或使用 npm
npm install

# 如果遇到问题，清除缓存后重试
pnpm store prune
pnpm install
```

---

## 第三步：环境配置

### 3.1 创建 .env 文件

在项目根目录创建 `.env` 文件（复制 `.env.example` 并修改）：

```bash
# 创建 .env 文件
cp .env.example .env

# 或手动创建
cat > .env << 'EOF'
# ============ 数据库配置 ============
DATABASE_URL="mysql://root:your_password@localhost:3306/employee_showcase"

# ============ JWT 密钥 ============
# 用于会话加密，必须至少 32 个字符
JWT_SECRET="your-secret-key-min-32-characters-long-for-security-12345"

# ============ OAuth 配置（本地开发可禁用） ============
VITE_APP_ID="local-dev-app-id"
OAUTH_SERVER_URL="http://localhost:3000"
VITE_OAUTH_PORTAL_URL="http://localhost:3000/login"

# ============ 应用配置 ============
VITE_APP_TITLE="员工风采大屏展示系统"
VITE_APP_LOGO="https://your-logo-url.png"

# ============ 所有者信息 ============
OWNER_NAME="系统管理员"
OWNER_OPEN_ID="admin-001"

# ============ API 端点（本地开发） ============
VITE_FRONTEND_FORGE_API_URL="http://localhost:3000/api"
VITE_FRONTEND_FORGE_API_KEY="local-dev-key"
BUILT_IN_FORGE_API_URL="http://localhost:3000/api"
BUILT_IN_FORGE_API_KEY="local-dev-key"

# ============ 分析配置（可选） ============
VITE_ANALYTICS_ENDPOINT="http://localhost:3000/analytics"
VITE_ANALYTICS_WEBSITE_ID="local-dev"

# ============ 开发环境 ============
NODE_ENV="development"
PORT=3000
EOF
```

### 3.2 修改 .env 文件中的关键参数

**数据库密码**: 将 `your_password` 替换为您在安装 MySQL 时设置的 root 密码

```bash
# 示例
DATABASE_URL="mysql://root:MySecurePassword123@localhost:3306/employee_showcase"
```

**JWT_SECRET**: 生成一个强密钥

```bash
# 在 Linux/macOS 上生成
openssl rand -base64 32

# 在 Windows PowerShell 上生成
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))

# 或使用在线工具生成
# https://www.uuidgenerator.net/
```

### 3.3 验证环境变量

```bash
# 查看 .env 文件内容
cat .env

# 确保没有空格在等号周围
# ✅ 正确: DATABASE_URL="mysql://..."
# ❌ 错误: DATABASE_URL = "mysql://..."
```

---

## 第四步：数据库设置

### 4.1 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 输入密码后，执行以下 SQL 命令
CREATE DATABASE employee_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE employee_showcase_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 验证创建成功
SHOW DATABASES;

# 应该看到两个新数据库
# | employee_showcase     |
# | employee_showcase_dev |

# 退出 MySQL
EXIT;
```

### 4.2 运行数据库迁移

```bash
# 进入项目目录
cd ~/projects/employee_showcase_system

# 生成迁移文件（如果有新的 schema 变更）
pnpm drizzle-kit generate

# 应用迁移到数据库
pnpm drizzle-kit migrate

# 验证迁移成功
mysql -u root -p employee_showcase -e "SHOW TABLES;"
```

### 4.3 初始化示例数据（可选）

创建 `scripts/seed-db.mjs` 文件来初始化示例数据：

```bash
mkdir -p scripts
cat > scripts/seed-db.mjs << 'EOF'
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',  // 替换为您的 MySQL 密码
  database: 'employee_showcase'
});

try {
  // 插入示例部门
  await connection.execute(`
    INSERT INTO departments (name, description, createdAt, updatedAt) VALUES
    ('管理层', '公司管理部门', NOW(), NOW()),
    ('商务部', '商务合作部门', NOW(), NOW()),
    ('工程部', '技术工程部门', NOW(), NOW()),
    ('安环部', '安全环保部门', NOW(), NOW()),
    ('调度运行部', '调度运行部门', NOW(), NOW()),
    ('综合部', '综合管理部门', NOW(), NOW()),
    ('财务部', '财务管理部门', NOW(), NOW())
  `);

  console.log('✅ 部门数据初始化完成！');

  // 插入示例员工
  await connection.execute(`
    INSERT INTO employees (
      name, position, level, departmentId, joinDate, 
      workPhoto, workResponsibilities, workCredo, sortOrder,
      createdAt, updatedAt
    ) VALUES
    ('张三', '总经理', '总经理', 1, '2022-01-15', 
     'https://example.com/photo1.jpg', '负责公司整体运营管理', '诚信、创新、卓越', 1,
     NOW(), NOW()),
    ('李四', '工程师', '高级工程师', 3, '2023-06-20', 
     'https://example.com/photo2.jpg', '负责系统开发与维护', '精益求精、持续改进', 2,
     NOW(), NOW())
  `);

  console.log('✅ 员工数据初始化完成！');

} catch (error) {
  console.error('❌ 数据初始化失败:', error);
} finally {
  await connection.end();
}
EOF

# 运行脚本
node scripts/seed-db.mjs
```

---

## 第五步：代码修改

### 5.1 禁用 OAuth 认证（离线模式）

编辑 `server/_core/oauth.ts`，修改为本地认证模式：

```typescript
// 文件: server/_core/oauth.ts

// 如果需要禁用 OAuth，可以添加以下环境变量检查
export const isOAuthEnabled = process.env.DISABLE_OAUTH !== 'true';

// 或者修改 OAuth 初始化代码
if (process.env.NODE_ENV === 'development') {
  // 开发环境禁用 OAuth
  console.log('[OAuth] Disabled in development mode');
} else {
  // 生产环境启用 OAuth
  console.log('[OAuth] Initialized');
}
```

在 `.env` 中添加：
```bash
DISABLE_OAUTH="true"
```

### 5.2 修改 API 端点（本地开发）

编辑 `client/src/lib/trpc.ts`：

```typescript
// 文件: client/src/lib/trpc.ts

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/routers';

// 确定 API 基础 URL
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    // 服务器端
    return `http://localhost:${process.env.PORT || 3000}`;
  }
  // 客户端
  return window.location.origin;
};

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // 在开发环境中启用凭证
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
```

### 5.3 修改图片上传配置（使用本地存储）

编辑 `server/storage.ts`，实现本地文件存储而不是 S3：

```typescript
// 文件: server/storage.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../public/uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
) {
  try {
    // 生成文件路径
    const filePath = path.join(uploadDir, relKey);
    const dirPath = path.dirname(filePath);

    // 确保目录存在
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 转换数据为 Buffer
    const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);

    // 写入文件
    fs.writeFileSync(filePath, buffer);

    // 返回文件 URL
    return {
      key: relKey,
      url: `/uploads/${relKey}`,
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Failed to upload file: ${relKey}`);
  }
}

export async function storageGet(
  relKey: string,
  expiresIn?: number
) {
  // 本地存储不需要签名 URL，直接返回文件路径
  return {
    key: relKey,
    url: `/uploads/${relKey}`,
  };
}
```

### 5.4 配置静态文件服务

编辑 `server/_core/index.ts`，添加静态文件中间件：

```typescript
// 文件: server/_core/index.ts

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 服务静态文件
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
app.use('/public', express.static(path.join(__dirname, '../../public')));

// ... 其他配置
```

---

## 第六步：本地运行

### 6.1 启动开发服务器

```bash
# 进入项目目录
cd ~/projects/employee_showcase_system

# 启动开发服务器（包含热重载）
pnpm dev

# 或使用 npm
npm run dev

# 输出应该显示：
# ✓ Server running on http://localhost:3000
# ✓ Frontend running on http://localhost:5173
```

### 6.2 访问应用

打开浏览器访问：
- **首页**: http://localhost:3000
- **大屏展示**: http://localhost:3000/showcase
- **管理系统**: http://localhost:3000/admin

### 6.3 创建管理员账户

由于禁用了 OAuth，您需要直接在数据库中创建管理员用户：

```bash
# 登录 MySQL
mysql -u root -p employee_showcase

# 插入管理员用户
INSERT INTO users (
  id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn
) VALUES (
  'admin-001', 'admin-local-001', '系统管理员', 'admin@localhost', 'local', 'admin', NOW(), NOW(), NOW()
);

# 验证
SELECT * FROM users;

# 退出
EXIT;
```

### 6.4 停止开发服务器

```bash
# 按 Ctrl+C 停止服务器
```

---

## 第七步：生产部署

### 7.1 构建生产版本

```bash
# 构建前端和后端
pnpm build

# 或使用 npm
npm run build

# 输出应该显示：
# ✓ client build complete
# ✓ server build complete
```

### 7.2 运行生产版本

```bash
# 启动生产服务器
pnpm start

# 或使用 Node.js 直接运行
node dist/server/index.js

# 服务器将在 http://localhost:3000 启动
```

### 7.3 使用 PM2 进程管理（推荐）

```bash
# 全局安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
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
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 查看应用状态
pm2 status

# 查看日志
pm2 logs employee-showcase

# 停止应用
pm2 stop employee-showcase

# 重启应用
pm2 restart employee-showcase

# 删除应用
pm2 delete employee-showcase
```

### 7.4 使用 Docker 部署（可选）

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
```

构建和运行：

```bash
# 构建 Docker 镜像
docker build -t employee-showcase:latest .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://root:password@host.docker.internal:3306/employee_showcase" \
  -e JWT_SECRET="your-secret-key" \
  -e NODE_ENV="production" \
  --name employee-showcase \
  employee-showcase:latest

# 查看日志
docker logs -f employee-showcase

# 停止容器
docker stop employee-showcase

# 删除容器
docker rm employee-showcase
```

---

## 常见问题排查

### ❌ 问题 1: 数据库连接失败

**错误信息**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**:
```bash
# 1. 检查 MySQL 是否运行
mysql --version

# 2. 启动 MySQL 服务
# Windows: 
net start MySQL80

# macOS:
brew services start mysql

# 3. Linux:
sudo systemctl start mysql

# 4. 测试连接
mysql -u root -p

# 5. 检查 .env 文件中的 DATABASE_URL
cat .env | grep DATABASE_URL
```

### ❌ 问题 2: 端口被占用

**错误信息**:
```
Error: listen EADDRINUSE :::3000
```

**解决方案**:
```bash
# Windows: 查找并杀死占用 3000 端口的进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# 或修改 .env 中的 PORT
echo "PORT=3001" >> .env
```

### ❌ 问题 3: 依赖安装失败

**错误信息**:
```
npm ERR! code ERESOLVE
```

**解决方案**:
```bash
# 1. 清除 npm 缓存
npm cache clean --force

# 2. 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 3. 重新安装
pnpm install

# 4. 如果仍然失败，使用 npm 代替
npm install
```

### ❌ 问题 4: 环境变量未被读取

**错误信息**:
```
undefined 或连接错误
```

**解决方案**:
```bash
# 1. 确保 .env 文件在项目根目录
ls -la .env

# 2. 检查 .env 文件格式（不要有空格）
cat .env

# 3. 确保没有注释行导致问题
# ✅ 正确
DATABASE_URL="mysql://..."

# ❌ 错误
# DATABASE_URL="mysql://..."
DATABASE_URL = "mysql://..."

# 4. 重启开发服务器
# 按 Ctrl+C 停止
# 然后重新运行 pnpm dev
```

### ❌ 问题 5: 数据库迁移失败

**错误信息**:
```
Error: Unknown database
```

**解决方案**:
```bash
# 1. 手动创建数据库
mysql -u root -p -e "CREATE DATABASE employee_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 重新运行迁移
pnpm drizzle-kit migrate

# 3. 验证表是否创建成功
mysql -u root -p employee_showcase -e "SHOW TABLES;"
```

### ❌ 问题 6: OAuth 登录失败

**错误信息**:
```
OAuth callback failed
```

**解决方案**:
```bash
# 1. 在 .env 中禁用 OAuth
echo 'DISABLE_OAUTH="true"' >> .env

# 2. 重启开发服务器
pnpm dev

# 3. 直接在数据库中创建用户
mysql -u root -p employee_showcase << EOF
INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
VALUES ('admin-001', 'admin-local', '管理员', 'admin@local', 'local', 'admin', NOW(), NOW(), NOW());
EOF
```

### ❌ 问题 7: 前端无法连接后端 API

**错误信息**:
```
Failed to fetch from /api/trpc
CORS error
```

**解决方案**:
```bash
# 1. 确保后端服务器正在运行
pnpm dev

# 2. 检查 CORS 配置
# 编辑 server/_core/index.ts，确保启用了 CORS

# 3. 检查 API 端点是否正确
# 打开浏览器开发者工具 (F12)
# 查看 Network 标签中的请求 URL

# 4. 如果使用代理，检查代理配置
# 编辑 vite.config.ts
```

---

## 🔐 安全建议

### 1. 不要提交 .env 文件到 Git

```bash
# 确保 .env 在 .gitignore 中
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# 提交 .env.example 作为参考
git add .env.example
git commit -m "docs: add .env.example"
```

### 2. 使用强密码

- **MySQL root 密码**: 至少 12 个字符，包含大小写字母、数字和特殊字符
- **JWT_SECRET**: 至少 32 个字符，使用 `openssl rand -base64 32` 生成

### 3. 定期更新依赖

```bash
# 检查过期的依赖
pnpm outdated

# 更新所有依赖
pnpm update

# 更新特定包
pnpm update package-name@latest
```

### 4. 启用 HTTPS（生产环境）

```bash
# 使用 Let's Encrypt 获取免费证书
# 或使用反向代理（Nginx）配置 HTTPS
```

### 5. 备份数据库

```bash
# 备份数据库
mysqldump -u root -p employee_showcase > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
mysql -u root -p employee_showcase < backup_20260403_120000.sql
```

---

## 📚 相关资源

- [Node.js 官方文档](https://nodejs.org/docs/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [tRPC 文档](https://trpc.io/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Express.js 文档](https://expressjs.com/)

---

## 💡 性能优化建议

### 1. 启用数据库连接池

```typescript
// 文件: server/_core/db.ts
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'employee_showcase',
  waitForConnections: true,
  queueLimit: 0
});
```

### 2. 添加缓存层

```bash
# 安装 Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Linux

# 在代码中使用 Redis
pnpm add redis
```

### 3. 启用 Gzip 压缩

```typescript
// 文件: server/_core/index.ts
import compression from 'compression';
app.use(compression());
```

### 4. 使用 CDN 加速静态资源

```typescript
// 在 .env 中配置 CDN URL
VITE_CDN_URL="https://cdn.example.com"
```

---

## 📝 开发工作流

### 1. 创建新功能分支

```bash
git checkout -b feature/new-feature
```

### 2. 开发并测试

```bash
pnpm dev
# 在浏览器中测试 http://localhost:3000
```

### 3. 提交更改

```bash
git add .
git commit -m "feat: 添加新功能描述"
```

### 4. 推送到 GitHub

```bash
git push origin feature/new-feature
```

### 5. 创建 Pull Request

在 GitHub 上创建 PR，等待审核和合并。

---

## 🎯 快速启动清单

- [ ] 安装 Node.js v20+
- [ ] 安装 Git
- [ ] 安装 MySQL 8.0+
- [ ] 安装 pnpm
- [ ] 克隆项目：`git clone https://github.com/your-username/employee_showcase_system.git`
- [ ] 安装依赖：`pnpm install`
- [ ] 创建 `.env` 文件并配置数据库
- [ ] 创建 MySQL 数据库：`CREATE DATABASE employee_showcase`
- [ ] 运行迁移：`pnpm drizzle-kit migrate`
- [ ] 启动开发服务器：`pnpm dev`
- [ ] 访问 http://localhost:3000

---

## 📞 获取帮助

如果遇到问题，请：

1. 检查本文档中的"常见问题排查"部分
2. 查看项目的 GitHub Issues
3. 查看开发服务器的日志输出
4. 使用浏览器开发者工具 (F12) 检查错误

---

**最后更新**: 2026-04-03
**版本**: 2.0.0 (最新版本同步)
**维护者**: 员工风采展示系统开发团队

