import { useState, useRef, useCallback, useEffect } from 'react';

interface UseStopwatchReturn {
  time: number;              // 毫秒
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formatTime: () => string;  // 格式化为 00:00:00.00
}

/**
 * 计时器 Hook
 * 使用 requestAnimationFrame 获得精确计时
 */
export const useStopwatch = (): UseStopwatchReturn => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // 计时循环
  const tick = useCallback(() => {
    setTime(Date.now() - startTimeRef.current);
    animationFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // 开始计时
  const start = useCallback(() => {
    startTimeRef.current = Date.now() - time;
    setIsRunning(true);
  }, [time]);

  // 暂停计时
  const pause = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // 重置计时
  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // 格式化时间为 00:00:00.00
  const formatTime = useCallback((): string => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((time % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, [time]);

  // 当 isRunning 变化时，启动或停止动画循环
  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, tick]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    formatTime
  };
};
