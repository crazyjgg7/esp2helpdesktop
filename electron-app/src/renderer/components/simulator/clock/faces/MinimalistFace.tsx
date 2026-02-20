import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { WatchFaceProps } from '../WatchFaceContainer';
import { flipNumberAnimation, breatheAnimation } from '../animations/flipNumber';

/**
 * 极简数字表盘
 * 纯白色背景，黑色超大数字
 */
const MinimalistFace: React.FC<WatchFaceProps> = React.memo(({
  mode,
  time,
  stopwatchTime,
  timerRemaining
}) => {
  const [prevTime, setPrevTime] = useState(time);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // 检测时间变化，触发翻页动画
  useEffect(() => {
    if (mode === 'clock') {
      const prevSeconds = prevTime.getSeconds();
      const currentSeconds = time.getSeconds();
      if (prevSeconds !== currentSeconds) {
        setShouldAnimate(true);
        setTimeout(() => setShouldAnimate(false), 300);
      }
      setPrevTime(time);
    }
  }, [time, mode, prevTime]);

  // 格式化时间
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  // 格式化计时器时间
  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return { hours, minutes, seconds, centiseconds };
  };

  // 格式化倒计时时间
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes: mins, seconds: secs };
  };

  // 获取显示内容
  const getDisplayContent = () => {
    if (mode === 'clock') {
      const { hours, minutes, seconds } = formatTime(time);
      return {
        main: `${hours}:${minutes}`,
        sub: seconds,
        label: time.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      };
    } else if (mode === 'stopwatch' && stopwatchTime !== undefined) {
      const { hours, minutes, seconds, centiseconds } = formatStopwatch(stopwatchTime);
      return {
        main: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        sub: `.${centiseconds.toString().padStart(2, '0')}`,
        label: '计时器'
      };
    } else if (mode === 'timer' && timerRemaining !== undefined) {
      const { hours, minutes, seconds } = formatTimer(timerRemaining);
      const isWarning = timerRemaining <= 10 && timerRemaining > 0;
      return {
        main: hours > 0
          ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        sub: '',
        label: '倒计时',
        isWarning
      };
    }
    return { main: '00:00', sub: '', label: '' };
  };

  const { main, sub, label, isWarning } = getDisplayContent();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        position: 'relative',
        animation: `${breatheAnimation} 3s ease-in-out infinite`
      }}
    >
      {/* 主时间显示 */}
      <Typography
        sx={{
          fontSize: mode === 'clock' ? '4.5rem' : '3.5rem',
          fontWeight: 100,
          color: isWarning ? '#f44336' : '#1a1a1a',
          fontFamily: '"SF Pro Display", "Roboto", sans-serif',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          animation: shouldAnimate ? `${flipNumberAnimation} 0.3s ease-out` : 'none',
          transition: 'color 0.3s ease'
        }}
      >
        {main}
      </Typography>

      {/* 副显示（秒数或毫秒） */}
      {sub && (
        <Typography
          sx={{
            fontSize: '2rem',
            fontWeight: 100,
            color: isWarning ? '#f44336' : '#666',
            fontFamily: '"SF Pro Display", "Roboto", sans-serif',
            marginTop: '8px',
            letterSpacing: '-0.01em'
          }}
        >
          {sub}
        </Typography>
      )}

      {/* 日期/标签显示 */}
      <Typography
        sx={{
          fontSize: '0.9rem',
          fontWeight: 400,
          color: '#999',
          marginTop: '24px',
          textAlign: 'center',
          maxWidth: '80%'
        }}
      >
        {label}
      </Typography>

      {/* 装饰性细线 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '60px',
          width: '60px',
          height: '1px',
          backgroundColor: '#e0e0e0'
        }}
      />
    </Box>
  );
});

MinimalistFace.displayName = 'MinimalistFace';

export default MinimalistFace;
