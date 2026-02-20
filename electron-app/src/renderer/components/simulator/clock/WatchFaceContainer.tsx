import React from 'react';
import { Box } from '@mui/material';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture';

export interface WatchFaceProps {
  mode: 'clock' | 'stopwatch' | 'timer';
  time: Date;
  stopwatchTime?: number;
  timerRemaining?: number;
  timerProgress?: number;
}

interface WatchFaceContainerProps {
  faces: React.ComponentType<WatchFaceProps>[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  mode: 'clock' | 'stopwatch' | 'timer';
  time: Date;
  stopwatchTime?: number;
  timerRemaining?: number;
  timerProgress?: number;
  onLongPress?: () => void;
}

/**
 * 表盘容器组件
 * 处理表盘切换和滑动手势
 */
const WatchFaceContainer: React.FC<WatchFaceContainerProps> = ({
  faces,
  currentIndex,
  onIndexChange,
  mode,
  time,
  stopwatchTime,
  timerRemaining,
  timerProgress,
  onLongPress
}) => {
  // 计算前一个和后一个表盘索引
  const prevIndex = (currentIndex - 1 + faces.length) % faces.length;
  const nextIndex = (currentIndex + 1) % faces.length;

  // 滑动手势
  const { dragOffset, isDragging, handlers } = useSwipeGesture({
    threshold: 80,
    onSwipeLeft: () => {
      // 向左滑动，切换到下一个表盘
      onIndexChange(nextIndex);
    },
    onSwipeRight: () => {
      // 向右滑动，切换到上一个表盘
      onIndexChange(prevIndex);
    },
    onLongPress
  });

  // 表盘通用 props
  const faceProps: WatchFaceProps = {
    mode,
    time,
    stopwatchTime,
    timerRemaining,
    timerProgress
  };

  // 当前表盘组件
  const CurrentFace = faces[currentIndex];
  const PrevFace = faces[prevIndex];
  const NextFace = faces[nextIndex];

  return (
    <Box
      {...handlers}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      {/* 前一个表盘（向右滑动时显示） */}
      {dragOffset > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: `${-100 + (dragOffset / 360) * 100}%`,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <PrevFace {...faceProps} />
        </Box>
      )}

      {/* 当前表盘 */}
      <Box
        sx={{
          position: 'absolute',
          left: isDragging ? `${(dragOffset / 360) * 100}%` : '0',
          width: '100%',
          height: '100%',
          transition: isDragging ? 'none' : 'left 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        <CurrentFace {...faceProps} />
      </Box>

      {/* 后一个表盘（向左滑动时显示） */}
      {dragOffset < 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: `${100 + (dragOffset / 360) * 100}%`,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <NextFace {...faceProps} />
        </Box>
      )}
    </Box>
  );
};

export default WatchFaceContainer;
