import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface CircularScreenProps {
  children: React.ReactNode;
  size?: number;
  onLongPress?: () => void;
}

const CircularScreen: React.FC<CircularScreenProps> = ({ children, size = 360, onLongPress }) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const LONG_PRESS_DURATION = 800;

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onLongPress) return;

    // 只在中心区域触发长按
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
    );

    // 只在中心 30% 区域触发
    if (distance > (size * 0.15)) return;

    setIsLongPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // 进度动画
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setProgress(newProgress);
    }, 16);

    // 长按触发
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(false);
      setProgress(0);
      if (onLongPress) {
        onLongPress();
      }
    }, LONG_PRESS_DURATION);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsLongPressing(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.1)',
        border: '8px solid #1a1a1a',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          clipPath: 'circle(50%)',
          position: 'relative',
        }}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
      >
        {children}

        {/* 长按进度指示器 */}
        {isLongPressing && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 35}
                strokeDashoffset={2 * Math.PI * 35 * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.016s linear' }}
              />
            </svg>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CircularScreen;
