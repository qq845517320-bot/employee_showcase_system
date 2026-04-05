# 离线部署 Logo 配置指南

## 概述

本指南说明如何在本地离线部署中正确配置公司 Logo，使其在无网络连接的情况下也能正常显示。

---

## 📋 前置条件

- 已从 GitHub 克隆项目到本地：`C:\deploy\employee_showcase_system_fresh\`
- 已安装 Node.js、pnpm 等依赖
- Logo 文件已从 CDN 下载到本地（见下文）

---

## 🎯 Logo 文件配置

### 第一步：获取 Logo 文件

#### 方式 1：从 CDN 下载（推荐）

在 PowerShell 中执行以下命令：

```powershell
# 进入项目目录
cd C:\deploy\employee_showcase_system_fresh

# 下载 Logo 文件到 public 目录
$url = "https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/深国际Logo_597125f6.jpg"
$outputPath = "client\public\company-logo.jpg"
Invoke-WebRequest -Uri $url -OutFile $outputPath

# 验证文件是否下载成功
Get-Item $outputPath
```

#### 方式 2：手动复制

如果上述命令不工作，您可以：

1. 在浏览器中访问：https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/深国际Logo_597125f6.jpg
2. 右键点击图片 → 另存为
3. 保存到：`C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg`

### 第二步：验证文件位置

执行以下命令验证 Logo 文件是否在正确位置：

```powershell
# 检查文件是否存在
Test-Path "C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg"

# 显示文件信息
Get-Item "C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg" | Format-List
```

**预期输出**：
```
Mode                 : -a----
LastWriteTime        : 2026/4/5 14:17:04
Length               : 39522
Name                 : company-logo.jpg
```

---

## 📝 代码修改

### 修改的文件

**文件路径**：`client/src/pages/Showcase.tsx`

**修改行号**：第 570 行

### 修改内容

**修改前**（使用 CDN 链接）：
```typescript
<img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/深国际Logo_597125f6.jpg" alt="Logo" className="h-12 w-auto" />
```

**修改后**（使用本地路径）：
```typescript
<img src="/company-logo.jpg" alt="Logo" className="h-12 w-auto" />
```

**代码已自动修改**，您无需手动修改。

---

## 🚀 本地运行测试

### 开发环境测试

1. **进入项目目录**：
```powershell
cd C:\deploy\employee_showcase_system_fresh
```

2. **安装依赖**（如果未安装）：
```powershell
pnpm install
```

3. **启动开发服务器**：
```powershell
pnpm dev
```

4. **打开浏览器**：
访问 `http://localhost:3000/showcase`

5. **验证 Logo 显示**：
- 左上角应该显示公司 Logo
- 在浏览器开发者工具（F12）中检查 Network 标签
- 应该看到 `/company-logo.jpg` 的请求状态为 200 OK

### 生产环境构建

1. **构建项目**：
```powershell
pnpm build
```

2. **验证构建输出**：
```powershell
# 检查 dist 目录中是否包含 company-logo.jpg
Get-Item "dist\company-logo.jpg" -ErrorAction SilentlyContinue
```

3. **启动生产服务器**：
```powershell
# 使用 Node.js 内置服务器或 PM2
pnpm start

# 或使用 PM2（如果已安装）
pm2 start "npm run start" --name "showcase"
```

4. **访问应用**：
访问 `http://localhost:3000/showcase`

---

## 🔍 故障排查

### 问题 1：Logo 不显示

**症状**：左上角显示空白或图片加载失败

**解决方案**：

1. **检查文件是否存在**：
```powershell
Test-Path "C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg"
```

2. **检查浏览器控制台**（F12 → Console）：
- 查看是否有 404 错误
- 如果有，说明文件路径不正确

3. **检查网络请求**（F12 → Network）：
- 刷新页面
- 查找 `company-logo.jpg` 请求
- 确认状态码为 200 OK

4. **重新下载 Logo 文件**：
```powershell
# 删除旧文件
Remove-Item "C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg" -Force

# 重新下载
$url = "https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/深国际Logo_597125f6.jpg"
$outputPath = "C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg"
Invoke-WebRequest -Uri $url -OutFile $outputPath
```

### 问题 2：离线时 Logo 仍不显示

**症状**：断开网络后，Logo 无法显示

**原因**：可能是浏览器缓存问题

**解决方案**：

1. **清除浏览器缓存**：
   - Chrome：Ctrl + Shift + Delete
   - Edge：Ctrl + Shift + Delete
   - Firefox：Ctrl + Shift + Delete

2. **强制刷新页面**：
   - Ctrl + F5（Windows）
   - Cmd + Shift + R（Mac）

3. **使用无痕模式测试**：
   - Chrome：Ctrl + Shift + N
   - Edge：Ctrl + Shift + InPrivate
   - Firefox：Ctrl + Shift + P

### 问题 3：文件下载失败

**症状**：PowerShell 命令下载失败

**解决方案**：

1. **检查网络连接**：
```powershell
Test-NetConnection -ComputerName d2xsxph8kpxj0f.cloudfront.net -Port 443
```

2. **使用 curl 命令下载**（如果已安装）：
```powershell
curl -o "C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg" "https://d2xsxph8kpxj0f.cloudfront.net/310519663273338301/dTX999GnT8s8oqjJyp2eQW/深国际Logo_597125f6.jpg"
```

3. **手动下载**：
   - 在浏览器中访问 CDN URL
   - 右键点击图片 → 另存为
   - 保存到 `C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg`

---

## 📦 部署到生产环境

### Windows 服务器部署

1. **将项目文件复制到服务器**：
```powershell
# 在服务器上创建部署目录
New-Item -ItemType Directory -Path "C:\apps\employee_showcase" -Force

# 从开发机复制文件（或使用 Git 克隆）
Copy-Item -Path "C:\deploy\employee_showcase_system_fresh\*" -Destination "C:\apps\employee_showcase" -Recurse -Force
```

2. **在服务器上构建项目**：
```powershell
cd C:\apps\employee_showcase
pnpm install
pnpm build
```

3. **启动应用**：
```powershell
# 方式 1：使用 PM2
pm2 start "npm run start" --name "showcase"

# 方式 2：使用 Node.js 直接运行
node dist/server.js
```

4. **验证 Logo 显示**：
访问 `http://server-ip:3000/showcase`

---

## ✅ 完整检查清单

在部署前，请确保完成以下步骤：

- [ ] Logo 文件已下载到 `client/public/company-logo.jpg`
- [ ] 文件大小约为 39 KB
- [ ] 代码已修改为使用本地路径 `/company-logo.jpg`
- [ ] 开发环境中 Logo 正常显示
- [ ] 生产环境构建成功
- [ ] 生产环境中 Logo 正常显示
- [ ] 离线环境中 Logo 正常显示（无网络连接）
- [ ] 浏览器开发者工具中无 404 错误

---

## 🎯 快速参考

| 操作 | 命令 |
|------|------|
| 下载 Logo | `Invoke-WebRequest -Uri "https://..." -OutFile "client\public\company-logo.jpg"` |
| 验证文件 | `Test-Path "client\public\company-logo.jpg"` |
| 启动开发服务器 | `pnpm dev` |
| 构建项目 | `pnpm build` |
| 启动生产服务器 | `pnpm start` |
| 清除缓存 | Ctrl + Shift + Delete |
| 强制刷新 | Ctrl + F5 |

---

## 📞 支持

如果遇到问题，请检查：

1. **Logo 文件是否存在**：`C:\deploy\employee_showcase_system_fresh\client\public\company-logo.jpg`
2. **代码是否正确修改**：`client/src/pages/Showcase.tsx` 第 570 行
3. **浏览器缓存是否清除**：Ctrl + Shift + Delete
4. **网络连接是否正常**（仅用于首次下载 Logo）

---

## 📚 相关文档

- [OFFLINE_DEPLOYMENT_GUIDE.md](./OFFLINE_DEPLOYMENT_GUIDE.md) - 完整离线部署指南
- [WINDOWS_DEPLOYMENT_QUICK_START.md](./WINDOWS_DEPLOYMENT_QUICK_START.md) - Windows 快速启动指南
- [CODE_LEARNING_GUIDE.md](./CODE_LEARNING_GUIDE.md) - 代码学习指南
