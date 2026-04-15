# 员工风采展示系统 - 完整部署文档合集

**文档版本**: v1.0  
**最后更新**: 2026年4月15日  
**适用系统**: Windows 10/11, Linux (Ubuntu 20.04+), macOS 10.15+  
**部署目标**: 公司大屏展示电脑（本地离线部署）

---

## 📑 文档目录

1. [快速开始](#快速开始)
2. [系统要求](#系统要求)
3. [环境安装](#环境安装)
4. [环境配置](#环境配置)
5. [数据库设置](#数据库设置)
6. [应用部署](#应用部署)
7. [大屏配置](#大屏配置)
8. [部署验证](#部署验证)
9. [故障排查](#故障排查)
10. [日常维护](#日常维护)
11. [常见问题](#常见问题)
12. [附录](#附录)

---

## 🚀 快速开始

### 5分钟快速部署（适合有经验的用户）

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/employee_showcase_system.git
cd employee_showcase_system

# 2. 配置环境
cp .env.example .env
# 编辑 .env，修改数据库密码

# 3. 初始化数据库
mysql -u root -p < scripts/init-database.sql

# 4. 安装依赖
pnpm install

# 5. 启动应用
pnpm dev
# 或生产模式: ./scripts/start-production.sh

# 6. 访问应用
# 首页: http://localhost:3000
# 大屏: http://localhost:3000/showcase
# 管理: http://localhost:3000/admin
```

### 首次部署建议

如果这是您第一次部署此系统，请按照完整的分步指南进行，而不是快速开始。完整指南从[系统要求](#系统要求)部分开始。

---

## 🖥️ 系统要求

### 硬件要求

| 配置项 | 最低要求 | 推荐配置 |
|--------|---------|---------|
| **CPU** | 4核 2.0GHz | 8核 2.5GHz+ |
| **内存** | 8GB | 16GB+ |
| **存储** | 50GB SSD | 100GB+ SSD |
| **显示器** | 1920×1080 | 2560×1440+ |
| **网络** | 本地网络 | 千兆网络 |

### 软件要求

| 软件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| **操作系统** | Windows 10 / Ubuntu 20.04 | Windows 11 / Ubuntu 22.04 |
| **Node.js** | v18.0.0 | v22.13.0+ |
| **npm** | v9.0.0 | v10.0.0+ |
| **pnpm** | v8.0.0 | v9.0.0+ |
| **MySQL** | v8.0 | v8.0.35+ |
| **浏览器** | Chrome 100+ | Chrome 120+ |

### 网络要求

- ✅ 本地网络连接正常
- ✅ 防火墙允许 3000 端口访问
- ✅ 初始安装需要网络下载依赖包
- ✅ 运行时可完全离线（无需外网）

---

## 🔧 环境安装

### Windows 系统安装

#### 第1步：安装 Node.js

1. 访问 https://nodejs.org，下载 LTS 版本
2. 运行安装程序，**务必勾选 "Add to PATH"**
3. 完成后验证：
   ```powershell
   node --version
   npm --version
   ```

#### 第2步：安装 pnpm

```powershell
npm install -g pnpm
pnpm --version
```

#### 第3步：安装 MySQL

1. 下载 MySQL 8.0 社区版：https://dev.mysql.com/downloads/mysql/
2. 运行安装程序：
   - 选择 "Server only"
   - 配置 MySQL 为 Windows 服务
   - 设置 root 密码（**请记住此密码！**）
   - 设置字符集为 utf8mb4
3. 验证安装：
   ```powershell
   mysql --version
   mysql -u root -p
   # 输入密码，成功进入 MySQL 提示符
   EXIT;
   ```

#### 第4步：安装 Git（可选但推荐）

1. 访问 https://git-scm.com，下载 Git for Windows
2. 运行安装程序，使用默认设置
3. 验证：`git --version`

### Linux 系统安装（Ubuntu/Debian）

```bash
# 更新包管理器
sudo apt update

# 安装 Node.js
sudo apt install -y nodejs npm

# 安装 pnpm
sudo npm install -g pnpm

# 安装 MySQL
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 验证安装
node --version
npm --version
pnpm --version
mysql --version
```

### macOS 系统安装

```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 安装 pnpm
npm install -g pnpm

# 安装 MySQL
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 验证安装
node --version
npm --version
pnpm --version
mysql --version
```

---

## ⚙️ 环境配置

### 第1步：获取项目文件

**方式1：从 GitHub 克隆**
```bash
git clone https://github.com/your-repo/employee_showcase_system.git
cd employee_showcase_system
```

**方式2：从 ZIP 文件解压**
```bash
unzip employee_showcase_system.zip
cd employee_showcase_system
```

### 第2步：创建环境配置文件

```bash
# 复制配置文件模板
cp .env.example .env

# 编辑 .env 文件
# Windows: 使用记事本或 VS Code
# Linux/macOS: nano .env 或 vim .env
```

### 第3步：配置数据库连接

编辑 `.env` 文件，修改以下内容：

```env
# 数据库配置
DATABASE_URL=mysql://showcase_user:your_password@localhost:3306/employee_showcase
DB_HOST=localhost
DB_PORT=3306
DB_USER=showcase_user
DB_PASSWORD=your_password
DB_NAME=employee_showcase

# 应用配置
PORT=3000
NODE_ENV=development
VITE_APP_TITLE=员工风采展示系统

# JWT 密钥（保持原值或生成新的）
JWT_SECRET=your_jwt_secret_key_here_change_this

# 大屏展示配置
SHOWCASE_INTERVAL=10000
DETAIL_CARD_DURATION=8000
COMPANY_PHOTO_DURATION=6000

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs
```

### 第4步：验证配置

```bash
# 检查 .env 文件是否存在
ls -la .env

# 查看配置内容（不显示密码）
grep -v PASSWORD .env
```

---

## 🗄️ 数据库设置

### 第1步：启动 MySQL 服务

**Windows**：
```powershell
# MySQL 应该已作为 Windows 服务运行
Get-Service MySQL80
```

**Linux**：
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

**macOS**：
```bash
brew services start mysql
```

### 第2步：初始化数据库

```bash
# 进入项目目录
cd employee_showcase_system

# 运行初始化脚本
mysql -u root -p < scripts/init-database.sql

# 系统会提示输入 root 密码
```

### 第3步：验证数据库

```bash
# 连接到数据库
mysql -u showcase_user -p

# 输入密码（默认为 'password'）
# 然后运行以下命令验证

USE employee_showcase;
SHOW TABLES;
SELECT * FROM departments;
SELECT * FROM playback_strategies;

# 退出
EXIT;
```

### 第4步：修改数据库密码（推荐）

```bash
# 连接到 MySQL
mysql -u root -p

# 修改 showcase_user 密码
ALTER USER 'showcase_user'@'localhost' IDENTIFIED BY 'your_new_strong_password';
FLUSH PRIVILEGES;
EXIT;

# 更新 .env 文件中的 DB_PASSWORD
```

---

## 🚀 应用部署

### 第1步：安装依赖

```bash
# 进入项目目录
cd employee_showcase_system

# 安装依赖（首次运行需要几分钟）
pnpm install

# 如果遇到问题，清除缓存后重试
pnpm store prune
pnpm install
```

### 第2步：构建应用

```bash
# 构建生产版本
pnpm build

# 输出应该显示 "build complete"
```

### 第3步：启动应用

**开发模式（用于测试和开发）**：
```bash
pnpm dev
```

**生产模式（推荐用于大屏展示）**：

Windows：
```powershell
.\scripts\start-windows.bat
```

Linux/macOS：
```bash
chmod +x scripts/start-production.sh
./scripts/start-production.sh
```

或使用 PM2 进程管理：
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

### 第4步：验证应用启动

打开浏览器，访问以下地址：

- **首页**: http://localhost:3000
- **大屏展示**: http://localhost:3000/showcase
- **管理系统**: http://localhost:3000/admin

如果所有页面都能正常加载，说明应用启动成功。

---

## 🖥️ 大屏配置

### 第1步：浏览器全屏设置

#### Chrome 浏览器

1. 打开 Chrome 浏览器
2. 访问 http://localhost:3000/showcase
3. 按 F11 进入全屏模式

#### Edge 浏览器

1. 打开 Edge 浏览器
2. 访问 http://localhost:3000/showcase
3. 按 F11 进入全屏模式

#### Kiosk 模式（推荐用于大屏展示）

```bash
# Windows PowerShell
Start-Process chrome -ArgumentList "--kiosk http://localhost:3000/showcase"

# Linux/macOS
chrome --kiosk http://localhost:3000/showcase
# 或
google-chrome --kiosk http://localhost:3000/showcase
```

### 第2步：开机自启动配置

#### Windows 系统

**方式1：使用任务计划程序**

1. 打开"任务计划程序"（Win+R，输入 `taskschd.msc`）
2. 右键点击"任务计划程序库"，选择"创建基本任务"
3. 填写任务信息：
   - 名称：`Employee Showcase Startup`
   - 描述：`启动员工风采展示系统`
4. 触发器：选择"在系统启动时"
5. 操作：选择"启动程序"
   - 程序或脚本：`C:\path\to\scripts\start-windows.bat`
   - 起始于：`C:\path\to\employee_showcase_system`
6. 完成

**方式2：使用启动文件夹**

1. 创建批处理文件 `startup.bat`
2. 将文件复制到启动文件夹（Win+R，输入 `shell:startup`）

#### Linux 系统

**使用 systemd 服务**

1. 创建服务文件：
   ```bash
   sudo nano /etc/systemd/system/employee-showcase.service
   ```

2. 输入以下内容：
   ```ini
   [Unit]
   Description=Employee Showcase System
   After=network.target mysql.service
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/employee_showcase_system
   ExecStart=/usr/bin/pnpm start
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

3. 启用服务：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable employee-showcase.service
   sudo systemctl start employee-showcase.service
   ```

### 第3步：显示器设置

1. 设置分辨率为最高支持的分辨率
2. 关闭屏幕保护程序
3. 设置电源计划为"高性能"
4. 禁用自动睡眠

---

## ✅ 部署验证

### 系统启动验证

| 检查项 | 验证方法 | 预期结果 |
|--------|--------|--------|
| **Node.js** | `node --version` | 显示 v22.13.0+ |
| **npm** | `npm --version` | 显示 v10.0+ |
| **pnpm** | `pnpm --version` | 显示 v9.0+ |
| **MySQL** | `mysql --version` | 显示 v8.0+ |
| **数据库连接** | `mysql -u showcase_user -p` | 成功连接 |
| **项目依赖** | `ls node_modules` | 目录存在 |
| **应用构建** | `ls dist/` | 目录存在 |

### 应用功能验证

| 功能 | 验证方法 | 预期结果 |
|------|--------|--------|
| **首页加载** | 访问 http://localhost:3000 | 页面正常显示 |
| **大屏展示** | 访问 http://localhost:3000/showcase | 页面正常显示 |
| **管理系统** | 访问 http://localhost:3000/admin | 页面正常显示 |
| **员工管理** | 在管理系统添加员工 | 员工信息保存成功 |
| **照片上传** | 上传公司风采照片 | 照片保存成功 |
| **轮播展示** | 在大屏查看轮播 | 自动轮播正常工作 |
| **部门筛选** | 选择具体部门 | 显示该部门员工 |
| **荣誉榜** | 选择荣誉分类 | 显示符合条件的员工 |

### 性能验证

| 指标 | 验证方法 | 预期结果 |
|------|--------|--------|
| **页面加载时间** | 打开浏览器 DevTools，查看 Network 标签 | < 3 秒 |
| **API 响应时间** | 查看 Network 标签中的 XHR 请求 | < 500ms |
| **内存占用** | 运行 `tasklist` 或 `top` 命令 | < 500MB |
| **CPU 占用** | 查看任务管理器或 `top` 命令 | < 20% |

---

## 🔍 故障排查

### 常见问题诊断

#### 问题1：应用无法启动

**症状**：运行 `pnpm dev` 后无响应或报错

**诊断步骤**：
1. 检查 Node.js 是否安装：`node --version`
2. 检查依赖是否完整：`ls node_modules | wc -l`
3. 检查 `.env` 文件是否存在
4. 查看错误日志：`cat .manus-logs/devserver.log`

**解决方案**：
```bash
# 清除缓存并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新构建
pnpm build

# 重新启动
pnpm dev
```

#### 问题2：数据库连接失败

**症状**：应用启动后无法连接数据库

**诊断步骤**：
1. 检查 MySQL 是否运行：`mysql -u root -p`
2. 检查数据库是否存在：`mysql -u root -p -e "SHOW DATABASES;"`
3. 检查 `.env` 中的 `DATABASE_URL` 是否正确
4. 检查数据库用户权限

**解决方案**：
```bash
# 重新初始化数据库
mysql -u root -p < scripts/init-database.sql

# 验证数据库连接
mysql -u showcase_user -p -e "SELECT 1;"
```

#### 问题3：端口被占用

**症状**：启动应用时报错 "Port 3000 already in use"

**诊断步骤**：
1. 检查 3000 端口占用情况
2. 查找占用进程

**解决方案**：

Windows：
```powershell
# 查找占用进程
netstat -ano | findstr :3000

# 杀死进程（替换 PID）
taskkill /PID <PID> /F
```

Linux：
```bash
# 查找占用进程
lsof -i :3000

# 杀死进程（替换 PID）
kill -9 <PID>
```

#### 问题4：前端无法连接后端

**症状**：浏览器访问页面，但无法加载数据

**诊断步骤**：
1. 打开浏览器 DevTools (F12)
2. 查看 Console 中的错误信息
3. 查看 Network 中的请求状态
4. 检查后端服务是否正在运行

**解决方案**：
```bash
# 确保后端服务正在运行
pnpm dev

# 清除浏览器缓存
# 按 Ctrl+Shift+Delete 打开清除缓存对话框

# 重新访问页面
# http://localhost:3000
```

#### 问题5：大屏显示异常

**症状**：大屏展示页面显示不正常或卡顿

**诊断步骤**：
1. 检查浏览器是否全屏
2. 检查分辨率是否正确
3. 检查是否有浏览器插件干扰
4. 检查系统性能

**解决方案**：
```bash
# 使用无扩展模式启动 Chrome
chrome --disable-extensions http://localhost:3000/showcase

# 或使用 Kiosk 模式（全屏展示）
chrome --kiosk http://localhost:3000/showcase
```

### 日志查看

**查看应用日志**：
```bash
# 实时查看日志
tail -f .manus-logs/devserver.log

# 查看错误日志
cat .manus-logs/browserConsole.log

# 查看网络请求日志
cat .manus-logs/networkRequests.log
```

**查看 MySQL 日志**：
```bash
# Linux
sudo tail -f /var/log/mysql/error.log

# Windows
# 在 MySQL 安装目录下的 data 文件夹中查看 .err 文件
```

---

## 🛠️ 日常维护

### 每日检查

- [ ] 应用是否正常运行
- [ ] 大屏显示是否正常
- [ ] 是否有错误日志
- [ ] 系统性能是否正常

### 每周维护

- [ ] 备份数据库
- [ ] 检查磁盘空间
- [ ] 清理日志文件
- [ ] 更新员工信息

### 每月维护

- [ ] 检查依赖包更新
- [ ] 清理临时文件
- [ ] 性能优化检查
- [ ] 安全性检查

### 数据库备份

```bash
# 备份数据库
mysqldump -u showcase_user -p employee_showcase > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
mysql -u showcase_user -p employee_showcase < backup_20260415_120000.sql
```

### 应用更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install

# 构建应用
pnpm build

# 重启应用
# 停止当前应用（Ctrl+C）
# 重新启动应用
pnpm dev
```

### 性能监控

```bash
# 查看进程内存占用
ps aux | grep node

# 查看磁盘空间
df -h

# 查看 MySQL 连接数
mysql -u root -p -e "SHOW PROCESSLIST;"

# 查看 MySQL 表大小
mysql -u root -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = 'employee_showcase';"
```

---

## ❓ 常见问题

### Q1：如何修改数据库密码？

**步骤**：
1. 在 MySQL 中修改密码：`ALTER USER 'showcase_user'@'localhost' IDENTIFIED BY 'new_password';`
2. 更新 `.env` 文件中的 `DB_PASSWORD`
3. 重启应用

### Q2：如何修改应用端口？

**步骤**：
1. 编辑 `.env` 文件，修改 `PORT` 值
2. 重启应用
3. 在浏览器中访问新端口

### Q3：如何启用 HTTPS？

**步骤**：
1. 获取 SSL 证书（自签名或从证书颁发机构）
2. 配置 Node.js 应用使用 HTTPS
3. 更新浏览器访问 URL 为 `https://...`

### Q4：如何查看应用日志？

**步骤**：
1. 查看日志文件：`cat ./logs/app.log`
2. 实时查看日志：`tail -f ./logs/app.log`
3. 查看错误日志：`cat ./logs/error.log`

### Q5：如何禁用 OAuth 认证？

**步骤**：
1. 在 `.env` 中添加：`DISABLE_OAUTH="true"`
2. 在数据库中直接创建用户
3. 重启应用

### Q6：如何备份和恢复数据库？

**备份**：
```bash
mysqldump -u showcase_user -p employee_showcase > backup.sql
```

**恢复**：
```bash
mysql -u showcase_user -p employee_showcase < backup.sql
```

### Q7：如何处理内存泄漏问题？

**症状**：应用运行时间长后，内存占用不断增加

**解决方案**：
1. 定期重启应用
2. 使用 PM2 的自动重启功能
3. 检查代码中是否有内存泄漏

```bash
# PM2 配置自动重启
pm2 start app.js --max-memory-restart 500M
```

---

## 📚 附录

### A. 快速启动命令

```bash
# 进入项目目录
cd employee_showcase_system

# 开发模式启动
pnpm dev

# 生产模式启动（Linux）
./scripts/start-production.sh

# 生产模式启动（Windows）
.\scripts\start-windows.bat

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看应用状态
pm2 status

# 查看日志
pm2 logs employee-showcase

# 停止应用
pm2 stop employee-showcase

# 重启应用
pm2 restart employee-showcase
```

### B. 常用 MySQL 命令

```bash
# 连接数据库
mysql -u showcase_user -p

# 查看所有数据库
SHOW DATABASES;

# 选择数据库
USE employee_showcase;

# 查看所有表
SHOW TABLES;

# 查看表结构
DESCRIBE employees;

# 查看表数据
SELECT * FROM employees;

# 查看员工总数
SELECT COUNT(*) FROM employees;

# 查看各部门员工数
SELECT department, COUNT(*) FROM employees GROUP BY department;

# 查看荣誉榜员工
SELECT * FROM employees WHERE honor_type IS NOT NULL;

# 删除表中所有数据
DELETE FROM employees;

# 重置自增ID
ALTER TABLE employees AUTO_INCREMENT = 1;
```

### C. 浏览器快捷键

| 快捷键 | 功能 |
|--------|------|
| F12 | 打开开发者工具 |
| F11 | 全屏模式 |
| Ctrl+Shift+Delete | 清除缓存 |
| Ctrl+R | 刷新页面 |
| Ctrl+Shift+R | 硬刷新（清除缓存） |
| Ctrl+L | 选中地址栏 |

### D. 文件结构说明

```
employee_showcase_system/
├── client/                    # 前端代码
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 可复用组件
│   │   ├── hooks/            # 自定义 Hook
│   │   ├── lib/              # 工具库
│   │   ├── App.tsx           # 路由配置
│   │   └── index.css         # 全局样式
│   └── index.html            # HTML 入口
├── server/                    # 后端代码
│   ├── db.ts                 # 数据库查询
│   ├── routers.ts            # tRPC 路由
│   ├── storage.ts            # 文件存储
│   └── _core/                # 核心框架
├── drizzle/                   # 数据库迁移
│   └── schema.ts             # 数据库表定义
├── scripts/                   # 脚本文件
│   ├── start-windows.bat     # Windows 启动脚本
│   ├── start-unix.sh         # Linux/macOS 启动脚本
│   ├── start-production.sh   # 生产环境启动脚本
│   └── init-database.sql     # 数据库初始化脚本
├── .env.example              # 环境变量示例
├── .env                       # 环境变量配置（不提交）
├── package.json              # 项目配置
├── pnpm-lock.yaml            # 依赖锁定文件
└── README.md                 # 项目说明
```

### E. 安全建议

1. **不要提交 .env 文件到 Git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **使用强密码**
   - 至少 12 个字符
   - 包含大小写字母、数字和特殊字符

3. **定期更新依赖**
   ```bash
   pnpm update
   ```

4. **启用 HTTPS**（生产环境）
   - 使用 Let's Encrypt 获取免费证书
   - 或使用反向代理（Nginx）配置 HTTPS

5. **定期备份数据库**
   ```bash
   mysqldump -u showcase_user -p employee_showcase > backup_$(date +%Y%m%d).sql
   ```

### F. 性能优化建议

1. **启用数据库连接池**
   - 提高并发处理能力
   - 减少连接开销

2. **启用缓存**
   - 使用 Redis 缓存热数据
   - 减少数据库查询

3. **优化数据库查询**
   - 添加适当的索引
   - 避免 N+1 查询问题

4. **启用 CDN**
   - 加速静态资源加载
   - 减少服务器带宽占用

5. **监控应用性能**
   - 使用 PM2 Plus 监控
   - 定期检查日志和性能指标

---

## 📞 技术支持

### 获取帮助

1. **查看本文档** - 常见问题和故障排查部分
2. **查看日志文件** - `.manus-logs/` 目录
3. **查看浏览器控制台** - F12 打开开发者工具
4. **查看系统日志** - 检查 MySQL 和 Node.js 错误日志

### 联系方式

- **技术支持**: 请查看项目 GitHub Issues
- **功能建议**: 请提交 GitHub Pull Request
- **安全问题**: 请通过安全邮箱报告

---

## ✅ 部署完成检查清单

部署完成后，请确保以下项目都已完成：

- [ ] Node.js 和 npm 已安装
- [ ] pnpm 已安装
- [ ] MySQL 已安装并运行
- [ ] 数据库已初始化
- [ ] 环境变量已配置
- [ ] 依赖已安装
- [ ] 应用已构建
- [ ] 应用已启动
- [ ] 首页可以访问
- [ ] 大屏展示可以访问
- [ ] 管理系统可以访问
- [ ] 员工信息可以查看
- [ ] 轮播功能正常工作
- [ ] 开机自启动已配置
- [ ] 备份计划已制定
- [ ] 监控系统已配置

---

**文档版本**: v1.0  
**最后更新**: 2026年4月15日  
**作者**: Manus AI  
**许可证**: MIT

---

## 📝 文档修订历史

| 版本 | 日期 | 修改内容 |
|------|------|--------|
| v1.0 | 2026-04-15 | 初始版本，包含完整的部署指南 |

---

**本文档是员工风采展示系统的完整部署指南。如有任何问题或建议，请联系技术支持团队。**
