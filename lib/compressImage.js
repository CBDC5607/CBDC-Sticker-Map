// Reads an image File, downsizes it to maxDim on the longest edge, and
// returns a compressed JPEG Blob ready to upload to Supabase Storage.
export function compressImage(file, maxDim = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not process that image.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
