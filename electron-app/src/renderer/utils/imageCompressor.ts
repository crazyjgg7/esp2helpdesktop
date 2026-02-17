/**
 * 图片压缩工具
 * 自动压缩超过限制大小的图片
 */

export interface CompressOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

/**
 * 压缩图片文件
 */
export const compressImage = async (
  file: File,
  options: CompressOptions
): Promise<File> => {
  const { maxSizeMB, maxWidthOrHeight = 1024, quality = 0.8 } = options;

  // 如果文件已经小于限制，直接返回
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 计算新尺寸
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        // 创建 canvas 进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('压缩失败'));
              return;
            }

            // 创建新的 File 对象
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(
              `图片压缩: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * 批量压缩图片
 */
export const compressImages = async (
  files: File[],
  options: CompressOptions,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> => {
  const compressedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], options);
      compressedFiles.push(compressed);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`压缩文件 ${files[i].name} 失败:`, error);
      // 压缩失败时使用原文件
      compressedFiles.push(files[i]);
    }
  }

  return compressedFiles;
};

/**
 * 检查文件大小是否超过限制
 */
export const isFileSizeExceeded = (file: File, maxSizeMB: number): boolean => {
  return file.size > maxSizeMB * 1024 * 1024;
};

/**
 * 格式化文件大小显示
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
};
