import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  VolumeUp,
  Brightness6,
  Wifi,
  Battery80,
  VolumeOff,
  WifiOff,
} from '@mui/icons-material';

interface QuickSettingsPageProps {
  onBack: () => void;
}

const QuickSettingsPage: React.FC<QuickSettingsPageProps> = ({ onBack }) => {
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(70);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);

  // 圆形滑动条的拖拽状态
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isDraggingBrightness, setIsDraggingBrightness] = useState(false);

  // 计算圆形滑动条的角度
  const calculateAngle = (centerX: number, centerY: number, x: number, y: number) => {
    const dx = x - centerX;
    const dy = y - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // 转换为从顶部开始的角度
    return angle;
  };

  // 处理圆形滑动条拖拽
  const handleCircularDrag = (
    e: React.MouseEvent | React.TouchEvent,
    setter: (value: number) => void,
    isDragging: boolean
  ) => {
    if (!isDragging) return;

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

    const angle = calculateAngle(centerX, centerY, clientX, clientY);
    const value = Math.round((angle / 360) * 100);
    setter(Math.max(0, Math.min(100, value)));
  };

  // 圆形进度条组件
  const CircularSlider = ({
    value,
    icon: Icon,
    label,
    color,
    onDragStart,
    onDragEnd,
    isDragging,
  }: {
    value: number;
    icon: any;
    label: string;
    color: string;
    onDragStart: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
  }) => {
    const radius = 50;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onMouseMove={(e) => {
            if (isDragging) {
              const target = e.currentTarget;
              const rect = target.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const angle = calculateAngle(centerX, centerY, e.clientX, e.clientY);
              const newValue = Math.round((angle / 360) * 100);
              if (label === '音量') {
                setVolume(Math.max(0, Math.min(100, newValue)));
              } else if (label === '亮度') {
                setBrightness(Math.max(0, Math.min(100, newValue)));
              }
            }
          }}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          onTouchMove={(e) => {
            if (isDragging && e.touches.length > 0) {
              const target = e.currentTarget;
              const rect = target.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const touch = e.touches[0];
              const angle = calculateAngle(centerX, centerY, touch.clientX, touch.clientY);
              const newValue = Math.round((angle / 360) * 100);
              if (label === '音量') {
                setVolume(Math.max(0, Math.min(100, newValue)));
              } else if (label === '亮度') {
                setBrightness(Math.max(0, Math.min(100, newValue)));
              }
            }
          }}
        >
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            {/* 背景圆环 */}
            <circle
              stroke="rgba(255, 255, 255, 0.1)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={60}
              cy={60}
            />
            {/* 进度圆环 */}
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={60}
              cy={60}
              style={{
                transition: isDragging ? 'none' : 'stroke-dashoffset 0.3s ease',
              }}
            />
          </svg>
          {/* 中心图标和数值 */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Icon sx={{ fontSize: 32, color }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {value}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {label}
        </Typography>
      </Box>
    );
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
        gap: 2,
        padding: 2,
      }}
    >
      {/* 标题 */}
      <Typography
        variant="body1"
        sx={{
          color: '#fff',
          fontWeight: 600,
          marginBottom: 0,
        }}
      >
        快捷设置
      </Typography>

      {/* 圆形滑动条区域 */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 音量控制 */}
        <CircularSlider
          value={volume}
          icon={volume === 0 ? VolumeOff : VolumeUp}
          label="音量"
          color="#1976d2"
          onDragStart={() => setIsDraggingVolume(true)}
          onDragEnd={() => setIsDraggingVolume(false)}
          isDragging={isDraggingVolume}
        />

        {/* 亮度控制 */}
        <CircularSlider
          value={brightness}
          icon={Brightness6}
          label="亮度"
          color="#ff9800"
          onDragStart={() => setIsDraggingBrightness(true)}
          onDragEnd={() => setIsDraggingBrightness(false)}
          isDragging={isDraggingBrightness}
        />
      </Box>

      {/* 开关和信息区域 */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 0,
        }}
      >
        {/* WiFi 开关 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            padding: 1.5,
            paddingTop: 1,
            paddingBottom: 1,
            borderRadius: 2,
            backgroundColor: wifiEnabled
              ? 'rgba(76, 175, 80, 0.2)'
              : 'rgba(255, 255, 255, 0.1)',
            border: wifiEnabled ? '2px solid #4caf50' : '2px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            minWidth: 70,
            '&:hover': {
              backgroundColor: wifiEnabled
                ? 'rgba(76, 175, 80, 0.3)'
                : 'rgba(255, 255, 255, 0.15)',
            },
          }}
          onClick={() => setWifiEnabled(!wifiEnabled)}
        >
          {wifiEnabled ? (
            <Wifi sx={{ fontSize: 32, color: '#4caf50' }} />
          ) : (
            <WifiOff sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.5)' }} />
          )}
          <Typography
            variant="caption"
            sx={{
              color: wifiEnabled ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem',
            }}
          >
            WiFi
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: wifiEnabled ? '#4caf50' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.65rem',
            }}
          >
            {wifiEnabled ? '已连接' : '已关闭'}
          </Typography>
        </Box>

        {/* 电源信息 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            padding: 1.5,
            paddingTop: 1,
            paddingBottom: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            minWidth: 70,
          }}
        >
          <Battery80
            sx={{
              fontSize: 32,
              color: batteryLevel > 20 ? '#4caf50' : '#f44336',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem',
            }}
          >
            电量
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: batteryLevel > 20 ? '#4caf50' : '#f44336',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            {batteryLevel}%
          </Typography>
          {isCharging && (
            <Typography
              variant="caption"
              sx={{
                color: '#4caf50',
                fontSize: '0.6rem',
                marginTop: -0.5,
              }}
            >
              充电中
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default QuickSettingsPage;
