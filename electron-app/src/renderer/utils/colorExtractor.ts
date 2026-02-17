/**
 * 照片颜色提取工具
 * 用于自适应主题从照片中提取主色调
 */

export interface ExtractedColors {
  dominant: string;
  isDark: boolean;
  textColor: string;
  accentColor: string;
}

/**
 * 从图片 URL 提取主色调
 */
export const extractColorsFromImage = async (imageUrl: string): Promise<ExtractedColors> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        // 创建 canvas 来分析图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        // 缩小图片以提高性能
        const size = 50;
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;

        // 计算平均颜色
        let r = 0, g = 0, b = 0;
        const pixelCount = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 4) {
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
        }

        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);

        // 计算亮度 (使用感知亮度公式)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const isDark = brightness < 128;

        // 生成主色调（降低饱和度作为背景）
        const dominant = `rgb(${Math.round(r * 0.3)}, ${Math.round(g * 0.3)}, ${Math.round(b * 0.3)})`;

        // 文字颜色（根据背景亮度）
        const textColor = isDark ? '#ffffff' : '#1a1a1a';

        // 强调色（增强饱和度）
        const accentColor = `rgb(${Math.min(255, Math.round(r * 1.3))}, ${Math.min(255, Math.round(g * 1.3))}, ${Math.min(255, Math.round(b * 1.3))})`;

        resolve({
          dominant,
          isDark,
          textColor,
          accentColor,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    img.src = imageUrl;
  });
};

/**
 * 计算两个颜色之间的对比度
 */
export const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // 简化的亮度计算
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};
