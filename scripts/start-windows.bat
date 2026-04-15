@echo off
REM ========================================
REM 员工风采展示系统 - Windows 快速启动脚本
REM ========================================
REM 用途: 一键启动应用（开发模式）
REM 使用: 双击运行此脚本或在命令行执行 start-windows.bat

setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     员工风采展示系统 - 快速启动脚本 (Windows)             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js 是否已安装
echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先从 https://nodejs.org 下载并安装 Node.js LTS 版本
    echo 安装时务必勾选 "Add to PATH"
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%

REM 检查 pnpm 是否已安装
echo.
echo [2/4] 检查 pnpm...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pnpm 未安装，正在安装...
    call npm install -g pnpm
)
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo ✅ pnpm 版本: %PNPM_VERSION%

REM 检查 MySQL 是否正在运行
echo.
echo [3/4] 检查 MySQL 数据库...
mysql -h localhost -u root -p%MYSQL_PASSWORD% -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告: 无法连接到 MySQL
    echo 请确保:
    echo   1. MySQL 服务正在运行 (net start MySQL80)
    echo   2. 设置了 MYSQL_PASSWORD 环境变量
    echo   3. 数据库用户和密码正确
    echo.
    set /p CONTINUE="继续启动应用? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        exit /b 1
    )
) else (
    echo ✅ MySQL 连接成功
)

REM 检查依赖是否已安装
echo.
echo [4/4] 检查项目依赖...
if not exist "node_modules" (
    echo 📦 正在安装依赖 (首次运行，可能需要几分钟)...
    call pnpm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)

REM 启动应用
echo.
echo ════════════════════════════════════════════════════════════
echo 🚀 启动应用...
echo ════════════════════════════════════════════════════════════
echo.
echo 应用将在以下地址运行:
echo   • 首页: http://localhost:3000
echo   • 大屏展示: http://localhost:3000/showcase
echo   • 管理系统: http://localhost:3000/admin
echo.
echo 按 Ctrl+C 停止应用
echo.

call pnpm dev

pause
