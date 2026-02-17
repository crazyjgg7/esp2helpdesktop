/**
 * 城市配置数据结构和存储服务
 */

export interface CityConfig {
  id: string;
  name: string;
  locationId?: string; // 和风天气的城市ID（查询后缓存）
}

export interface WeatherSettings {
  cities: CityConfig[];
  currentCityId: string;
  apiKey: string;
}

const STORAGE_KEY = 'weather_settings';

class SettingsService {
  /**
   * 获取天气设置
   */
  getWeatherSettings(): WeatherSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('读取设置失败:', error);
    }

    // 返回默认设置
    return this.getDefaultSettings();
  }

  /**
   * 保存天气设置
   */
  saveWeatherSettings(settings: WeatherSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  /**
   * 获取默认设置
   */
  private getDefaultSettings(): WeatherSettings {
    return {
      cities: [
        { id: '1', name: '北京' },
        { id: '2', name: '上海' },
        { id: '3', name: '广州' },
      ],
      currentCityId: '1',
      apiKey: '',
    };
  }

  /**
   * 添加城市
   */
  addCity(cityName: string): WeatherSettings {
    const settings = this.getWeatherSettings();
    const newCity: CityConfig = {
      id: Date.now().toString(),
      name: cityName,
    };
    settings.cities.push(newCity);
    this.saveWeatherSettings(settings);
    return settings;
  }

  /**
   * 删除城市
   */
  removeCity(cityId: string): WeatherSettings {
    const settings = this.getWeatherSettings();
    settings.cities = settings.cities.filter(city => city.id !== cityId);

    // 如果删除的是当前城市，切换到第一个城市
    if (settings.currentCityId === cityId && settings.cities.length > 0) {
      settings.currentCityId = settings.cities[0].id;
    }

    this.saveWeatherSettings(settings);
    return settings;
  }

  /**
   * 设置当前城市
   */
  setCurrentCity(cityId: string): WeatherSettings {
    const settings = this.getWeatherSettings();
    settings.currentCityId = cityId;
    this.saveWeatherSettings(settings);
    return settings;
  }

  /**
   * 获取当前城市
   */
  getCurrentCity(): CityConfig | null {
    const settings = this.getWeatherSettings();
    return settings.cities.find(city => city.id === settings.currentCityId) || null;
  }

  /**
   * 更新城市的 locationId（和风天气城市ID）
   */
  updateCityLocationId(cityId: string, locationId: string): void {
    const settings = this.getWeatherSettings();
    const city = settings.cities.find(c => c.id === cityId);
    if (city) {
      city.locationId = locationId;
      this.saveWeatherSettings(settings);
    }
  }

  /**
   * 从 ESP32 接收配置（WebSocket）
   */
  syncFromESP32(config: Partial<WeatherSettings>): void {
    const settings = this.getWeatherSettings();

    if (config.cities) {
      settings.cities = config.cities;
    }
    if (config.currentCityId) {
      settings.currentCityId = config.currentCityId;
    }
    if (config.apiKey) {
      settings.apiKey = config.apiKey;
    }

    this.saveWeatherSettings(settings);
  }
}

// 导出单例
export const settingsService = new SettingsService();
