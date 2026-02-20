import React from 'react';
import { Box, Typography } from '@mui/material';
import { WatchFaceProps } from '../WatchFaceContainer';

/**
 * 占位表盘 - 用于测试
 * 后续会被实际表盘替换
 */
const PlaceholderFace: React.FC<WatchFaceProps & { name: string }> = ({ mode, time, stopwatchTime, timerRemaining, name }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        gap: 2
      }}
    >
      <Typography variant="h6" sx={{ color: '#fff', opacity: 0.7 }}>
        {name}
      </Typography>

      {mode === 'clock' && (
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {formatTime(time)}
        </Typography>
      )}

      {mode === 'stopwatch' && stopwatchTime !== undefined && (
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {formatStopwatch(stopwatchTime)}
        </Typography>
      )}

      {mode === 'timer' && timerRemaining !== undefined && (
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {formatTimer(timerRemaining)}
        </Typography>
      )}

      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
        模式: {mode === 'clock' ? '时钟' : mode === 'stopwatch' ? '计时器' : '倒计时'}
      </Typography>
    </Box>
  );
};

export default PlaceholderFace;
