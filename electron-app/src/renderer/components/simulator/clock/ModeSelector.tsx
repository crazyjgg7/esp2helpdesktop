import React from 'react';
import { Box, IconButton } from '@mui/material';
import { AccessTime, Timer, HourglassEmpty } from '@mui/icons-material';

interface ModeSelectorProps {
  currentMode: 'clock' | 'stopwatch' | 'timer';
  onModeChange: (mode: 'clock' | 'stopwatch' | 'timer') => void;
}

/**
 * 模式切换器组件
 * 底部三个按钮：时钟、计时器、倒计时
 */
const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { key: 'clock' as const, icon: <AccessTime />, label: '时钟' },
    { key: 'stopwatch' as const, icon: <Timer />, label: '计时器' },
    { key: 'timer' as const, icon: <HourglassEmpty />, label: '倒计时' }
  ];

  return (
    <Box
      className="mode-selector"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      sx={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 100
      }}
    >
      {modes.map((mode) => (
        <IconButton
          key={mode.key}
          onClick={() => onModeChange(mode.key)}
          sx={{
            width: 44,
            height: 44,
            color: currentMode === mode.key ? '#ff9800' : 'rgba(255, 255, 255, 0.7)',
            backgroundColor: currentMode === mode.key ? 'rgba(255, 152, 0, 0.2)' : 'transparent',
            border: currentMode === mode.key ? '2px solid #ff9800' : '2px solid transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: currentMode === mode.key
                ? 'rgba(255, 152, 0, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.1)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          {mode.icon}
        </IconButton>
      ))}
    </Box>
  );
};

export default ModeSelector;
