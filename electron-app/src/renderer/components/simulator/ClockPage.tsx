import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import WatchFaceContainer from './clock/WatchFaceContainer';
import ModeSelector from './clock/ModeSelector';
import MinimalistFace from './clock/faces/MinimalistFace';
import AnalogFace from './clock/faces/AnalogFace';
import SportFace from './clock/faces/SportFace';
import PixelFace from './clock/faces/PixelFace';
import { useStopwatch } from '../../hooks/useStopwatch';
import { useTimer } from '../../hooks/useTimer';

interface ClockPageProps {
  onBack: () => void;
}

const ClockPage: React.FC<ClockPageProps> = ({ onBack }) => {
  const [time, setTime] = useState(new Date());
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<'clock' | 'stopwatch' | 'timer'>('clock');

  // 计时器和倒计时 hooks
  const stopwatch = useStopwatch();
  const timer = useTimer({ initialDuration: 60 });

  // 更新时间
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 4 个真实表盘
  const watchFaces = [
    MinimalistFace,  // 极简数字表盘
    AnalogFace,      // 模拟指针表盘
    SportFace,       // 运动风格表盘
    PixelFace        // 像素风格表盘
  ];

  // 长按返回处理
  const handleLongPress = () => {
    // 如果计时器或倒计时正在运行，暂时直接返回（后续会添加确认对话框）
    if (currentMode !== 'clock' && (stopwatch.isRunning || timer.isRunning)) {
      // TODO: 显示确认对话框
      console.log('计时器正在运行，是否确定返回？');
    }
    onBack();
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}
    >
      {/* 表盘容器 */}
      <WatchFaceContainer
        faces={watchFaces}
        currentIndex={currentFaceIndex}
        onIndexChange={setCurrentFaceIndex}
        mode={currentMode}
        time={time}
        stopwatchTime={stopwatch.time}
        timerRemaining={timer.remaining}
        timerProgress={timer.progress}
        onLongPress={handleLongPress}
      />

      {/* 模式切换器 */}
      <ModeSelector
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* 临时控制按钮（用于测试计时器功能） */}
      {currentMode === 'stopwatch' && (
        <Box
          sx={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 100
          }}
        >
          <button onClick={stopwatch.start}>开始</button>
          <button onClick={stopwatch.pause}>暂停</button>
          <button onClick={stopwatch.reset}>重置</button>
        </Box>
      )}

      {currentMode === 'timer' && (
        <Box
          sx={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 100
          }}
        >
          <button onClick={timer.start}>开始</button>
          <button onClick={timer.pause}>暂停</button>
          <button onClick={timer.reset}>重置</button>
          <button onClick={() => timer.setDuration(60)}>1分钟</button>
          <button onClick={() => timer.setDuration(180)}>3分钟</button>
        </Box>
      )}
    </Box>
  );
};

export default ClockPage;
