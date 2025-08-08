@echo off
setlocal enabledelayedexpansion

REM PM2 自动构建启动脚本 (Windows版)
REM 用法: scripts\start-pm2.bat [development|production]

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo 🚀 开始自动构建和部署流程...
echo 📋 环境: %ENVIRONMENT%

REM 1. 拉取最新代码
echo 📥 拉取最新代码...
git pull
if %ERRORLEVEL% neq 0 (
    echo ❌ Git pull 失败
    exit /b 1
)

REM 2. 安装依赖
echo 📦 安装依赖...
pnpm install
if %ERRORLEVEL% neq 0 (
    echo ❌ 依赖安装失败
    exit /b 1
)

REM 3. 构建项目
echo 🔨 构建项目...
pnpm build
if %ERRORLEVEL% neq 0 (
    echo ❌ 项目构建失败
    exit /b 1
)

REM 4. 检查dist目录是否存在
if not exist "dist\src\main.js" (
    echo ❌ 构建失败: dist\src\main.js 不存在
    exit /b 1
)

REM 5. 创建必要的目录
if not exist "logs" mkdir logs
if not exist "pids" mkdir pids

REM 6. 停止已运行的PM2进程（如果存在）
echo 🛑 停止已存在的PM2进程...
pm2 delete admin-nestjs >nul 2>&1 || echo 没有找到已运行的进程

REM 7. 启动PM2
echo 🎯 启动PM2进程...
if "%ENVIRONMENT%"=="development" (
    pm2 start ecosystem.config.js --env development
) else (
    pm2 start ecosystem.config.js --env production
)

if %ERRORLEVEL% neq 0 (
    echo ❌ PM2 启动失败
    exit /b 1
)

REM 8. 显示PM2状态
echo 📊 PM2状态:
pm2 list

echo ✅ 启动完成！
echo 📝 查看日志: pm2 logs admin-nestjs
echo 📊 查看状态: pm2 status
echo 🔄 重启应用: pm2 restart admin-nestjs

pause 