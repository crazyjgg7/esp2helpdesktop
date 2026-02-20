import { useState, useRef, useCallback } from 'react';

interface SwipeGestureHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface UseSwipeGestureReturn {
  dragOffset: number;
  isDragging: boolean;
  handlers: SwipeGestureHandlers;
}

interface UseSwipeGestureOptions {
  threshold?: number;  // 最小滑动距离触发切换（默认 80px）
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  longPressDuration?: number;  // 长按时长（默认 800ms）
}

/**
 * 滑动手势 Hook
 * 复用自 PhotoFramePage 的滑动逻辑
 * 支持鼠标和触摸事件，支持长按检测
 */
export const useSwipeGesture = (options: UseSwipeGestureOptions): UseSwipeGestureReturn => {
  const {
    threshold = 80,
    onSwipeLeft,
    onSwipeRight,
    onLongPress,
    longPressDuration = 800
  } = options;

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除长按计时器
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 启动长按计时器
  const startLongPressTimer = useCallback(() => {
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
      }, longPressDuration);
    }
  }, [onLongPress, longPressDuration]);

  // 鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 忽略按钮点击
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    setIsMouseDown(true);
    setTouchStart({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
    startLongPressTimer();
  }, [startLongPressTimer]);

  // 鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown || !touchStart) return;

    const deltaX = e.clientX - touchStart.x;
    const deltaY = e.clientY - touchStart.y;

    // 只在水平移动占主导时才开始拖拽
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setDragOffset(deltaX);
      clearLongPressTimer();
    }
  }, [isMouseDown, touchStart, clearLongPressTimer]);

  // 鼠标释放
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - (touchStart?.x || 0);

    // 如果拖拽距离超过阈值，触发滑动回调
    if (isDragging && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // 重置状态
    setIsMouseDown(false);
    setTouchStart(null);
    setDragOffset(0);
    setIsDragging(false);
    clearLongPressTimer();
  }, [isMouseDown, touchStart, isDragging, threshold, onSwipeLeft, onSwipeRight, clearLongPressTimer]);

  // 鼠标离开
  const handleMouseLeave = useCallback(() => {
    if (isMouseDown) {
      setIsMouseDown(false);
      setTouchStart(null);
      setDragOffset(0);
      setIsDragging(false);
      clearLongPressTimer();
    }
  }, [isMouseDown, clearLongPressTimer]);

  // 触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 忽略按钮点击
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(false);
    startLongPressTimer();
  }, [startLongPressTimer]);

  // 触摸移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // 只在水平移动占主导时才开始拖拽
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setDragOffset(deltaX);
      clearLongPressTimer();
    }
  }, [touchStart, clearLongPressTimer]);

  // 触摸结束
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;

    // 如果拖拽距离超过阈值，触发滑动回调
    if (isDragging && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // 重置状态
    setTouchStart(null);
    setDragOffset(0);
    setIsDragging(false);
    clearLongPressTimer();
  }, [touchStart, isDragging, threshold, onSwipeLeft, onSwipeRight, clearLongPressTimer]);

  const handlers: SwipeGestureHandlers = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  return {
    dragOffset,
    isDragging,
    handlers
  };
};
