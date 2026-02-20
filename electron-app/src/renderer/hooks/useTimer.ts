import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerReturn {
  remaining: number;         // 剩余秒数
  isRunning: boolean;
  progress: number;          // 进度百分比 (0-100)
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDuration: (seconds: number) => void;
  startWithDuration: (seconds: number) => void;  // 设置时长并立即开始
}

interface UseTimerOptions {
  initialDuration?: number;  // 初始时长（秒），默认 60
  onComplete?: () => void;   // 倒计时结束回调
}

/**
 * 倒计时 Hook
 * 使用 setInterval 实现秒级倒计时
 */
export const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
  const { initialDuration = 60, onComplete } = options;

  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // 更新 onComplete 引用
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 计算进度百分比
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  // 开始倒计时
  const start = useCallback(() => {
    if (remaining <= 0) return;
    setIsRunning(true);
  }, [remaining]);

  // 暂停倒计时
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 重置倒计时
  const reset = useCallback(() => {
    setRemaining(duration);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  // 设置倒计时时长
  const setDurationCallback = useCallback((seconds: number) => {
    setDuration(seconds);
    setRemaining(seconds);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 设置时长并立即开始
  const startWithDuration = useCallback((seconds: number) => {
    setDuration(seconds);
    setRemaining(seconds);
    setIsRunning(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 倒计时循环
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            // 倒计时结束
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    remaining,
    isRunning,
    progress,
    start,
    pause,
    reset,
    setDuration: setDurationCallback,
    startWithDuration
  };
};
