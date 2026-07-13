/**
 * Utility to compress images in the browser using HTML5 Canvas API.
 * Resizes the image to a maximum width/height of 800px and reduces quality to 75%.
 * Returns the original file unchanged if it is not an image.
 */
export async function compressFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<File> {
  // If the file is not an image, return it unchanged
  if (!file.type.startsWith('image/')) {
    console.log(`[Compression] File is not an image (${file.type}). Skipping compression.`);
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('[Compression] Failed to get canvas 2d context. Returning original file.');
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Output as JPEG for maximum size savings
                lastModified: Date.now()
              });
              console.log(
                `[Compression] Success: ${file.name} | Original: ${(file.size / 1024).toFixed(1)}KB -> Compressed: ${(compressedFile.size / 1024).toFixed(1)}KB (${(
                  (1 - compressedFile.size / file.size) *
                  100
                ).toFixed(1)}% savings)`
              );
              resolve(compressedFile);
            } else {
              console.warn('[Compression] Blob creation failed. Returning original file.');
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => {
        console.error('[Compression] Image load error:', err);
        resolve(file);
      };
    };
    reader.onerror = (err) => {
      console.error('[Compression] FileReader error:', err);
      resolve(file);
    };
  });
}
