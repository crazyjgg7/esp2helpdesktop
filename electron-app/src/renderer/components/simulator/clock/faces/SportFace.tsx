import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Favorite, DirectionsWalk } from '@mui/icons-material';
import { WatchFaceProps } from '../WatchFaceContainer';
import { calculateCircleProgress, generateMockActivityData } from '../animations/circleProgress';

/**
 * 运动风格表盘
 * 黑色背景，橙色主题，带圆环进度条
 */
const SportFace: React.FC<WatchFaceProps> = ({
  mode,
  time,
  stopwatchTime,
  timerRemaining,
  timerProgress
}) => {
  const [activityData, setActivityData] = useState(generateMockActivityData(time));

  // 更新模拟数据
  useEffect(() => {
    setActivityData(generateMockActivityData(time));
  }, [time]);

  // 格式化时间显示
  const getTimeDisplay = () => {
    if (mode === 'stopwatch' && stopwatchTime !== undefined) {
      const totalSeconds = Math.floor(stopwatchTime / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (mode === 'timer' && timerRemaining !== undefined) {
      const minutes = Math.floor(timerRemaining / 60);
      const seconds = timerRemaining % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return time.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 圆环配置
  const rings = [
    {
      radius: 120,
      progress: mode === 'stopwatch' && stopwatchTime !== undefined
        ? ((stopwatchTime / 1000) % 60) / 60 * 100  // 计时器：每圈1分钟
        : mode === 'timer' && timerProgress !== undefined
        ? timerProgress  // 倒计时：显示进度
        : activityData.activityProgress,  // 时钟：活动进度
      color: '#ff3b30',
      label: '活动'
    },
    {
      radius: 105,
      progress: mode === 'clock' ? activityData.exerciseProgress : 0,
      color: '#30d158',
      label: '运动'
    },
    {
      radius: 90,
      progress: mode === 'clock' ? activityData.standProgress : 0,
      color: '#0a84ff',
      label: '站立'
    }
  ];

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
        backgroundColor: '#000',
        position: 'relative'
      }}
    >
      {/* SVG 圆环 */}
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        style={{ position: 'absolute' }}
      >
        {rings.map((ring, index) => {
          const { circumference, offset } = calculateCircleProgress(ring.progress, ring.radius);
          return (
            <circle
              key={index}
              cx="140"
              cy="140"
              r={ring.radius}
              fill="none"
              stroke={ring.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 140 140)"
              style={{
                transition: 'stroke-dashoffset 1s ease',
                opacity: ring.progress > 0 ? 1 : 0.2
              }}
            />
          );
        })}
      </svg>

      {/* 中心时间显示 */}
      <Typography
        sx={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          color: isWarning ? '#ff3b30' : '#fff',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          zIndex: 1,
          textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
          transition: 'color 0.3s ease'
        }}
      >
        {getTimeDisplay()}
      </Typography>

      {/* 日期显示（仅时钟模式） */}
      {mode === 'clock' && (
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '8px',
            zIndex: 1
          }}
        >
          {time.toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          })}
        </Typography>
      )}

      {/* 底部数据显示（仅时钟模式） */}
      {mode === 'clock' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            gap: '32px',
            zIndex: 1
          }}
        >
          {/* 心率 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Favorite
                sx={{
                  fontSize: '16px',
                  color: '#ff3b30',
                  animation: 'pulse 1s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' }
                  }
                }}
              />
              <Typography
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#ff3b30'
                }}
              >
                {activityData.heartRate}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              BPM
            </Typography>
          </Box>

          {/* 步数 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DirectionsWalk
                sx={{
                  fontSize: '16px',
                  color: '#30d158'
                }}
              />
              <Typography
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#30d158'
                }}
              >
                {activityData.steps.toLocaleString()}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '0.65rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              步
            </Typography>
          </Box>
        </Box>
      )}

      {/* 模式标签（计时器/倒计时模式） */}
      {mode !== 'clock' && (
        <Typography
          sx={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.6)',
            zIndex: 1
          }}
        >
          {mode === 'stopwatch' ? '计时器' : '倒计时'}
        </Typography>
      )}
    </Box>
  );
};

export default SportFace;
