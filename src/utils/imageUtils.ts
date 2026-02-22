/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  actual: { width: number; height: number },
  expected: { width: number; height: number },
  tolerance: number = 0
): { valid: boolean; message?: string } {
  const widthValid = Math.abs(actual.width - expected.width) <= tolerance;
  const heightValid = Math.abs(actual.height - expected.height) <= tolerance;
  
  if (widthValid && heightValid) {
    return { valid: true };
  }
  
  return {
    valid: false,
    message: `Dimensões incorretas: ${actual.width}×${actual.height}px. Esperado: ${expected.width}×${expected.height}px`
  };
}

/**
 * Resize an image to specific dimensions
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        URL.revokeObjectURL(img.src);
        return;
      }
      
      // Draw image scaled to fit target dimensions
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to resize image'));
          }
          URL.revokeObjectURL(img.src);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert an image file to WebP format using canvas
 * @param file - The original image file
 * @param quality - WebP quality (0-1), default 0.85
 * @returns Promise<Blob> - The converted WebP blob
 */
export async function convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        quality
      );
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}
