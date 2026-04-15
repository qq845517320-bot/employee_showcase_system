# 环境配置指南

本文档说明如何配置员工风采展示系统的环境变量。

---

## 📋 配置文件位置

环境变量配置文件位置：项目根目录下的 `.env` 文件

**初始化步骤**：
1. 复制 `.env.example` 为 `.env`
2. 根据实际环境修改 `.env` 中的配置
3. 重启应用使配置生效

---

## 🔧 配置项说明

### 数据库配置

| 配置项 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://showcase_user:password@localhost:3306/employee_showcase` | ✅ |
| `DB_HOST` | 数据库主机 | `localhost` | ✅ |
| `DB_PORT` | 数据库端口 | `3306` | ✅ |
| `DB_USER` | 数据库用户名 | `showcase_user` | ✅ |
| `DB_PASSWORD` | 数据库密码 | `your_password` | ✅ |
| `DB_NAME` | 数据库名称 | `employee_showcase` | ✅ |

**配置示例**：
```
DATABASE_URL=mysql://showcase_user:mypassword123@localhost:3306/employee_showcase
DB_HOST=localhost
DB_PORT=3306
DB_USER=showcase_user
DB_PASSWORD=mypassword123
DB_NAME=employee_showcase
```

### 应用配置

| 配置项 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `PORT` | 应用运行端口 | `3000` | ✅ |
| `NODE_ENV` | 运行环境 | `development` 或 `production` | ✅ |
| `VITE_APP_TITLE` | 应用标题 | `员工风采展示系统` | ✅ |
| `VITE_APP_LOGO` | 应用 Logo URL | `https://...` | ❌ |

**配置示例**：
```
PORT=3000
NODE_ENV=development
VITE_APP_TITLE=员工风采展示系统
VITE_APP_LOGO=
```

### OAuth 配置（仅云端部署需要）

| 配置项 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `VITE_APP_ID` | OAuth 应用 ID | `your_app_id` | ❌ |
| `OAUTH_SERVER_URL` | OAuth 服务器 URL | `https://api.manus.im` | ❌ |
| `VITE_OAUTH_PORTAL_URL` | OAuth 登录门户 URL | `https://oauth.manus.im` | ❌ |

**说明**：本地离线部署可以留空或使用默认值

### JWT 配置

| 配置项 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `JWT_SECRET` | JWT 密钥 | `your_jwt_secret_key_here` | ✅ |

**生成方式**（Linux/macOS）：
```bash
openssl rand -base64 32
```

**生成方式**（Windows PowerShell）：
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object {[char]$_}) -join ''))
```

### 大屏展示配置

| 配置项 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `SHOWCASE_INTERVAL` | 自动轮播间隔（毫秒） | `10000` | ❌ |
| `DETAIL_CARD_DURATION` | 员工详情卡片展示时长（毫秒） | `8000` | ❌ |
| `COMPANY_PHOTO_DURATION` | 公司风采照片展示时长（毫秒） | `6000` | ❌ |

**配置示例**：
```
SHOWCASE_INTERVAL=10000
DETAIL_CARD_DURATION=8000
COMPANY_PHOTO_DURATION=6000
```

### 日志配置

| 配置项 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `LOG_LEVEL` | 日志级别 | `info` | ❌ |
| `LOG_DIR` | 日志文件目录 | `./logs` | ❌ |

**日志级别说明**：
- `debug` - 调试信息（最详细）
- `info` - 一般信息
- `warn` - 警告信息
- `error` - 错误信息（最少）

---

## 🚀 快速配置方案

### 方案1：本地开发环境

适用于开发人员在本地机器上开发和测试。

```env
# 数据库
DATABASE_URL=mysql://showcase_user:password123@localhost:3306/employee_showcase
DB_HOST=localhost
DB_PORT=3306
DB_USER=showcase_user
DB_PASSWORD=password123
DB_NAME=employee_showcase

# 应用
PORT=3000
NODE_ENV=development
VITE_APP_TITLE=员工风采展示系统

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_this

# 日志
LOG_LEVEL=debug
LOG_DIR=./logs
```

### 方案2：本地离线部署（大屏电脑）

适用于公司大屏展示电脑的离线部署。

```env
# 数据库
DATABASE_URL=mysql://showcase_user:password123@localhost:3306/employee_showcase
DB_HOST=localhost
DB_PORT=3306
DB_USER=showcase_user
DB_PASSWORD=password123
DB_NAME=employee_showcase

# 应用
PORT=3000
NODE_ENV=production
VITE_APP_TITLE=员工风采展示系统

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_this

# 大屏展示
SHOWCASE_INTERVAL=10000
DETAIL_CARD_DURATION=8000
COMPANY_PHOTO_DURATION=6000

# 日志
LOG_LEVEL=info
LOG_DIR=./logs
```

### 方案3：生产环境部署

适用于企业级生产环境部署。

```env
# 数据库
DATABASE_URL=mysql://showcase_user:secure_password_here@db.company.local:3306/employee_showcase
DB_HOST=db.company.local
DB_PORT=3306
DB_USER=showcase_user
DB_PASSWORD=secure_password_here
DB_NAME=employee_showcase

# 应用
PORT=3000
NODE_ENV=production
VITE_APP_TITLE=员工风采展示系统

# JWT
JWT_SECRET=very_secure_jwt_secret_key_here_change_this

# 大屏展示
SHOWCASE_INTERVAL=10000
DETAIL_CARD_DURATION=8000
COMPANY_PHOTO_DURATION=6000

# 日志
LOG_LEVEL=warn
LOG_DIR=/var/log/employee_showcase
```

---

## ⚙️ 配置验证

### 验证数据库连接

```bash
# 测试 MySQL 连接
mysql -h localhost -u showcase_user -p -e "SELECT 1"

# 验证数据库是否存在
mysql -h localhost -u showcase_user -p -e "SHOW DATABASES LIKE 'employee_showcase'"

# 验证表是否存在
mysql -h localhost -u showcase_user -p employee_showcase -e "SHOW TABLES"
```

### 验证应用配置

```bash
# 检查 .env 文件是否存在
ls -la .env

# 查看 .env 文件内容（不显示密码）
grep -v PASSWORD .env

# 验证应用是否能读取配置
pnpm run dev
```

### 验证应用启动

```bash
# 查看应用是否在指定端口运行
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/macOS

# 测试应用是否响应
curl http://localhost:3000
```

---

## 🔐 安全建议

### 密码安全

1. **使用强密码**：至少 12 个字符，包含大小写字母、数字和特殊字符
2. **定期更换**：每 90 天更换一次数据库密码
3. **不要共享**：不要将 `.env` 文件提交到版本控制系统
4. **限制访问**：设置 `.env` 文件权限为 600（仅所有者可读写）

```bash
# 设置文件权限
chmod 600 .env
```

### JWT 密钥安全

1. **使用随机密钥**：不要使用简单或可预测的密钥
2. **定期轮换**：每 6 个月轮换一次 JWT 密钥
3. **保密存储**：仅在服务器上存储，不要在客户端暴露

### 数据库安全

1. **最小权限原则**：只授予必要的权限
2. **使用防火墙**：限制数据库访问 IP
3. **启用 SSL**：使用 SSL 连接加密数据库通信
4. **定期备份**：每日备份数据库

---

## 🆘 常见问题

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

---

## 📞 技术支持

如遇到配置问题，请：

1. 查看本文档中的常见问题部分
2. 查看应用日志文件
3. 检查数据库连接
4. 验证防火墙设置

---

**文档版本**: v1.0  
**最后更新**: 2026年4月15日  
**作者**: Manus AI
