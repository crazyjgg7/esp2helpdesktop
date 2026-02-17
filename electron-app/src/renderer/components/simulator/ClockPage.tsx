import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface ClockPageProps {
  onBack: () => void;
}

const ClockPage: React.FC<ClockPageProps> = ({ onBack }) => {
  const [time, setTime] = useState(new Date());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = time.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const weekday = time.toLocaleDateString('zh-CN', { weekday: 'long' });

  // Handle long press for back navigation
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onBack();
    }, 800);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: 2,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >

      {/* Time Display */}
      <Typography
        variant="h2"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          fontSize: '3.5rem',
          letterSpacing: '0.1em',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
        }}
      >
        {timeString}
      </Typography>

      {/* Date Display */}
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          mt: 2,
          fontWeight: 'normal',
        }}
      >
        {dateString}
      </Typography>

      {/* Weekday Display */}
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255, 255, 255, 0.6)',
          mt: 1,
        }}
      >
        {weekday}
      </Typography>

      {/* Decorative Circle */}
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          zIndex: 0,
        }}
      />

      {/* Long Press Hint */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: '20px',
          fontSize: '0.65rem',
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'center',
        }}
      >
        长按屏幕返回
      </Typography>
    </Box>
  );
};

export default ClockPage;
