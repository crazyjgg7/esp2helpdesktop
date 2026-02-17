# 圆形屏幕交互调试指南

**文档版本**: v1.0
**创建日期**: 2026-02-17
**适用场景**: 圆形屏幕扇形按钮、触控区域定位问题

---

## 📋 问题背景

在开发番茄钟页面时，遇到了扇形按钮点击无响应的问题。通过系统化的调试方法，成功定位并解决了角度计算和距离判断的问题。

### 初始问题
- 开始按钮和跳过按钮点击无响应
- 重置按钮显示为灰色（禁用状态）
- 控制台无错误信息

---

## 🔍 调试方法论

### 第一步：关闭干扰日志

**问题**: 系统信息日志（system_info）每秒刷新，淹没了调试信息

**解决方案**:
```typescript
// App.tsx
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // console.log('Received data:', data); // 注释掉

  if (data.type === 'system_info') {
    // 处理逻辑...
  }
};
```

### 第二步：添加可视化调试面板

在页面上显示点击位置的详细信息，而不是只依赖控制台。

**实现代码**:
```typescript
// 添加调试状态
const [clickDebugInfo, setClickDebugInfo] = useState<Array<{
  x: number;
  y: number;
  distance: number;
  angle: number;
  sector: string | null;
}>>([]);

// 在点击处理函数中记录
const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
  // ... 计算坐标、距离、角度

  const sector = getSectorFromAngle(x, y);

  // 存储最近5次点击
  setClickDebugInfo(prev => [...prev.slice(-4), { x, y, distance, angle, sector }]);

  console.log('=== CLICK DEBUG ===');
  console.log('Position:', { x: x.toFixed(1), y: y.toFixed(1) });
  console.log('Distance:', distance.toFixed(1));
  console.log('Angle:', angle.toFixed(1));
  console.log('Sector:', sector);
  console.log('==================');
};
```

**UI 显示**:
```tsx
{/* Debug Info Overlay */}
<Box sx={{
  position: 'absolute',
  top: '50px',
  left: '10px',
  right: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#0f0',
  padding: '8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '10px',
  pointerEvents: 'none',
}}>
  <div style={{ fontWeight: 'bold' }}>🎯 点击调试模式</div>
  {clickDebugInfo.map((info, idx) => (
    <div key={idx}>
      #{idx + 1}: x={info.x.toFixed(0)} y={info.y.toFixed(0)} |
      dist={info.distance.toFixed(0)} |
      angle={info.angle.toFixed(0)}° |
      sector={info.sector || 'null'}
    </div>
  ))}
</Box>
```

### 第三步：添加可视化点击标记

用彩色圆点标记点击位置，不同扇形用不同颜色。

```tsx
{/* Visual Click Markers */}
{clickDebugInfo.slice(-3).map((info, idx) => (
  <Box key={idx} sx={{
    position: 'absolute',
    left: `calc(50% + ${info.x}px)`,
    top: `calc(50% + ${info.y}px)`,
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor:
      info.sector === 'left' ? '#ff0' :    // 黄色 = 左扇形
      info.sector === 'center' ? '#0f0' :  // 绿色 = 中扇形
      info.sector === 'right' ? '#f0f' :   // 紫色 = 右扇形
      '#f00',                              // 红色 = 未识别
    border: '2px solid #fff',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: 0.3 + (idx * 0.3),
    zIndex: 1000,
  }} />
))}
```

---

## 🐛 发现的问题

### 问题 1: 扇形角度定义错误

**实际点击数据**:
```
左下角重置按钮: x=-107.5, y=101.0, angle=226.8° → 识别为 right ❌
正下方开始按钮: x=-0.5,   y=109.0, angle=180.3° → 识别为 center ✅
右下角跳过按钮: x=105.5,  y=105.0, angle=134.9° → 识别为 left ❌
```

**原因分析**:
- 坐标系理解错误：x 为负 = 左侧，x 为正 = 右侧
- 角度转换正确，但扇形范围定义反了

**错误的扇形定义**:
```typescript
// ❌ 错误
if (angle >= 90 && angle < 150) return 'left';    // 实际是右下
if (angle >= 150 && angle < 210) return 'center'; // 正确
if (angle >= 210 && angle < 270) return 'right';  // 实际是左下
```

**正确的扇形定义**:
```typescript
// ✅ 正确（基于实际测量数据）
if (angle >= 120 && angle < 160) return 'right';  // 右下角 (134.9°)
if (angle >= 160 && angle < 200) return 'center'; // 正下方 (180.3°)
if (angle >= 200 && angle < 240) return 'left';   // 左下角 (226.8°)
```

### 问题 2: 触控距离范围过小

**实际点击距离**: 147-149px
**原始判断条件**: `distance >= 100 && distance <= 140`
**结果**: 点击位置超出范围，无法触发

**解决方案**:
```typescript
// 扩大有效触控距离
if (distance >= 100 && distance <= 160 && sector) {
  // 执行操作
}
```

**原因**: 图标位置距离中心约 147-149px，需要更大的触控容差。

---

## ✅ 完整解决方案

### 角度坐标系转换

```typescript
const getSectorFromAngle = (x: number, y: number): 'left' | 'center' | 'right' | null => {
  // atan2 返回 -180 到 180 度（从右侧/东开始）
  // 转换为 0-360 度（从顶部/北开始顺时针）
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  angle = (angle + 90 + 360) % 360;

  // 基于实际测量的扇形范围
  if (angle >= 120 && angle < 160) return 'right';  // 右下角
  if (angle >= 160 && angle < 200) return 'center'; // 正下方
  if (angle >= 200 && angle < 240) return 'left';   // 左下角

  return null;
};
```

### SVG 扇形路径

```typescript
<svg width="360" height="180">
  {/* 左扇形 - 重置 */}
  <path d={createSectorPath(200, 240, 100, 140)} />

  {/* 中扇形 - 开始/暂停 */}
  <path d={createSectorPath(160, 200, 100, 140)} />

  {/* 右扇形 - 跳过 */}
  <path d={createSectorPath(120, 160, 100, 140)} />
</svg>
```

### 点击处理逻辑

```typescript
const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const x = event.clientX - rect.left - centerX;
  const y = event.clientY - rect.top - centerY;

  const distance = Math.sqrt(x * x + y * y);
  const sector = getSectorFromAngle(x, y);

  // 有效触控范围：100-160px
  if (distance >= 100 && distance <= 160 && sector) {
    if (sector === 'left') handleReset();
    else if (sector === 'center') handleStartPause();
    else if (sector === 'right') handleSkip();
  }
};
```

---

## 📊 调试数据参考

### 圆形屏幕坐标系

```
        0° (正上)
         |
         |
270° ----+---- 90°
(正左)   |   (正右)
         |
       180° (正下)
```

### 扇形角度映射

| 位置 | 角度范围 | 实测角度 | 功能 |
|------|---------|---------|------|
| 右下角 | 120-160° | 134.9° | 跳过 |
| 正下方 | 160-200° | 180.3° | 开始/暂停 |
| 左下角 | 200-240° | 226.8° | 重置 |

### 触控距离参考

| 区域 | 距离范围 | 说明 |
|------|---------|------|
| 中心区域 | 0-100px | 长按返回 |
| 扇形按钮 | 100-160px | 有效触控区域 |
| 边缘区域 | 160-180px | 避免放置重要内容 |

---

## 🎯 调试流程总结

1. **关闭干扰日志** - 让调试信息清晰可见
2. **添加可视化面板** - 在屏幕上显示点击数据
3. **添加彩色标记** - 直观显示点击位置和识别结果
4. **收集实际数据** - 点击目标位置，记录坐标和角度
5. **分析数据偏差** - 对比预期和实际值
6. **调整参数** - 根据实测数据修正角度范围和距离阈值
7. **验证修复** - 再次测试确认所有按钮正常工作
8. **注释调试代码** - 保留代码但注释掉，方便未来调试

---

## 💡 经验教训

### 1. 不要靠猜测调试
- ❌ 反复调整参数试错
- ✅ 先收集实际数据，再精确修正

### 2. 可视化是关键
- 控制台日志容易被刷屏
- 屏幕上的调试面板更直观
- 彩色标记能立即看出问题

### 3. 坐标系转换要小心
- `Math.atan2(y, x)` 返回的是数学坐标系角度
- 需要转换为 UI 坐标系（从顶部顺时针）
- 公式：`angle = (atan2_angle + 90 + 360) % 360`

### 4. 触控容差要足够
- 用户不会精确点击图标中心
- 需要留出足够的容差范围
- 建议：图标位置 ±10-20px

### 5. 保留调试代码
- 注释掉而不是删除
- 未来遇到类似问题可以快速启用
- 添加清晰的注释说明用途

---

## 🔧 快速启用调试模式

如果未来需要调试类似的触控问题，取消以下代码的注释：

```typescript
// 1. 添加调试状态
// const [clickDebugInfo, setClickDebugInfo] = useState<Array<...>>([]);

// 2. 在 handlePageClick 中记录数据
// setClickDebugInfo(prev => [...prev.slice(-4), { x, y, distance, angle, sector }]);

// 3. 显示调试面板（在 JSX 中）
// <Box sx={...}>调试信息</Box>

// 4. 显示点击标记（在 JSX 中）
// {clickDebugInfo.map(...)}
```

---

## 📚 相关文档

- [圆形屏幕 UI 设计规范](../design/circular-screen-ui-guidelines.md)
- [项目进度文档](../progress/current-status.md)
- [番茄钟功能实现](../../electron-app/src/renderer/components/simulator/PomodoroPage.tsx)

---

**重要提示**: 这套调试方法适用于所有圆形屏幕的触控交互问题，包括但不限于：
- 扇形按钮定位
- 环形菜单交互
- 圆形手势识别
- 径向布局元素定位
