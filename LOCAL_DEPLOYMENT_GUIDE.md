# 员工风采大屏展示系统 - 本地化离线部署完整教程

## 📋 目录
1. [系统要求](#系统要求)
2. [必需软件安装](#必需软件安装)
3. [项目克隆与配置](#项目克隆与配置)
4. [环境变量配置](#环境变量配置)
5. [数据库设置](#数据库设置)
6. [代码修改指南](#代码修改指南)
7. [本地运行](#本地运行)
8. [生产部署](#生产部署)
9. [常见问题排查](#常见问题排查)

---

## 🖥️ 系统要求

### 操作系统
- **Windows 10/11** (推荐)
- **macOS 10.15+**
- **Linux (Ubuntu 20.04+)**

### 硬件要求
- **CPU**: Intel i5 或同等级以上
- **内存**: 8GB RAM 最低，16GB 推荐
- **存储**: 至少 20GB 可用空间
- **网络**: 初始安装需要网络连接下载依赖包

---

## 📦 必需软件安装

### 1. Node.js 和 npm

**Windows:**
1. 访问 [https://nodejs.org](https://nodejs.org)
2. 下载 LTS 版本（推荐 18.x 或 20.x）
3. 运行安装程序，勾选"Add to PATH"
4. 完成安装后，打开命令行验证：
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# 使用 Homebrew
brew install node
```

**Linux (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Git

**Windows:**
1. 访问 [https://git-scm.com](https://git-scm.com)
2. 下载并安装 Git for Windows
3. 验证安装：
   ```bash
   git --version
   ```

**macOS:**
```bash
brew install git
```

**Linux (Ubuntu):**
```bash
sudo apt-get install git
```

### 3. MySQL 数据库

**Windows:**
1. 下载 MySQL Community Server: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. 运行安装程序
3. 配置 MySQL Server 作为 Windows 服务
4. 设置 root 密码（记住此密码！）
5. 验证安装：
   ```bash
   mysql --version
   ```

**macOS:**
```bash
brew install mysql
brew services start mysql
# 初始化 MySQL
mysql_secure_installation
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 4. pnpm 包管理器

```bash
npm install -g pnpm
pnpm --version
```

### 5. Visual Studio Code (推荐)

访问 [https://code.visualstudio.com](https://code.visualstudio.com) 下载安装。

推荐扩展：
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- SQLTools

---

## 🔄 项目克隆与配置

### 1. 克隆项目

```bash
# 进入工作目录
cd ~/projects  # 或您选择的目录

# 克隆项目
git clone https://github.com/your-username/employee_showcase_system.git
cd employee_showcase_system
```

### 2. 安装依赖

```bash
# 使用 pnpm 安装依赖
pnpm install

# 如果遇到问题，可以清除缓存后重新安装
pnpm store prune
pnpm install
```

---

## ⚙️ 环境变量配置

### 1. 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL="mysql://root:your_password@localhost:3306/employee_showcase"

# JWT 密钥（用于会话加密）
JWT_SECRET="your-secret-key-min-32-characters-long-for-security"

# OAuth 配置（如果需要本地认证，可以禁用）
VITE_APP_ID="local-dev-app-id"
OAUTH_SERVER_URL="http://localhost:3000"
VITE_OAUTH_PORTAL_URL="http://localhost:3000/login"

# 应用配置
VITE_APP_TITLE="员工风采大屏展示系统"
VITE_APP_LOGO="https://your-logo-url.png"

# 所有者信息
OWNER_NAME="系统管理员"
OWNER_OPEN_ID="admin-001"

# API 端点（本地开发）
VITE_FRONTEND_FORGE_API_URL="http://localhost:3000/api"
VITE_FRONTEND_FORGE_API_KEY="local-dev-key"
BUILT_IN_FORGE_API_URL="http://localhost:3000/api"
BUILT_IN_FORGE_API_KEY="local-dev-key"
```

### 2. 创建 .env.local 文件（可选，用于本地覆盖）

```bash
# 本地开发特定配置
DATABASE_URL="mysql://root:password@localhost:3306/employee_showcase_dev"
NODE_ENV="development"
```

---

## 🗄️ 数据库设置

### 1. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 输入密码后执行以下命令
CREATE DATABASE employee_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE employee_showcase_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 查看创建的数据库
SHOW DATABASES;

# 退出 MySQL
EXIT;
```

### 2. 运行数据库迁移

```bash
# 生成迁移文件（如果需要）
pnpm drizzle-kit generate

# 应用迁移
pnpm drizzle-kit migrate
```

### 3. 初始化示例数据（可选）

创建 `scripts/seed-db.mjs` 文件：

```javascript
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'employee_showcase'
});

// 插入示例部门
await connection.execute(`
  INSERT INTO departments (name, description) VALUES
  ('管理层', '公司管理部门'),
  ('商务部', '商务合作部门'),
  ('工程部', '技术工程部门'),
  ('安环部', '安全环保部门'),
  ('调度运行部', '调度运行部门'),
  ('综合部', '综合管理部门'),
  ('财务部', '财务管理部门')
`);

// 插入示例员工
await connection.execute(`
  INSERT INTO employees (name, position, department, joinDate, workPhoto, workResponsibilities, workCredo) VALUES
  ('张三', '总经理', '管理层', '2022-01-15', 'https://example.com/photo1.jpg', '负责公司整体运营管理', '诚信、创新、卓越'),
  ('李四', '工程师', '工程部', '2023-06-20', 'https://example.com/photo2.jpg', '负责系统开发与维护', '精益求精、持续改进')
`);

await connection.end();
console.log('数据库初始化完成！');
```

运行脚本：
```bash
node scripts/seed-db.mjs
```

---

## 🔧 代码修改指南

### 1. 禁用 OAuth 认证（离线模式）

编辑 `server/_core/oauth.ts`：

```typescript
// 如果需要禁用 OAuth，修改以下代码
export const isOAuthEnabled = process.env.NODE_ENV === 'production';

// 或者在 .env 中添加
DISABLE_OAUTH="true"
```

### 2. 修改 API 端点

编辑 `client/src/lib/trpc.ts`：

```typescript
// 修改为本地端点
const baseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : window.location.origin;

export const trpc = createTRPCClient({
  links: [
    httpBatchLink({
      url: `${baseUrl}/api/trpc`,
    }),
  ],
});
```

### 3. 修改图片上传配置

编辑 `server/storage.ts`，如果使用本地存储而不是 S3：

```typescript
import fs from 'fs';
import path from 'path';

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
) {
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
  // 确保目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filePath = path.join(uploadDir, relKey);
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  
  fs.writeFileSync(filePath, buffer);
  
  return {
    key: relKey,
    url: `/uploads/${relKey}`
  };
}
```

### 4. 修改数据库连接字符串

编辑 `server/_core/db.ts`：

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = await mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_showcase',
  port: parseInt(process.env.DB_PORT || '3306'),
});

export const db = drizzle(poolConnection);
```

---

## 🚀 本地运行

### 1. 开发模式

```bash
# 启动开发服务器（包含热重载）
pnpm dev

# 服务器将在 http://localhost:3000 启动
# 前端在 http://localhost:5173（Vite 开发服务器）
```

### 2. 构建生产版本

```bash
# 构建前端
pnpm build

# 构建后的文件在 client/dist 目录
```

### 3. 运行生产版本

```bash
# 先构建
pnpm build

# 启动生产服务器
pnpm start

# 或使用 Node.js 直接运行
node server/index.js
```

---

## 📦 生产部署

### 1. Docker 部署（推荐）

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

构建和运行 Docker 容器：

```bash
# 构建镜像
docker build -t employee-showcase:latest .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://root:password@mysql-host:3306/employee_showcase" \
  -e JWT_SECRET="your-secret-key" \
  --name employee-showcase \
  employee-showcase:latest
```

### 2. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: employee_showcase
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "mysql://root:root_password@mysql:3306/employee_showcase"
      JWT_SECRET: "your-secret-key"
      NODE_ENV: "production"
    depends_on:
      - mysql

volumes:
  mysql_data:
```

启动：

```bash
docker-compose up -d
```

### 3. 使用 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'employee-showcase',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 查看日志
pm2 logs

# 停止应用
pm2 stop all
```

---

## 🐛 常见问题排查

### 问题 1: 数据库连接失败

**错误信息**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:
```bash
# 检查 MySQL 是否运行
mysql --version

# 启动 MySQL 服务
# Windows: net start MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# 测试连接
mysql -u root -p -h localhost
```

### 问题 2: 端口被占用

**错误信息**: `Error: listen EADDRINUSE :::3000`

**解决方案**:
```bash
# Windows: 查找并杀死占用 3000 端口的进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux: 
lsof -i :3000
kill -9 <PID>

# 或修改 .env 中的 PORT
PORT=3001
```

### 问题 3: 依赖安装失败

**错误信息**: `npm ERR! code ERESOLVE`

**解决方案**:
```bash
# 清除 npm 缓存
npm cache clean --force

# 使用 pnpm 重新安装
pnpm install

# 如果仍然失败，删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 问题 4: 环境变量未被读取

**错误信息**: `undefined` 或连接错误

**解决方案**:
```bash
# 确保 .env 文件在项目根目录
ls -la .env

# 检查 .env 文件格式（不要有空格）
cat .env

# 重启开发服务器
pnpm dev
```

### 问题 5: 数据库迁移失败

**错误信息**: `Error: Unknown database`

**解决方案**:
```bash
# 手动创建数据库
mysql -u root -p -e "CREATE DATABASE employee_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 重新运行迁移
pnpm drizzle-kit migrate
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

## 🔐 安全建议

1. **不要提交 .env 文件到 Git**
   ```bash
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **使用强密码**
   - MySQL root 密码至少 12 个字符
   - JWT_SECRET 至少 32 个字符

3. **定期更新依赖**
   ```bash
   pnpm update
   ```

4. **启用 HTTPS**（生产环境）
   - 使用 Let's Encrypt 获取免费证书
   - 配置反向代理（Nginx）

5. **备份数据库**
   ```bash
   mysqldump -u root -p employee_showcase > backup.sql
   ```

---

## 📚 相关资源

- [Node.js 官方文档](https://nodejs.org/docs/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [tRPC 文档](https://trpc.io/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

---

## 💡 性能优化建议

1. **启用数据库连接池**
   ```typescript
   const pool = mysql.createPool({
     connectionLimit: 10,
     host: 'localhost',
     user: 'root',
     password: 'password',
     database: 'employee_showcase'
   });
   ```

2. **添加缓存层**
   ```bash
   pnpm add redis
   ```

3. **启用 Gzip 压缩**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

4. **使用 CDN 加速静态资源**

---

**最后更新**: 2026-03-30
**版本**: 1.0.0
