import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { WatchFaceProps } from '../WatchFaceContainer';
import {
  pixelFlickerAnimation,
  scanlineAnimation,
  borderPulseAnimation,
  pixelDissolveAnimation
} from '../animations/pixelEffects';

/**
 * 像素风格表盘
 * 复古游戏机风格，绿色像素字体
 */
const PixelFace: React.FC<WatchFaceProps> = ({
  mode,
  time,
  stopwatchTime,
  timerRemaining
}) => {
  const [prevTime, setPrevTime] = useState(time);
  const [shouldFlicker, setShouldFlicker] = useState(false);

  // 检测时间变化，触发闪烁效果
  useEffect(() => {
    if (mode === 'clock') {
      const prevSeconds = prevTime.getSeconds();
      const currentSeconds = time.getSeconds();
      if (prevSeconds !== currentSeconds) {
        setShouldFlicker(true);
        setTimeout(() => setShouldFlicker(false), 200);
      }
      setPrevTime(time);
    }
  }, [time, mode, prevTime]);

  // 格式化时间显示
  const getTimeDisplay = () => {
    if (mode === 'stopwatch' && stopwatchTime !== undefined) {
      const totalSeconds = Math.floor(stopwatchTime / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const centiseconds = Math.floor((stopwatchTime % 1000) / 10);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    } else if (mode === 'timer' && timerRemaining !== undefined) {
      const minutes = Math.floor(timerRemaining / 60);
      const seconds = timerRemaining % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return time.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  };

  const getDateDisplay = () => {
    const year = time.getFullYear();
    const month = (time.getMonth() + 1).toString().padStart(2, '0');
    const day = time.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isWarning = mode === 'timer' && timerRemaining !== undefined && timerRemaining <= 10;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1929',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 扫描线效果 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: 'rgba(0, 255, 65, 0.3)',
          animation: `${scanlineAnimation} 3s linear infinite`,
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* 复古边框 */}
      <Box
        sx={{
          position: 'absolute',
          width: '90%',
          height: '85%',
          border: '3px solid #00ff41',
          borderRadius: '8px',
          animation: `${borderPulseAnimation} 2s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />

      {/* 内边框装饰 */}
      <Box
        sx={{
          position: 'absolute',
          width: '85%',
          height: '80%',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          borderRadius: '6px',
          pointerEvents: 'none'
        }}
      />

      {/* 主时间显示 */}
      <Typography
        sx={{
          fontSize: mode === 'stopwatch' ? '2.2rem' : '3rem',
          fontWeight: 'normal',
          color: isWarning ? '#ff3b30' : '#00ff41',
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          letterSpacing: '0.1em',
          textShadow: isWarning
            ? '0 0 20px rgba(255, 59, 48, 0.8), 0 0 40px rgba(255, 59, 48, 0.4)'
            : '0 0 20px rgba(0, 255, 65, 0.8), 0 0 40px rgba(0, 255, 65, 0.4)',
          animation: shouldFlicker ? `${pixelDissolveAnimation} 0.2s ease-out` : 'none',
          transition: 'color 0.3s ease',
          zIndex: 1
        }}
      >
        {getTimeDisplay()}
      </Typography>

      {/* 日期/标签显示 */}
      <Typography
        sx={{
          fontSize: '0.7rem',
          color: 'rgba(0, 255, 65, 0.7)',
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          marginTop: '24px',
          letterSpacing: '0.05em',
          textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
          zIndex: 1
        }}
      >
        {mode === 'clock' ? getDateDisplay() : mode === 'stopwatch' ? 'STOPWATCH' : 'COUNTDOWN'}
      </Typography>

      {/* 星期显示（仅时钟模式） */}
      {mode === 'clock' && (
        <Typography
          sx={{
            fontSize: '0.6rem',
            color: 'rgba(0, 255, 65, 0.5)',
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            marginTop: '8px',
            letterSpacing: '0.05em',
            zIndex: 1
          }}
        >
          {time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
        </Typography>
      )}

      {/* 底部装饰文字 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1
        }}
      >
        <Typography
          sx={{
            fontSize: '0.5rem',
            color: 'rgba(0, 255, 65, 0.4)',
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            letterSpacing: '0.05em',
            animation: `${pixelFlickerAnimation} 2s ease-in-out infinite`
          }}
        >
          ▼ RETRO MODE ▼
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: '4px'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: '4px',
                height: '4px',
                backgroundColor: '#00ff41',
                opacity: 0.3 + (i * 0.1),
                animation: `${pixelFlickerAnimation} ${1 + i * 0.2}s ease-in-out infinite`
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 网格背景效果 */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          opacity: 0.5
        }}
      />
    </Box>
  );
};

export default PixelFace;
