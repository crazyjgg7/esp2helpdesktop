/**
 * 天气缓存服务
 * 实现2小时缓存机制，减少API调用
 */

import { WeatherData } from './weatherService';

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  cityId: string;
  cityName: string;
}

const CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2小时（毫秒）

class WeatherCacheService {
  /**
   * 获取缓存的天气数据
   */
  getCachedWeather(cityName: string): WeatherData | null {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      if (!cacheStr) return null;

      const cache: CachedWeatherData[] = JSON.parse(cacheStr);
      const now = Date.now();

      // 查找该城市的缓存
      const cached = cache.find(item => item.cityName === cityName);
      if (!cached) return null;

      // 检查是否过期（2小时）
      if (now - cached.timestamp > CACHE_DURATION) {
        console.log(`缓存已过期: ${cityName}`);
        this.removeCachedWeather(cityName);
        return null;
      }

      console.log(`使用缓存数据: ${cityName}，剩余有效时间: ${Math.round((CACHE_DURATION - (now - cached.timestamp)) / 60000)} 分钟`);
      return cached.data;
    } catch (error) {
      console.error('读取缓存失败:', error);
      return null;
    }
  }

  /**
   * 保存天气数据到缓存
   */
  setCachedWeather(cityName: string, cityId: string, data: WeatherData): void {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      let cache: CachedWeatherData[] = cacheStr ? JSON.parse(cacheStr) : [];

      // 移除该城市的旧缓存
      cache = cache.filter(item => item.cityName !== cityName);

      // 添加新缓存
      cache.push({
        data,
        timestamp: Date.now(),
        cityId,
        cityName,
      });

      // 清理过期缓存
      const now = Date.now();
      cache = cache.filter(item => now - item.timestamp <= CACHE_DURATION);

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log(`缓存已保存: ${cityName}`);
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  }

  /**
   * 删除指定城市的缓存
   */
  removeCachedWeather(cityName: string): void {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      if (!cacheStr) return;

      let cache: CachedWeatherData[] = JSON.parse(cacheStr);
      cache = cache.filter(item => item.cityName !== cityName);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('删除缓存失败:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('所有天气缓存已清空');
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  }

  /**
   * 获取所有缓存的城市列表
   */
  getCachedCities(): string[] {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      if (!cacheStr) return [];

      const cache: CachedWeatherData[] = JSON.parse(cacheStr);
      const now = Date.now();

      // 只返回未过期的城市
      return cache
        .filter(item => now - item.timestamp <= CACHE_DURATION)
        .map(item => item.cityName);
    } catch (error) {
      console.error('获取缓存城市列表失败:', error);
      return [];
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { total: number; valid: number; expired: number } {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      if (!cacheStr) return { total: 0, valid: 0, expired: 0 };

      const cache: CachedWeatherData[] = JSON.parse(cacheStr);
      const now = Date.now();

      const valid = cache.filter(item => now - item.timestamp <= CACHE_DURATION).length;
      const expired = cache.length - valid;

      return {
        total: cache.length,
        valid,
        expired,
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return { total: 0, valid: 0, expired: 0 };
    }
  }
}

// 导出单例
export const weatherCacheService = new WeatherCacheService();
