/**
 * 电子相框主题配置
 * 三种独特的视觉主题：暗夜美术馆、晨光画廊、智能自适应
 */

export interface PhotoTheme {
  name: string;
  displayName: string;
  colors: {
    background: string;
    overlay: string;
    controlBar: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    border: string;
  };
  typography: {
    photoName: {
      fontFamily: string;
      fontSize: string;
      fontWeight: number;
      letterSpacing: string;
      textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    };
    counter: {
      fontFamily: string;
      fontSize: string;
      fontWeight: number;
      letterSpacing: string;
    };
    hint: {
      fontFamily: string;
      fontSize: string;
      fontWeight: number;
      letterSpacing: string;
      fontStyle?: 'normal' | 'italic';
    };
  };
  effects: {
    controlBarBlur: string;
    controlBarBorder: string;
    controlBarShadow?: string;
    photoTransition: string;
    dragTransition: string;
    buttonHoverScale: number;
    iconGlow: string;
    backgroundTransition?: string;
  };
  layout: {
    controlBarPadding: string;
    controlBarRadius: string;
    controlBarBottom: string;
    infoTop: string;
    buttonSize: string;
    iconSize: string;
  };
  adaptive?: {
    enabled: boolean;
    extractColors: boolean;
    contrastThreshold: number;
    saturationBoost: number;
  };
}

// 主题 1: 暗夜美术馆 - 奢华精致的博物馆级展示
export const darkGalleryTheme: PhotoTheme = {
  name: 'dark-gallery',
  displayName: '暗夜美术馆',

  colors: {
    background: '#0a0a0a',
    overlay: 'rgba(0, 0, 0, 0.85)',
    controlBar: 'rgba(20, 20, 20, 0.75)',
    text: '#f5f5f5',
    textSecondary: '#b8b8b8',
    accent: '#d4af37', // 金色
    accentHover: '#f0c952',
    border: 'rgba(212, 175, 55, 0.2)',
  },

  typography: {
    photoName: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontSize: '0.85rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'none',
    },
    counter: {
      fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
      fontSize: '0.7rem',
      fontWeight: 400,
      letterSpacing: '1px',
    },
    hint: {
      fontFamily: '"Crimson Text", "Noto Serif SC", serif',
      fontSize: '0.6rem',
      fontWeight: 300,
      letterSpacing: '0.3px',
      fontStyle: 'italic',
    },
  },

  effects: {
    controlBarBlur: '20px',
    controlBarBorder: '1px solid rgba(212, 175, 55, 0.15)',
    photoTransition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    dragTransition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    buttonHoverScale: 1.15,
    iconGlow: '0 0 12px rgba(212, 175, 55, 0.4)',
  },

  layout: {
    controlBarPadding: '8px 16px',
    controlBarRadius: '28px',
    controlBarBottom: '20px',
    infoTop: '16px',
    buttonSize: '44px',
    iconSize: '1.1rem',
  },
};

// 主题 2: 晨光画廊 - 清新明亮的北欧极简
export const lightGalleryTheme: PhotoTheme = {
  name: 'light-gallery',
  displayName: '晨光画廊',

  colors: {
    background: '#fafafa',
    overlay: 'rgba(255, 255, 255, 0.92)',
    controlBar: 'rgba(255, 255, 255, 0.85)',
    text: '#1a1a1a',
    textSecondary: '#666666',
    accent: '#2563eb', // 清爽蓝
    accentHover: '#1d4ed8',
    border: 'rgba(37, 99, 235, 0.15)',
  },

  typography: {
    photoName: {
      fontFamily: '"DM Sans", "PingFang SC", sans-serif',
      fontSize: '0.8rem',
      fontWeight: 600,
      letterSpacing: '-0.2px',
      textTransform: 'none',
    },
    counter: {
      fontFamily: '"JetBrains Mono", "SF Mono", monospace',
      fontSize: '0.65rem',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    hint: {
      fontFamily: '"DM Sans", "PingFang SC", sans-serif',
      fontSize: '0.6rem',
      fontWeight: 400,
      letterSpacing: '0.3px',
    },
  },

  effects: {
    controlBarBlur: '16px',
    controlBarBorder: 'none',
    controlBarShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
    photoTransition: 'opacity 0.5s ease-out',
    dragTransition: 'left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    buttonHoverScale: 1.08,
    iconGlow: 'none',
  },

  layout: {
    controlBarPadding: '6px 14px',
    controlBarRadius: '24px',
    controlBarBottom: '18px',
    infoTop: '14px',
    buttonSize: '40px',
    iconSize: '1rem',
  },
};

// 主题 3: 智能自适应 - 科技感的动态主题
export const adaptiveTheme: PhotoTheme = {
  name: 'adaptive',
  displayName: '智能自适应',

  // 默认值，会根据照片动态调整
  colors: {
    background: '#1a1a1a',
    overlay: 'rgba(0, 0, 0, 0.7)',
    controlBar: 'rgba(30, 30, 30, 0.8)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    accent: '#00d9ff', // 科技蓝
    accentHover: '#00b8d4',
    border: 'rgba(0, 217, 255, 0.3)',
  },

  typography: {
    photoName: {
      fontFamily: '"IBM Plex Sans", "PingFang SC", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
    },
    counter: {
      fontFamily: '"Fira Code", "SF Mono", monospace',
      fontSize: '0.7rem',
      fontWeight: 400,
      letterSpacing: '1px',
    },
    hint: {
      fontFamily: '"IBM Plex Mono", "SF Mono", monospace',
      fontSize: '0.6rem',
      fontWeight: 300,
      letterSpacing: '0.5px',
    },
  },

  effects: {
    controlBarBlur: '24px',
    controlBarBorder: '1px solid rgba(0, 217, 255, 0.2)',
    photoTransition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s ease',
    dragTransition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    buttonHoverScale: 1.12,
    iconGlow: '0 0 16px rgba(0, 217, 255, 0.5)',
    backgroundTransition: 'background 1s ease',
  },

  layout: {
    controlBarPadding: '7px 15px',
    controlBarRadius: '26px',
    controlBarBottom: '19px',
    infoTop: '15px',
    buttonSize: '42px',
    iconSize: '1.05rem',
  },

  adaptive: {
    enabled: true,
    extractColors: true,
    contrastThreshold: 0.6,
    saturationBoost: 1.2,
  },
};

// 所有主题列表
export const photoThemes: PhotoTheme[] = [
  darkGalleryTheme,
  lightGalleryTheme,
  adaptiveTheme,
];

// 根据名称获取主题
export const getThemeByName = (name: string): PhotoTheme => {
  return photoThemes.find(theme => theme.name === name) || darkGalleryTheme;
};
