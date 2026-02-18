#!/bin/bash

# ESP32 桌面助手 - 停止脚本
# 用途：停止所有相关进程

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}ESP32 桌面助手 - 停止应用${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 查找并终止 Electron 进程
echo -e "${BLUE}查找 Electron 进程...${NC}"
ELECTRON_PIDS=$(pgrep -f "electron.*electron-app" || true)

if [ -z "$ELECTRON_PIDS" ]; then
    echo -e "${YELLOW}⚠ 未找到运行中的 Electron 进程${NC}"
else
    echo -e "${YELLOW}发现进程: $ELECTRON_PIDS${NC}"
    echo -e "${BLUE}正在终止...${NC}"
    kill $ELECTRON_PIDS 2>/dev/null || true
    sleep 1
    
    # 检查是否还有残留进程
    REMAINING=$(pgrep -f "electron.*electron-app" || true)
    if [ ! -z "$REMAINING" ]; then
        echo -e "${RED}强制终止残留进程...${NC}"
        kill -9 $REMAINING 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✓ Electron 进程已终止${NC}"
fi

# 查找并终止 Vite 进程
echo -e "${BLUE}查找 Vite 进程...${NC}"
VITE_PIDS=$(pgrep -f "vite.*electron-app" || true)

if [ -z "$VITE_PIDS" ]; then
    echo -e "${YELLOW}⚠ 未找到运行中的 Vite 进程${NC}"
else
    echo -e "${YELLOW}发现进程: $VITE_PIDS${NC}"
    echo -e "${BLUE}正在终止...${NC}"
    kill $VITE_PIDS 2>/dev/null || true
    echo -e "${GREEN}✓ Vite 进程已终止${NC}"
fi

# 查找并终止 Node 进程（npm start）
echo -e "${BLUE}查找 Node 进程...${NC}"
NODE_PIDS=$(pgrep -f "node.*electron-app" || true)

if [ -z "$NODE_PIDS" ]; then
    echo -e "${YELLOW}⚠ 未找到运行中的 Node 进程${NC}"
else
    echo -e "${YELLOW}发现进程: $NODE_PIDS${NC}"
    echo -e "${BLUE}正在终止...${NC}"
    kill $NODE_PIDS 2>/dev/null || true
    echo -e "${GREEN}✓ Node 进程已终止${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ 所有进程已停止${NC}"
echo -e "${GREEN}================================${NC}"
