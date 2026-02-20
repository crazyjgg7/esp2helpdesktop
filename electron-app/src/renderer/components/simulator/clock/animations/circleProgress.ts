/**
 * 计算 SVG 圆环进度
 * 用于运动表盘的圆环动画
 */
export const calculateCircleProgress = (progress: number, radius: number) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return { circumference, offset };
};

/**
 * 生成模拟的运动数据
 */
export const generateMockActivityData = (time: Date) => {
  const hour = time.getHours();

  // 活动进度（根据当前小时）
  const activityProgress = (hour / 24) * 100;

  // 运动进度（随机 + 基于小时）
  const exerciseProgress = Math.min(100, (hour / 24) * 80 + Math.random() * 20);

  // 站立进度（随机 + 基于小时）
  const standProgress = Math.min(100, (hour / 24) * 90 + Math.random() * 10);

  // 心率（70-90 之间波动）
  const heartRate = 70 + Math.floor(Math.random() * 20);

  // 步数（根据小时累积）
  const steps = Math.floor((hour / 24) * 8000 + Math.random() * 2000);

  return {
    activityProgress,
    exerciseProgress,
    standProgress,
    heartRate,
    steps
  };
};
