import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { settingsService, CityConfig } from '../services/settingsService';

const SettingsPanel: React.FC = () => {
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [newCityName, setNewCityName] = useState('');

  // Load cities
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = () => {
    const settings = settingsService.getWeatherSettings();
    setCities(settings.cities);
  };

  const handleAddCity = () => {
    if (newCityName.trim()) {
      settingsService.addCity(newCityName.trim());
      setNewCityName('');
      loadCities();
    }
  };

  const handleDeleteCity = (cityId: string) => {
    settingsService.removeCity(cityId);
    loadCities();
  };

  return (
    <Box
      sx={{
        padding: 3,
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        设置
      </Typography>

      {/* Weather Settings Card */}
      <Card
        sx={{
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            天气城市管理
          </Typography>

          <Typography
            variant="body2"
            sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            在此添加或删除城市。在天气页面点击城市名可以切换显示的城市。
          </Typography>

          {/* Add City */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="输入城市名称（如：北京、上海）"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCity();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddCity}
              sx={{
                minWidth: '100px',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              添加
            </Button>
          </Box>

          <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* City List */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
            已添加的城市 ({cities.length})
          </Typography>

          {cities.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', py: 3 }}
            >
              暂无城市，请添加
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {cities.map((city, index) => (
                <ListItem
                  key={city.id}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    },
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteCity(city.id)}
                      disabled={cities.length === 1}
                      sx={{
                        color: cities.length === 1 ? 'rgba(255, 255, 255, 0.3)' : '#f44336',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={city.name}
                    secondary={city.locationId ? `ID: ${city.locationId}` : '未查询'}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {cities.length === 1 && (
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 1 }}
            >
              * 至少保留一个城市
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card
        sx={{
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(33, 150, 243, 0.3)',
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            💡 提示
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            • 在天气页面点击城市名称可以快速切换城市
            <br />
            • 天气数据每30分钟自动更新一次
            <br />
            • 等硬件到货后，可以通过 ESP32 配网页面配置城市
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPanel;
