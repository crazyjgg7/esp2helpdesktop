import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  SkipNext,
} from '@mui/icons-material';

interface PomodoroPageProps {
  onBack: () => void;
}

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  totalToday: number;
}

const DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

// For testing: uncomment this to use fast mode
// const DURATIONS = {
//   work: 5, // 5 seconds
//   shortBreak: 3, // 3 seconds
//   longBreak: 8, // 8 seconds
// };

const MODE_CONFIG = {
  work: {
    label: '工作',
    color: '#ff6b6b',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
  },
  shortBreak: {
    label: '短休息',
    color: '#51cf66',
    gradient: 'linear-gradient(135deg, #51cf66 0%, #69db7c 100%)',
  },
  longBreak: {
    label: '长休息',
    color: '#339af0',
    gradient: 'linear-gradient(135deg, #339af0 0%, #4dabf7 100%)',
  },
};

const PomodoroPage: React.FC<PomodoroPageProps> = ({ onBack }) => {
  const [state, setState] = useState<PomodoroState>({
    mode: 'work',
    timeLeft: DURATIONS.work,
    isRunning: false,
    completedPomodoros: 0,
    totalToday: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Debug mode: track click positions (commented out for production)
  // const [clickDebugInfo, setClickDebugInfo] = useState<Array<{
  //   x: number;
  //   y: number;
  //   distance: number;
  //   angle: number;
  //   sector: string | null;
  // }>>([]);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play beep sound
  const playBeep = (frequency: number = 800, duration: number = 200) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + duration / 1000
    );

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Play completion sound
  const playCompletionSound = (isWorkComplete: boolean) => {
    if (isWorkComplete) {
      // Work complete: three ascending beeps
      playBeep(600, 150);
      setTimeout(() => playBeep(800, 150), 200);
      setTimeout(() => playBeep(1000, 200), 400);
    } else {
      // Break complete: two beeps
      playBeep(800, 150);
      setTimeout(() => playBeep(800, 150), 200);
    }
  };

  // Timer logic
  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTimeLeft = prev.timeLeft - 1;

          if (newTimeLeft <= 0) {
            // Timer completed
            handleTimerComplete(prev);
            return prev;
          }

          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRunning, state.timeLeft]);

  const handleTimerComplete = (currentState: PomodoroState) => {
    const isWorkComplete = currentState.mode === 'work';
    playCompletionSound(isWorkComplete);

    let nextMode: PomodoroMode;
    let newCompletedPomodoros = currentState.completedPomodoros;
    let newTotalToday = currentState.totalToday;

    if (isWorkComplete) {
      newCompletedPomodoros += 1;
      newTotalToday += 1;

      // After 4 work sessions, take a long break
      if (newCompletedPomodoros >= 4) {
        nextMode = 'longBreak';
        newCompletedPomodoros = 0;
      } else {
        nextMode = 'shortBreak';
      }
    } else {
      // After break, go back to work
      nextMode = 'work';
    }

    setState({
      mode: nextMode,
      timeLeft: DURATIONS[nextMode],
      isRunning: false,
      completedPomodoros: newCompletedPomodoros,
      totalToday: newTotalToday,
    });
  };

  const handleStartPause = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      timeLeft: DURATIONS[prev.mode],
      isRunning: false,
    }));
  };

  const handleSkip = () => {
    setState((prev) => {
      const isWorkComplete = prev.mode === 'work';
      let nextMode: PomodoroMode;
      let newCompletedPomodoros = prev.completedPomodoros;

      if (isWorkComplete) {
        newCompletedPomodoros += 1;
        nextMode = newCompletedPomodoros >= 4 ? 'longBreak' : 'shortBreak';
        if (newCompletedPomodoros >= 4) {
          newCompletedPomodoros = 0;
        }
      } else {
        nextMode = 'work';
      }

      return {
        mode: nextMode,
        timeLeft: DURATIONS[nextMode],
        isRunning: false,
        completedPomodoros: newCompletedPomodoros,
        totalToday: prev.totalToday,
      };
    });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalDuration = DURATIONS[state.mode];
  const progress = ((totalDuration - state.timeLeft) / totalDuration) * 100;

  // Get next mode info
  const getNextModeInfo = (): string => {
    if (state.mode === 'work') {
      const remaining = 4 - state.completedPomodoros;
      if (remaining === 1) {
        return '下一个: 长休息';
      }
      return `下一个: 短休息 (还需 ${remaining} 个番茄钟)`;
    }
    return '下一个: 工作';
  };

  const currentConfig = MODE_CONFIG[state.mode];
  const circleRadius = 100;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  // Sector interaction state
  const [hoveredSector, setHoveredSector] = useState<'left' | 'center' | 'right' | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Calculate which sector is clicked based on angle
  const getSectorFromAngle = (x: number, y: number): 'left' | 'center' | 'right' | null => {
    // Calculate angle from center, atan2 returns -180 to 180 from right (east)
    // Convert to 0-360 degrees from top (north) clockwise
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Convert to 0-360 from top clockwise

    // Based on actual click data:
    // Right sector (right-bottom): 120-160 degrees
    if (angle >= 120 && angle < 160) {
      return 'right';
    }
    // Center sector (bottom): 160-200 degrees
    if (angle >= 160 && angle < 200) {
      return 'center';
    }
    // Left sector (left-bottom): 200-240 degrees
    if (angle >= 200 && angle < 240) {
      return 'left';
    }
    return null;
  };

  // Handle click on the page
  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y);

    // Calculate angle from center
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;

    const sector = getSectorFromAngle(x, y);

    // Store debug info (commented out for production)
    // setClickDebugInfo(prev => [...prev.slice(-4), { x, y, distance, angle, sector }]);

    // Debug logging (commented out for production)
    // console.log('=== CLICK DEBUG ===');
    // console.log('Position:', { x: x.toFixed(1), y: y.toFixed(1) });
    // console.log('Distance:', distance.toFixed(1));
    // console.log('Angle:', angle.toFixed(1));
    // console.log('Sector:', sector);
    // console.log('==================');

    // Check if click is in the bottom sector area (radius 100-160px)
    if (distance >= 100 && distance <= 160 && sector) {
      if (sector === 'left') {
        // console.log('✓ Reset clicked');
        handleReset();
      } else if (sector === 'center') {
        // console.log('✓ Start/Pause clicked');
        handleStartPause();
      } else if (sector === 'right') {
        // console.log('✓ Skip clicked');
        handleSkip();
      }
    }
    // else {
    //   console.log('✗ Click outside valid range or no sector');
    // }
  };

  // Handle mouse move for hover effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;

    const distance = Math.sqrt(x * x + y * y);

    if (distance >= 100 && distance <= 160) {
      const sector = getSectorFromAngle(x, y);
      setHoveredSector(sector);
    } else {
      setHoveredSector(null);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredSector(null);
  };

  // Handle long press on center for back navigation
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;

    const distance = Math.sqrt(x * x + y * y);

    // Long press on center area (radius < 100px)
    if (distance < 100) {
      const timer = setTimeout(() => {
        onBack();
      }, 800); // 800ms long press
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Create SVG path for sector
  const createSectorPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number): string => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 180 + innerRadius * Math.cos(startAngleRad);
    const y1 = 180 + innerRadius * Math.sin(startAngleRad);
    const x2 = 180 + outerRadius * Math.cos(startAngleRad);
    const y2 = 180 + outerRadius * Math.sin(startAngleRad);
    const x3 = 180 + outerRadius * Math.cos(endAngleRad);
    const y3 = 180 + outerRadius * Math.sin(endAngleRad);
    const x4 = 180 + innerRadius * Math.cos(endAngleRad);
    const y4 = 180 + innerRadius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
  };

  return (
    <Box
      onClick={handlePageClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      sx={{
        width: '100%',
        height: '100%',
        background: currentConfig.gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'background 0.5s ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Top Info Area */}
      <Box
        sx={{
          position: 'absolute',
          top: '15px',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            fontSize: '1.1rem',
          }}
        >
          {currentConfig.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            display: 'block',
            mt: 0.5,
            fontSize: '0.75rem',
          }}
        >
          今日完成: {state.totalToday} 个番茄钟
        </Typography>
      </Box>

      {/* Center Area - Circular Timer */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={circleRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="120"
            cy="120"
            r={circleRadius}
            fill="none"
            stroke="#fff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: state.isRunning ? 'none' : 'stroke-dashoffset 0.3s ease',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
            }}
          />
        </svg>

        {/* Time Display */}
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: '3.5rem',
              lineHeight: 1,
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {formatTime(state.timeLeft)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mt: 1,
              fontSize: '0.7rem',
            }}
          >
            {getNextModeInfo()}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Interaction Area - Sector Buttons */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg width="360" height="180" style={{ position: 'absolute', bottom: 0 }}>
          <defs>
            {/* Gradient for sectors */}
            <linearGradient id="sectorGradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
            </linearGradient>
            <linearGradient id="sectorGradientCenter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
            </linearGradient>
            <linearGradient id="sectorGradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
            </linearGradient>
          </defs>

          {/* Left Sector - Reset (left-bottom) */}
          <path
            d={createSectorPath(200, 240, 100, 140)}
            fill={hoveredSector === 'left' ? 'url(#sectorGradientLeft)' : 'rgba(255, 255, 255, 0.12)'}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            style={{
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
              filter: hoveredSector === 'left' ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3))' : 'none',
            }}
          />
          {/* Center Sector - Start/Pause (bottom) */}
          <path
            d={createSectorPath(160, 200, 100, 140)}
            fill={hoveredSector === 'center' ? 'url(#sectorGradientCenter)' : 'rgba(255, 255, 255, 0.18)'}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
            style={{
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
              filter: hoveredSector === 'center' ? 'drop-shadow(0 2px 12px rgba(255, 255, 255, 0.4))' : 'none',
            }}
          />
          {/* Right Sector - Skip (right-bottom) */}
          <path
            d={createSectorPath(120, 160, 100, 140)}
            fill={hoveredSector === 'right' ? 'url(#sectorGradientRight)' : 'rgba(255, 255, 255, 0.12)'}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            style={{
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
              filter: hoveredSector === 'right' ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3))' : 'none',
            }}
          />
        </svg>

        {/* Sector Icons and Labels */}
        {/* Left Sector - Reset */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '45px',
            left: '65px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            pointerEvents: 'none',
            opacity: state.timeLeft === DURATIONS[state.mode] ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Refresh
            sx={{
              fontSize: 26,
              color: '#fff',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '0.3px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            复位
          </Typography>
        </Box>

        {/* Center Sector - Start/Pause */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '35px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            pointerEvents: 'none',
          }}
        >
          {state.isRunning ? (
            <Pause
              sx={{
                fontSize: 32,
                color: '#fff',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          ) : (
            <PlayArrow
              sx={{
                fontSize: 32,
                color: '#fff',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          )}
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
            }}
          >
            {state.isRunning ? '暂停' : '开始'}
          </Typography>
        </Box>

        {/* Right Sector - Skip */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '45px',
            right: '65px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            pointerEvents: 'none',
          }}
        >
          <SkipNext
            sx={{
              fontSize: 26,
              color: '#fff',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
            }}
          />
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '0.3px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            略过
          </Typography>
        </Box>
      </Box>

      {/* Long Press Hint */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: '150px',
          fontSize: '0.65rem',
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'center',
        }}
      >
        长按中心返回
      </Typography>

      {/* Debug Info Overlay (commented out for production) */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#0f0',
          padding: '8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '10px',
          maxHeight: '120px',
          overflow: 'auto',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🎯 点击调试模式</div>
        {clickDebugInfo.map((info, idx) => (
          <div key={idx} style={{ marginBottom: '2px', opacity: 0.5 + (idx * 0.125) }}>
            #{idx + 1}: x={info.x.toFixed(0)} y={info.y.toFixed(0)} |
            dist={info.distance.toFixed(0)} |
            angle={info.angle.toFixed(0)}° |
            sector={info.sector || 'null'}
          </div>
        ))}
        {clickDebugInfo.length === 0 && (
          <div style={{ opacity: 0.6 }}>点击屏幕任意位置查看坐标...</div>
        )}
      </Box> */}

      {/* Visual Click Markers (commented out for production) */}
      {/* {clickDebugInfo.slice(-3).map((info, idx) => (
        <Box
          key={idx}
          sx={{
            position: 'absolute',
            left: `calc(50% + ${info.x}px)`,
            top: `calc(50% + ${info.y}px)`,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: info.sector === 'left' ? '#ff0' : info.sector === 'center' ? '#0f0' : info.sector === 'right' ? '#f0f' : '#f00',
            border: '2px solid #fff',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: 0.3 + (idx * 0.3),
            zIndex: 1000,
          }}
        />
      ))} */}
    </Box>
  );
};

export default PomodoroPage;
