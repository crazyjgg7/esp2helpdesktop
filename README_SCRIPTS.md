# 快速启动脚本使用说明

## 📦 脚本列表

### 1. `start.sh` - 快速启动应用

**功能**：
- ✅ 自动检查并安装依赖
- ✅ 检查并终止旧进程
- ✅ 编译 TypeScript（如果需要）
- ✅ 启动 Vite 开发服务器 + Electron 应用

**使用方法**：
```bash
# 方法 1：直接运行
./start.sh

# 方法 2：使用 bash
bash start.sh

# 方法 3：从任意目录运行
/Users/apple/esp2helpdesktop/start.sh
```

### 2. `stop.sh` - 停止应用

**功能**：
- ✅ 终止所有 Electron 进程
- ✅ 终止所有 Vite 进程
- ✅ 终止所有相关 Node 进程
- ✅ 强制清理残留进程

**使用方法**：
```bash
# 方法 1：直接运行
./stop.sh

# 方法 2：使用 bash
bash stop.sh
```

## 🚀 快速开始

### 首次使用
```bash
cd /Users/apple/esp2helpdesktop
./start.sh
```

### 日常使用
```bash
# 启动应用
./start.sh

# 停止应用（在另一个终端）
./stop.sh
```

## 📝 注意事项

1. **环境变量配置**
   - 确保 `electron-app/.env` 文件已配置阿里云凭证
   - 参考 `docs/VOICE_SETUP.md` 进行配置

2. **端口占用**
   - Vite: `http://localhost:5173`
   - WebSocket: `ws://localhost:8765`
   - 如果端口被占用，脚本会自动终止旧进程

3. **停止应用**
   - 按 `Ctrl+C` 可以停止应用
   - 或使用 `./stop.sh` 脚本

4. **权限问题**
   - 如果提示权限不足，运行：
     ```bash
     chmod +x start.sh stop.sh
     ```

## 🔧 故障排除

### 问题：脚本无法执行
```bash
# 解决方案：添加执行权限
chmod +x start.sh stop.sh
```

### 问题：端口被占用
```bash
# 解决方案：先停止旧进程
./stop.sh
# 然后重新启动
./start.sh
```

### 问题：编译失败
```bash
# 解决方案：重新安装依赖
cd electron-app
rm -rf node_modules package-lock.json
npm install
cd ..
./start.sh
```

## 📚 相关文档

- [语音功能配置](docs/VOICE_SETUP.md)
- [项目进度](docs/progress/current-status.md)
- [开发文档](docs/README.md)

## 💡 提示

- 脚本会自动检测并编译 TypeScript 代码
- 首次运行可能需要较长时间（安装依赖 + 编译）
- 后续运行会更快（跳过已完成的步骤）
- 使用 `stop.sh` 可以确保所有进程都被正确终止
