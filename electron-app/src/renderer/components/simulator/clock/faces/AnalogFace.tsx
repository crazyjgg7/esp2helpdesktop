import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { WatchFaceProps } from '../WatchFaceContainer';
import { calculateAngles, calculateStopwatchAngles } from '../animations/analogClock';

/**
 * 模拟指针表盘
 * 传统圆形时钟，带时针、分针、秒针
 */
const AnalogFace: React.FC<WatchFaceProps> = React.memo(({
  mode,
  time,
  stopwatchTime,
  timerRemaining,
  timerProgress
}) => {
  // 计算指针角度（使用 useMemo 避免重复计算）
  const angles = useMemo(() => {
    if (mode === 'stopwatch' && stopwatchTime !== undefined) {
      return calculateStopwatchAngles(stopwatchTime);
    } else if (mode === 'timer' && timerRemaining !== undefined) {
      const angle = timerProgress ? (timerProgress / 100) * 360 : 0;
      return { secondAngle: angle, minuteAngle: angle, hourAngle: angle };
    } else {
      return calculateAngles(time);
    }
  }, [mode, time, stopwatchTime, timerRemaining, timerProgress]);

  const { secondAngle, minuteAngle, hourAngle } = angles;

  // 刻度点
  const hourMarks = Array.from({ length: 12 }, (_, i) => i);
  const minuteMarks = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        position: 'relative'
      }}
    >
      {/* 表盘容器 */}
      <Box
        sx={{
          position: 'relative',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* 小时刻度 */}
        {hourMarks.map((hour) => {
          const angle = (hour * 30 * Math.PI) / 180;
          const isMainMark = hour % 3 === 0;
          const radius = 130;
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius;

          return (
            <Box
              key={`hour-${hour}`}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: isMainMark ? '4px' : '2px',
                height: isMainMark ? '16px' : '12px',
                backgroundColor: isMainMark ? '#ffd700' : 'rgba(255, 255, 255, 0.6)',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${hour * 30}deg)`,
                transformOrigin: 'center',
                borderRadius: '2px',
                boxShadow: isMainMark ? '0 0 8px rgba(255, 215, 0, 0.6)' : 'none'
              }}
            />
          );
        })}

        {/* 分钟刻度（细小） */}
        {minuteMarks.map((minute) => {
          if (minute % 5 === 0) return null; // 跳过小时刻度位置
          const angle = (minute * 6 * Math.PI) / 180;
          const radius = 132;
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius;

          return (
            <Box
              key={`minute-${minute}`}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '1px',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${minute * 6}deg)`,
                transformOrigin: 'center'
              }}
            />
          );
        })}

        {/* 时针 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '6px',
            height: '70px',
            backgroundColor: '#fff',
            transformOrigin: 'center bottom',
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            borderRadius: '3px 3px 0 0',
            transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            zIndex: 2
          }}
        />

        {/* 分针 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '4px',
            height: '100px',
            backgroundColor: '#fff',
            transformOrigin: 'center bottom',
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            borderRadius: '2px 2px 0 0',
            transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
            zIndex: 3
          }}
        />

        {/* 秒针 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '2px',
            height: '120px',
            backgroundColor: mode === 'timer' && timerRemaining && timerRemaining <= 10 ? '#f44336' : '#ffd700',
            transformOrigin: 'center bottom',
            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
            borderRadius: '1px 1px 0 0',
            transition: mode === 'stopwatch'
              ? 'none'
              : 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
            zIndex: 4
          }}
        />

        {/* 中心圆点 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '16px',
            height: '16px',
            backgroundColor: '#ffd700',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid #1a1a2e',
            boxShadow: '0 0 16px rgba(255, 215, 0, 0.8)',
            zIndex: 5
          }}
        />

        {/* 外圈装饰 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />
      </Box>
    </Box>
  );
});

AnalogFace.displayName = 'AnalogFace';

export default AnalogFace;
