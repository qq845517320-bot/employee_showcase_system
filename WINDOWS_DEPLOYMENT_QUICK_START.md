# 员工风采大屏展示系统 - Windows 11 本地离线部署快速指南

**预计时间**: 45 分钟 | **难度**: ⭐⭐⭐ (中等)

---

## 📋 目录

1. [前置条件](#前置条件)
2. [第一步：软件安装](#第一步软件安装)
3. [第二步：项目克隆](#第二步项目克隆)
4. [第三步：环境配置](#第三步环境配置)
5. [第四步：数据库设置](#第四步数据库设置)
6. [第五步：代码修改](#第五步代码修改)
7. [第六步：本地运行](#第六步本地运行)
8. [第七步：访问应用](#第七步访问应用)
9. [常见问题](#常见问题)

---

## ✅ 前置条件

在开始之前，请确保您的 Windows 11 电脑满足以下要求：

### 硬件要求
- **CPU**: Intel i5 或更高
- **内存**: 8GB RAM 最低（16GB 推荐）
- **存储**: 至少 30GB 可用空间
- **网络**: 初始安装需要网络连接

### 软件要求
- Windows 11 系统
- 管理员权限（用于安装软件）

### 检查清单
- [ ] 已备份重要数据
- [ ] 已连接网络
- [ ] 有管理员权限
- [ ] 磁盘空间充足

---

## 🔧 第一步：软件安装

### 1.1 安装 Node.js

**下载**:
1. 打开浏览器，访问 [https://nodejs.org](https://nodejs.org)
2. 下载 **LTS 版本**（推荐 v20.x 或更新）
3. 选择 **Windows Installer (.msi)** 64-bit

**安装**:
1. 双击下载的 `.msi` 文件
2. 点击 **Next** 继续
3. 勾选 **Add to PATH** ✅（重要！）
4. 点击 **Install** 开始安装
5. 等待安装完成，点击 **Finish**

**验证**:
1. 打开 PowerShell（按 `Win + X`，选择 **Windows PowerShell**）
2. 输入以下命令：
   ```powershell
   node --version
   npm --version
   ```
3. 应该显示版本号，如 `v20.x.x` 和 `10.x.x`

---

### 1.2 安装 Git

**下载**:
1. 访问 [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. 下载 **Git for Windows** 最新版本

**安装**:
1. 双击 `.exe` 文件
2. 一直点击 **Next** 使用默认设置
3. 最后点击 **Install**

**验证**:
1. 打开 PowerShell
2. 输入：
   ```powershell
   git --version
   ```
3. 应该显示版本号

---

### 1.3 安装 MySQL 数据库

**下载**:
1. 访问 [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. 选择 **Windows (x86, 64-bit), MSI Installer**
3. 下载 **MySQL Community Server** 最新版本（8.0 或更新）

**安装**:
1. 双击 `.msi` 文件
2. 选择 **Developer Default** 或 **Server only**
3. 点击 **Next**
4. 在 **MySQL Server Configuration** 中：
   - 选择 **Development Machine**
   - 端口保持 **3306**
   - 勾选 **Configure MySQL Server as a Windows Service**
5. 点击 **Next**
6. 在 **MySQL Server User Configuration** 中：
   - 用户名：`root`（默认）
   - 密码：**设置一个强密码**（例如：`MySecure123!`）
   - **记住这个密码！后面会用到**
   - 确认密码
7. 点击 **Next** 完成安装

**验证**:
1. 打开 PowerShell
2. 输入：
   ```powershell
   mysql --version
   ```
3. 应该显示版本号

---

### 1.4 安装 pnpm 包管理器

**安装**:
1. 打开 PowerShell
2. 输入以下命令：
   ```powershell
   npm install -g pnpm
   ```
3. 等待安装完成

**验证**:
1. 输入：
   ```powershell
   pnpm --version
   ```
2. 应该显示版本号

---

## 📥 第二步：项目克隆

### 2.1 创建工作目录

1. 打开 PowerShell
2. 创建项目目录：
   ```powershell
   mkdir C:\projects
   cd C:\projects
   ```

### 2.2 克隆项目

```powershell
# 克隆项目（使用最新版本）
git clone https://github.com/your-username/employee_showcase_system.git

# 进入项目目录
cd employee_showcase_system

# 查看当前分支
git status
```

### 2.3 安装依赖

```powershell
# 使用 pnpm 安装依赖（推荐，速度快）
pnpm install

# 如果遇到问题，可以清除缓存后重试
pnpm store prune
pnpm install
```

**预计时间**: 5-15 分钟（取决于网络速度）

---

## ⚙️ 第三步：环境配置

### 3.1 创建 .env 文件

1. 在项目根目录中，创建一个新文件 `.env`
2. 复制以下内容到文件中：

```env
# ============ 数据库配置 ============
DATABASE_URL="mysql://root:MySecure123!@localhost:3306/employee_showcase"

# ============ JWT 密钥 ============
# 用于会话加密，必须至少 32 个字符
JWT_SECRET="your-secret-key-min-32-characters-long-for-security-12345"

# ============ OAuth 配置（本地开发禁用） ============
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
```

### 3.2 修改数据库密码

**重要**: 将 `MySecure123!` 替换为您在安装 MySQL 时设置的密码

例如，如果您设置的密码是 `admin123`，则改为：
```env
DATABASE_URL="mysql://root:admin123@localhost:3306/employee_showcase"
```

### 3.3 保存文件

1. 按 `Ctrl + S` 保存
2. 确保文件名是 `.env`（不是 `.env.txt`）

---

## 🗄️ 第四步：数据库设置

### 4.1 创建数据库

1. 打开 PowerShell
2. 登录 MySQL：
   ```powershell
   mysql -u root -p
   ```
3. 输入您的 MySQL 密码
4. 执行以下 SQL 命令：
   ```sql
   CREATE DATABASE employee_showcase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE employee_showcase_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;
   EXIT;
   ```

### 4.2 运行数据库迁移

1. 在 PowerShell 中，进入项目目录：
   ```powershell
   cd C:\projects\employee_showcase_system
   ```

2. 生成迁移文件：
   ```powershell
   pnpm drizzle-kit generate
   ```

3. 应用迁移到数据库：
   ```powershell
   pnpm drizzle-kit migrate
   ```

4. 验证迁移成功：
   ```powershell
   mysql -u root -p employee_showcase -e "SHOW TABLES;"
   ```

---

## 💻 第五步：代码修改

### 5.1 禁用 OAuth 认证（可选，用于离线开发）

如果您想在完全离线的环境中开发，需要禁用 OAuth：

1. 打开 `server/_core/oauth.ts`
2. 在文件顶部添加以下代码：
   ```typescript
   // 禁用 OAuth（本地开发）
   export const isOAuthEnabled = process.env.DISABLE_OAUTH !== 'true';
   ```

3. 在 `.env` 文件中添加：
   ```env
   DISABLE_OAUTH="true"
   ```

### 5.2 配置本地文件存储（可选）

如果您不想使用 S3 存储，可以使用本地文件系统：

1. 打开 `server/storage.ts`
2. 修改为本地文件存储逻辑（可选，暂时不需要）

---

## 🚀 第六步：本地运行

### 6.1 启动开发服务器

1. 打开 PowerShell
2. 进入项目目录：
   ```powershell
   cd C:\projects\employee_showcase_system
   ```

3. 启动开发服务器：
   ```powershell
   pnpm dev
   ```

4. 等待编译完成，您应该看到类似的输出：
   ```
   ➜  Local:   http://localhost:3000/
   ➜  press h + enter to show help
   ```

### 6.2 保持服务器运行

- **不要关闭** PowerShell 窗口
- 服务器会一直运行在后台
- 修改代码时会自动热更新

---

## 🌐 第七步：访问应用

### 7.1 打开浏览器

1. 打开 Chrome、Edge 或 Firefox
2. 访问：**http://localhost:3000**

### 7.2 首页展示

您应该看到：
- 顶部导航栏，显示"深"（品牌标识）
- 两个主要功能卡片：
  - **大屏展示** - 动态展示员工信息
  - **管理系统** - 管理员后台

### 7.3 访问管理系统

1. 点击 **管理系统** 卡片
2. 系统会提示登录
3. 使用本地账户登录（如果禁用了 OAuth）

---

## 🛠️ 常见问题

### Q1: 启动时出现 "port 3000 already in use" 错误

**原因**: 端口 3000 已被占用

**解决方案**:
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 杀死进程（PID 是上面查询结果的最后一列）
taskkill /PID <PID> /F

# 或者修改 .env 中的端口
# PORT=3001
```

---

### Q2: MySQL 连接失败 "Access denied for user 'root'"

**原因**: 密码错误或 MySQL 服务未启动

**解决方案**:
```powershell
# 检查 MySQL 服务状态
Get-Service MySQL80

# 如果显示 Stopped，启动服务
Start-Service MySQL80

# 验证密码是否正确
mysql -u root -p
# 输入密码
```

---

### Q3: 依赖安装失败 "npm ERR!"

**原因**: 网络问题或包管理器缓存问题

**解决方案**:
```powershell
# 清除 pnpm 缓存
pnpm store prune

# 重新安装
pnpm install

# 如果还是失败，尝试使用 npm
npm install
```

---

### Q4: 数据库迁移失败

**原因**: 数据库连接问题或权限不足

**解决方案**:
```powershell
# 验证数据库连接
mysql -u root -p employee_showcase -e "SELECT 1;"

# 检查 .env 文件中的 DATABASE_URL 是否正确
# 确保密码中没有特殊字符（如果有，需要 URL 编码）

# 手动创建表（如果迁移失败）
mysql -u root -p employee_showcase < drizzle/migrations/0001_*.sql
```

---

### Q5: 前端页面无法加载

**原因**: 后端服务未启动或连接失败

**解决方案**:
```powershell
# 确保后端服务正在运行
# 检查 PowerShell 中是否有错误信息
# 查看浏览器控制台（F12）中的错误

# 重启服务
# 1. 在 PowerShell 中按 Ctrl + C 停止服务
# 2. 重新运行 pnpm dev
```

---

### Q6: 如何停止服务？

在 PowerShell 中按 **Ctrl + C**，然后输入 **Y** 确认停止

---

## 📊 生产部署（可选）

### 构建生产版本

```powershell
# 构建前端和后端
pnpm build

# 输出文件在 dist/ 目录中
```

### 使用 PM2 进程管理

```powershell
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start "pnpm start" --name "employee-showcase"

# 查看运行状态
pm2 status

# 停止应用
pm2 stop employee-showcase

# 开机自启
pm2 startup
pm2 save
```

---

## 📝 快速参考

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm test` | 运行测试 |
| `pnpm drizzle-kit generate` | 生成数据库迁移 |
| `pnpm drizzle-kit migrate` | 应用数据库迁移 |

### 目录结构

```
employee_showcase_system/
├── client/          # 前端代码
├── server/          # 后端代码
├── drizzle/         # 数据库迁移
├── .env             # 环境变量（您创建的）
├── package.json     # 项目配置
└── README.md        # 项目文档
```

---

## ✅ 部署检查清单

- [ ] Node.js v20+ 已安装
- [ ] Git 已安装
- [ ] MySQL 已安装并运行
- [ ] pnpm 已安装
- [ ] 项目已克隆
- [ ] 依赖已安装
- [ ] .env 文件已创建并配置
- [ ] 数据库已创建
- [ ] 迁移已应用
- [ ] 开发服务器已启动
- [ ] 可以访问 http://localhost:3000

---

## 🎯 下一步

部署完成后，您可以：

1. **创建管理员账户** - 在管理系统中创建第一个管理员用户
2. **导入员工数据** - 通过 CSV 批量导入员工信息
3. **配置大屏展示** - 设置轮播策略和背景
4. **自定义样式** - 修改颜色、字体等

---

## 📞 需要帮助？

如果遇到问题，请：

1. 查看上面的 **常见问题** 部分
2. 检查 PowerShell 中的错误信息
3. 查看浏览器控制台（F12）的错误
4. 查看完整的 `OFFLINE_DEPLOYMENT_GUIDE.md` 文件

---

**最后更新**: 2026-04-04
**版本**: 1.0.0 (Windows 11 专用)
