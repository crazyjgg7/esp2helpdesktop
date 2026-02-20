import { keyframes } from '@mui/material';

/**
 * 数字翻页动画
 * 用于极简表盘的数字变化效果
 */
export const flipNumberAnimation = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  50% {
    transform: translateY(-10%);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * 呼吸动画
 * 用于极简表盘的整体呼吸效果
 */
export const breatheAnimation = keyframes`
  0%, 100% {
    opacity: 0.95;
  }
  50% {
    opacity: 1;
  }
`;

/**
 * 淡入缩放动画
 * 用于表盘切换时的过渡效果
 */
export const fadeInScaleAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;
