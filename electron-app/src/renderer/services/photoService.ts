/**
 * 相册服务模块
 * 支持从指定文件夹加载照片
 */

import { settingsService } from './settingsService';

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
}

class PhotoService {
  /**
   * 获取相册文件夹中的所有照片
   * 注意：在实际 Electron 环境中，需要使用 fs 模块读取文件夹
   * 目前使用模拟数据进行开发测试
   */
  async getPhotosFromFolder(folderPath?: string): Promise<PhotoItem[]> {
    const settings = settingsService.getPhotoSettings();
    const targetFolder = folderPath || settings.folderPath;
    const maxCount = settings.maxPhotoCount || 20;

    console.log(`加载相册文件夹: ${targetFolder}，最多 ${maxCount} 张照片`);

    // TODO: 在 Electron 环境中，使用 IPC 调用主进程读取文件夹
    // const photos = await window.electron.readPhotoFolder(targetFolder);

    // 目前返回模拟数据，限制数量
    const mockPhotos = this.getMockPhotos();
    return mockPhotos.slice(0, maxCount);
  }

  /**
   * 获取模拟照片数据（用于开发测试）
   */
  private getMockPhotos(): PhotoItem[] {
    // 使用 Unsplash 的示例图片
    const mockPhotos: PhotoItem[] = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
        name: '山景1.jpg',
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop',
        name: '自然2.jpg',
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=800&fit=crop',
        name: '风景3.jpg',
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop',
        name: '海滩4.jpg',
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop',
        name: '森林5.jpg',
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
        name: '田野6.jpg',
      },
    ];

    return mockPhotos;
  }

  /**
   * 预加载照片（提前加载图片到浏览器缓存）
   */
  async preloadPhotos(photos: PhotoItem[]): Promise<void> {
    const promises = photos.map(photo => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${photo.name}`));
        img.src = photo.url;
      });
    });

    try {
      await Promise.all(promises);
      console.log(`成功预加载 ${photos.length} 张照片`);
    } catch (error) {
      console.error('预加载照片失败:', error);
    }
  }
}

// 导出单例
export const photoService = new PhotoService();
