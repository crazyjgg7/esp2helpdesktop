import { keyframes } from '@mui/material';

/**
 * 像素闪烁动画
 */
export const pixelFlickerAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
`;

/**
 * 扫描线动画
 */
export const scanlineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

/**
 * 边框呼吸动画
 */
export const borderPulseAnimation = keyframes`
  0%, 100% {
    borderColor: #00ff41;
    boxShadow: 0 0 10px rgba(0, 255, 65, 0.5);
  }
  50% {
    borderColor: #00aa2b;
    boxShadow: 0 0 20px rgba(0, 255, 65, 0.8);
  }
`;

/**
 * 像素溶解效果（用于数字变化）
 */
export const pixelDissolveAnimation = keyframes`
  0% {
    opacity: 1;
    filter: blur(0px);
  }
  50% {
    opacity: 0.5;
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
  }
`;
