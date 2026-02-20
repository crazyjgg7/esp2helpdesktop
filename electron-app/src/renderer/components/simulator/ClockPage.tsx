import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import WatchFaceContainer from './clock/WatchFaceContainer';
import ModeSelector from './clock/ModeSelector';
import StopwatchControls from './clock/modes/StopwatchControls';
import TimerControls from './clock/modes/TimerControls';
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
  const timer = useTimer({
    initialDuration: 60,
    onComplete: () => {
      // 倒计时结束处理
      console.log('倒计时结束！');
      // TODO: 添加震动和闪烁效果
    }
  });

  // 加载保存的状态
  useEffect(() => {
    const saved = localStorage.getItem('clockSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.lastWatchFace !== undefined) {
          setCurrentFaceIndex(settings.lastWatchFace);
        }
        if (settings.lastMode) {
          setCurrentMode(settings.lastMode);
        }
      } catch (error) {
        console.error('加载时钟设置失败:', error);
      }
    }
  }, []);

  // 保存状态
  useEffect(() => {
    const settings = {
      lastWatchFace: currentFaceIndex,
      lastMode: currentMode,
      timerPresets: [60, 180, 300, 600]
    };
    localStorage.setItem('clockSettings', JSON.stringify(settings));
  }, [currentFaceIndex, currentMode]);

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

      {/* 计时器控制按钮 */}
      {currentMode === 'stopwatch' && (
        <StopwatchControls
          isRunning={stopwatch.isRunning}
          onStart={stopwatch.start}
          onPause={stopwatch.pause}
          onReset={stopwatch.reset}
        />
      )}

      {/* 倒计时控制按钮 */}
      {currentMode === 'timer' && (
        <TimerControls
          isRunning={timer.isRunning}
          remaining={timer.remaining}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onSetDuration={timer.setDuration}
        />
      )}
    </Box>
  );
};

export default ClockPage;
