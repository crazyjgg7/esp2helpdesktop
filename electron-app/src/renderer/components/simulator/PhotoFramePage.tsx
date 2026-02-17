import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, PlayArrow, Pause } from '@mui/icons-material';
import { photoService, PhotoItem } from '../../services/photoService';
import { settingsService } from '../../services/settingsService';
import { getThemeByName, PhotoTheme } from '../../config/photoThemes';
import { extractColorsFromImage, ExtractedColors } from '../../utils/colorExtractor';
import MosaicPlaceholder from './MosaicPlaceholder';

interface PhotoFramePageProps {
  onBack: () => void;
}

const PhotoFramePage: React.FC<PhotoFramePageProps> = ({ onBack }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [theme, setTheme] = useState<PhotoTheme | null>(null);
  const [adaptiveColors, setAdaptiveColors] = useState<ExtractedColors | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load photos on mount
  useEffect(() => {
    loadPhotos();
    loadTheme();
  }, []);

  // Load theme
  const loadTheme = () => {
    const settings = settingsService.getPhotoSettings();
    const selectedTheme = getThemeByName(settings.theme);
    setTheme(selectedTheme);
  };

  // Extract colors for adaptive theme
  useEffect(() => {
    if (theme?.adaptive?.enabled && photos.length > 0 && currentIndex < photos.length) {
      const currentPhoto = photos[currentIndex];
      extractColorsFromImage(currentPhoto.url)
        .then(colors => {
          setAdaptiveColors(colors);
        })
        .catch(error => {
          console.error('颜色提取失败:', error);
        });
    }
  }, [currentIndex, photos, theme]);

  // Auto-play slideshow
  useEffect(() => {
    const settings = settingsService.getPhotoSettings();

    if (isPlaying && photos.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, settings.slideshowInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, photos.length]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const photoList = await photoService.getPhotosFromFolder();
      setPhotos(photoList);

      // Preload photos for smooth transitions
      photoService.preloadPhotos(photoList);

      // Auto-play based on settings
      const settings = settingsService.getPhotoSettings();
      setIsPlaying(settings.autoPlay);
    } catch (error) {
      console.error('加载照片失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Handle image load error
  const handleImageError = (photoId: string) => {
    console.error(`照片加载失败: ${photoId}`);
    setImageErrors((prev) => new Set(prev).add(photoId));
  };

  // Check if image has error
  const hasImageError = (photoId: string) => {
    return imageErrors.has(photoId);
  };

  // Handle long press for back navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore if clicking on control buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // Start mouse drag
    setIsMouseDown(true);
    setTouchStart({ x: e.clientX, y: e.clientY });
    setIsDragging(false);

    // Long press timer for back navigation
    const timer = setTimeout(() => {
      onBack();
    }, 800);
    setLongPressTimer(timer);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !touchStart || !containerRef.current) return;

    const deltaX = e.clientX - touchStart.x;
    const deltaY = e.clientY - touchStart.y;

    // Only start dragging if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setDragOffset(deltaX);

      // Clear long press timer when dragging
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Pause auto-play while dragging
      if (isPlaying) {
        setIsPlaying(false);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - (touchStart?.x || 0);
    const threshold = 80; // Minimum drag distance to trigger switch

    if (isDragging && Math.abs(deltaX) > threshold) {
      // Switch photo based on drag direction
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }

    // Reset drag state
    setIsMouseDown(false);
    setTouchStart(null);
    setDragOffset(0);
    setIsDragging(false);

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Resume auto-play if it was enabled
    const settings = settingsService.getPhotoSettings();
    if (settings.autoPlay) {
      setIsPlaying(true);
    }
  };

  // Drag gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Ignore if touching control buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(false);

    // Clear long press timer when starting drag
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !containerRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only start dragging if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setDragOffset(deltaX);

      // Pause auto-play while dragging
      if (isPlaying) {
        setIsPlaying(false);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const threshold = 80; // Minimum drag distance to trigger switch

    if (isDragging && Math.abs(deltaX) > threshold) {
      // Switch photo based on drag direction
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (!isDragging) {
      // If not dragging, check for long press
      const deltaY = touch.clientY - touchStart.y;
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // It was a tap, not a drag
      }
    }

    // Reset drag state
    setTouchStart(null);
    setDragOffset(0);
    setIsDragging(false);

    // Resume auto-play if it was enabled
    const settings = settingsService.getPhotoSettings();
    if (settings.autoPlay) {
      setIsPlaying(true);
    }
  };

  const currentPhoto = photos[currentIndex];

  // 获取当前主题的颜色（自适应主题会使用提取的颜色）
  const getThemeColors = () => {
    if (!theme) return null;

    if (theme.adaptive?.enabled && adaptiveColors) {
      return {
        background: adaptiveColors.dominant,
        text: adaptiveColors.textColor,
        textSecondary: adaptiveColors.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        controlBar: adaptiveColors.isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.85)',
        accent: theme.colors.accent,
      };
    }

    return theme.colors;
  };

  const themeColors = getThemeColors();

  if (isLoading || !theme) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}
      >
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 1 }}>
          暂无照片
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
          请在设置中配置相册文件夹
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            bottom: '8px',
            fontSize: '0.6rem',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          长按屏幕返回
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: themeColors?.background || '#000',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: theme.effects.backgroundTransition || 'none',
      }}
    >
      {/* Photo Display - Draggable with preview */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Previous Photo (for left drag preview) */}
        {dragOffset > 0 && (
          <>
            {hasImageError(photos[(currentIndex - 1 + photos.length) % photos.length].id) ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${-100 + (dragOffset / 360) * 100}%`,
                  width: '100%',
                  height: '100%',
                }}
              >
                <MosaicPlaceholder />
              </Box>
            ) : (
              <Box
                component="img"
                src={photos[(currentIndex - 1 + photos.length) % photos.length].url}
                alt="previous"
                onError={() => handleImageError(photos[(currentIndex - 1 + photos.length) % photos.length].id)}
                sx={{
                  position: 'absolute',
                  left: `${-100 + (dragOffset / 360) * 100}%`,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
            )}
          </>
        )}

        {/* Current Photo */}
        {hasImageError(currentPhoto.id) ? (
          <Box
            sx={{
              position: 'absolute',
              left: isDragging ? `${(dragOffset / 360) * 100}%` : '0',
              width: '100%',
              height: '100%',
              transition: isDragging ? 'none' : 'left 0.3s ease',
            }}
          >
            <MosaicPlaceholder />
          </Box>
        ) : (
          <Box
            component="img"
            src={currentPhoto.url}
            alt={currentPhoto.name}
            onError={() => handleImageError(currentPhoto.id)}
            sx={{
              position: 'absolute',
              left: isDragging ? `${(dragOffset / 360) * 100}%` : '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: isDragging ? 'none' : 'left 0.3s ease, opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Next Photo (for right drag preview) */}
        {dragOffset < 0 && (
          <>
            {hasImageError(photos[(currentIndex + 1) % photos.length].id) ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${100 + (dragOffset / 360) * 100}%`,
                  width: '100%',
                  height: '100%',
                }}
              >
                <MosaicPlaceholder />
              </Box>
            ) : (
              <Box
                component="img"
                src={photos[(currentIndex + 1) % photos.length].url}
                alt="next"
                onError={() => handleImageError(photos[(currentIndex + 1) % photos.length].id)}
                sx={{
                  position: 'absolute',
                  left: `${100 + (dragOffset / 360) * 100}%`,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
            )}
          </>
        )}

        {/* Dark overlay for better control visibility */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Top Info - Photo Name & Counter */}
      <Box
        sx={{
          position: 'absolute',
          top: theme.layout.infoTop,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
        }}
      >
        <Typography
          sx={{
            ...theme.typography.photoName,
            color: themeColors?.text || '#fff',
            textShadow: themeColors?.text === '#1a1a1a' ? '0 1px 3px rgba(255, 255, 255, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.8)',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentPhoto.name}
        </Typography>
        <Typography
          sx={{
            ...theme.typography.counter,
            color: themeColors?.textSecondary || 'rgba(255, 255, 255, 0.8)',
            textShadow: themeColors?.text === '#1a1a1a' ? '0 1px 2px rgba(255, 255, 255, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.8)',
          }}
        >
          {currentIndex + 1} / {photos.length}
        </Typography>
      </Box>

      {/* Bottom Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: theme.layout.controlBarBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: themeColors?.controlBar || 'rgba(0, 0, 0, 0.6)',
          backdropFilter: `blur(${theme.effects.controlBarBlur})`,
          borderRadius: theme.layout.controlBarRadius,
          padding: theme.layout.controlBarPadding,
          border: theme.effects.controlBarBorder,
          boxShadow: theme.effects.controlBarShadow,
        }}
      >
        {/* Previous Button */}
        <IconButton
          size="small"
          onClick={handlePrevious}
          sx={{
            color: themeColors?.text || '#fff',
            padding: '6px',
            width: theme.layout.buttonSize,
            height: theme.layout.buttonSize,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: themeColors?.text === '#1a1a1a' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              transform: `scale(${theme.effects.buttonHoverScale})`,
              filter: theme.effects.iconGlow !== 'none' ? `drop-shadow(${theme.effects.iconGlow})` : 'none',
            },
          }}
        >
          <ArrowBackIos sx={{ fontSize: theme.layout.iconSize, ml: '4px' }} />
        </IconButton>

        {/* Play/Pause Button */}
        <IconButton
          size="small"
          onClick={togglePlayPause}
          sx={{
            color: themeColors?.accent || '#fff',
            padding: '8px',
            width: theme.layout.buttonSize,
            height: theme.layout.buttonSize,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: themeColors?.text === '#1a1a1a' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              transform: `scale(${theme.effects.buttonHoverScale})`,
              filter: theme.effects.iconGlow !== 'none' ? `drop-shadow(${theme.effects.iconGlow})` : 'none',
            },
          }}
        >
          {isPlaying ? (
            <Pause sx={{ fontSize: theme.layout.iconSize }} />
          ) : (
            <PlayArrow sx={{ fontSize: theme.layout.iconSize }} />
          )}
        </IconButton>

        {/* Next Button */}
        <IconButton
          size="small"
          onClick={handleNext}
          sx={{
            color: themeColors?.text || '#fff',
            padding: '6px',
            width: theme.layout.buttonSize,
            height: theme.layout.buttonSize,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: themeColors?.text === '#1a1a1a' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              transform: `scale(${theme.effects.buttonHoverScale})`,
              filter: theme.effects.iconGlow !== 'none' ? `drop-shadow(${theme.effects.iconGlow})` : 'none',
            },
          }}
        >
          <ArrowForwardIos sx={{ fontSize: theme.layout.iconSize }} />
        </IconButton>
      </Box>

      {/* Long Press Hint */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          ...theme.typography.hint,
          color: themeColors?.textSecondary || 'rgba(255, 255, 255, 0.4)',
          textShadow: themeColors?.text === '#1a1a1a' ? '0 1px 2px rgba(255, 255, 255, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.8)',
        }}
      >
        长按屏幕返回
      </Typography>
    </Box>
  );
};

export default PhotoFramePage;
