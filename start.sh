#!/bin/bash

# ESP32 桌面助手 - 快速启动脚本
# 用途：快速启动开发服务器和 Electron 应用

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
ELECTRON_APP_DIR="$PROJECT_ROOT/electron-app"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}ESP32 桌面助手 - 快速启动${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -d "$ELECTRON_APP_DIR" ]; then
    echo -e "${RED}错误: 找不到 electron-app 目录${NC}"
    echo -e "${RED}当前目录: $PROJECT_ROOT${NC}"
    exit 1
fi

# 进入 electron-app 目录
cd "$ELECTRON_APP_DIR"
echo -e "${GREEN}✓ 进入项目目录: $ELECTRON_APP_DIR${NC}"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ 未找到 node_modules，正在安装依赖...${NC}"
    npm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ 未找到 .env 文件${NC}"
    echo -e "${YELLOW}  请确保已配置阿里云语音识别凭证${NC}"
fi

# 检查是否有旧的进程在运行
echo -e "${BLUE}检查是否有旧进程...${NC}"
OLD_PIDS=$(pgrep -f "electron.*electron-app" || true)
if [ ! -z "$OLD_PIDS" ]; then
    echo -e "${YELLOW}⚠ 发现旧的 Electron 进程: $OLD_PIDS${NC}"
    echo -e "${YELLOW}  正在终止...${NC}"
    kill $OLD_PIDS 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓ 旧进程已终止${NC}"
fi

# 编译 TypeScript（如果需要）
if [ ! -d "dist/main" ] || [ "src/main/index.ts" -nt "dist/main/index.js" ]; then
    echo -e "${BLUE}编译 TypeScript...${NC}"
    npm run build
    echo -e "${GREEN}✓ 编译完成${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🚀 启动应用...${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}提示：${NC}"
echo -e "  - Vite 开发服务器: ${BLUE}http://localhost:5173${NC}"
echo -e "  - WebSocket 服务器: ${BLUE}ws://localhost:8765${NC}"
echo -e "  - 按 ${RED}Ctrl+C${NC} 停止应用"
echo ""

# 启动应用
npm start
