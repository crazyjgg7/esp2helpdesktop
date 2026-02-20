/**
 * 计算指针角度
 */
export const calculateAngles = (time: Date) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  return {
    secondAngle: (seconds / 60) * 360,
    minuteAngle: (minutes / 60) * 360 + (seconds / 60) * 6,
    hourAngle: (hours / 12) * 360 + (minutes / 60) * 30
  };
};

/**
 * 计算计时器的指针角度（秒针快速旋转）
 */
export const calculateStopwatchAngles = (milliseconds: number) => {
  const totalSeconds = milliseconds / 1000;
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 12;

  return {
    secondAngle: (seconds / 60) * 360,
    minuteAngle: (minutes / 60) * 360 + (seconds / 60) * 6,
    hourAngle: (hours / 12) * 360 + (minutes / 60) * 30
  };
};

/**
 * 计算倒计时的指针角度（逆时针）
 */
export const calculateTimerAngles = (remainingSeconds: number, totalSeconds: number) => {
  const progress = remainingSeconds / totalSeconds;
  const angle = progress * 360;

  return {
    secondAngle: angle,
    minuteAngle: angle,
    hourAngle: angle
  };
};
