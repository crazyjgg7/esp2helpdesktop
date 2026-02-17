import React, { useState, useEffect } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import {
  WbSunny,
  Cloud,
  Grain,
  AcUnit,
  Thunderstorm,
  Opacity,
  ExpandMore,
} from '@mui/icons-material';
import { weatherService, WeatherData } from '../../services/weatherService';
import { settingsService, CityConfig } from '../../services/settingsService';

interface WeatherPageProps {
  onBack: () => void;
}

const WeatherPage: React.FC<WeatherPageProps> = ({ onBack }) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 22,
    feelsLike: 20,
    humidity: 65,
    condition: '加载中...',
    conditionCode: 100,
    city: '北京',
    updateTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [currentCityId, setCurrentCityId] = useState<string>('');

  // City menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const cityMenuOpen = Boolean(anchorEl);

  // Load cities from settings
  useEffect(() => {
    const settings = settingsService.getWeatherSettings();
    setCities(settings.cities);
    setCurrentCityId(settings.currentCityId);
  }, []);

  // Fetch weather data
  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      const data = await weatherService.getCurrentWeather();
      setWeatherData(data);
    } catch (error) {
      console.error('获取天气失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and auto-refresh every 30 minutes
  useEffect(() => {
    // 预加载所有城市的天气数据
    weatherService.preloadAllCitiesWeather().then(() => {
      console.log('所有城市天气预加载完成');
    });

    // 获取当前城市天气
    fetchWeather();

    const interval = setInterval(() => {
      fetchWeather();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [currentCityId]);

  // Handle city menu open
  const handleCityClick = (event: React.MouseEvent<HTMLElement>) => {
    // Prevent long press from triggering
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setAnchorEl(event.currentTarget);
  };

  // Handle city menu close
  const handleCityMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle city selection
  const handleCitySelect = (cityId: string) => {
    settingsService.setCurrentCity(cityId);
    setCurrentCityId(cityId);
    handleCityMenuClose();
    fetchWeather();
  };

  // Handle long press for back navigation
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onBack();
    }, 800);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Get weather icon based on condition code
  const getWeatherIcon = (code: number) => {
    if (code >= 100 && code <= 103) {
      // 晴天/多云
      return <WbSunny sx={{ fontSize: 80, color: '#FFD700' }} />;
    } else if (code >= 104 && code <= 213) {
      // 阴天/雨天
      return <Cloud sx={{ fontSize: 80, color: '#B0C4DE' }} />;
    } else if (code >= 300 && code <= 318) {
      // 雨天
      return <Grain sx={{ fontSize: 80, color: '#4682B4' }} />;
    } else if (code >= 400 && code <= 499) {
      // 雪天
      return <AcUnit sx={{ fontSize: 80, color: '#E0F7FA' }} />;
    } else if (code >= 500 && code <= 515) {
      // 雾霾
      return <Opacity sx={{ fontSize: 80, color: '#A9A9A9' }} />;
    } else {
      // 其他（雷暴等）
      return <Thunderstorm sx={{ fontSize: 80, color: '#9370DB' }} />;
    }
  };

  // Get background gradient based on weather
  const getBackgroundGradient = (code: number) => {
    if (code >= 100 && code <= 103) {
      // 晴天 - 明亮蓝天
      return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    } else if (code >= 104 && code <= 213) {
      // 多云 - 柔和灰蓝
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (code >= 300 && code <= 318) {
      // 雨天 - 深蓝灰
      return 'linear-gradient(135deg, #434343 0%, #000000 100%)';
    } else if (code >= 400 && code <= 499) {
      // 雪天 - 深色冷调
      return 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)';
    } else if (code >= 500 && code <= 515) {
      // 雾霾 - 深灰
      return 'linear-gradient(135deg, #485563 0%, #29323c 100%)';
    } else {
      // 其他 - 深紫蓝
      return 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)';
    }
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        width: '100%',
        height: '100%',
        background: getBackgroundGradient(weatherData.conditionCode),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 0.5s ease',
        padding: '20px 0',
      }}
    >
      {/* Top Section - City with dropdown */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '40px',
        }}
      >
        <Box
          onClick={handleCityClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '20px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <Typography
            sx={{
              fontSize: '1.1rem',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '1px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {weatherData.city}
          </Typography>
          <ExpandMore
            sx={{
              fontSize: '1.2rem',
              color: '#fff',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
            }}
          />
        </Box>

        {/* City Selection Menu */}
        <Menu
          anchorEl={anchorEl}
          open={cityMenuOpen}
          onClose={handleCityMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              minWidth: '140px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          {cities.map((city) => (
            <MenuItem
              key={city.id}
              onClick={() => handleCitySelect(city.id)}
              selected={city.id === currentCityId}
              sx={{
                color: '#fff',
                fontSize: '0.95rem',
                padding: '10px 20px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                },
              }}
            >
              {city.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Middle Section - Main Weather Info */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        {/* Weather Icon */}
        <Box
          sx={{
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-8px)' },
            },
          }}
        >
          {getWeatherIcon(weatherData.conditionCode)}
        </Box>

        {/* Temperature - Large and Bold */}
        <Typography
          sx={{
            fontSize: '5.5rem',
            fontWeight: 300,
            color: '#fff',
            lineHeight: 0.9,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-4px',
          }}
        >
          {weatherData.temperature}°
        </Typography>

        {/* Condition Text */}
        <Typography
          sx={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 500,
            letterSpacing: '0.5px',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            marginTop: '-8px',
          }}
        >
          {weatherData.condition}
        </Typography>
      </Box>

      {/* Bottom Section - Additional Info */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          minHeight: '80px',
        }}
      >
        {/* Feels Like & Humidity */}
        <Box
          sx={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* Feels Like */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              体感
            </Typography>
            <Typography
              sx={{
                fontSize: '1.3rem',
                color: '#fff',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {weatherData.feelsLike}°
            </Typography>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: '1px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />

          {/* Humidity */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              湿度
            </Typography>
            <Typography
              sx={{
                fontSize: '1.3rem',
                color: '#fff',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {weatherData.humidity}%
            </Typography>
          </Box>
        </Box>

        {/* Update Time */}
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 500,
            letterSpacing: '0.3px',
          }}
        >
          更新于 {weatherData.updateTime}
        </Typography>
      </Box>

      {/* Long Press Hint - Bottom */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: '8px',
          fontSize: '0.6rem',
          color: 'rgba(255, 255, 255, 0.4)',
          fontWeight: 500,
        }}
      >
        长按屏幕返回
      </Typography>
    </Box>
  );
};

export default WeatherPage;
