// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn('⚠️ Cloudinary configuration missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local');
}

/**
 * Hàm upload 1 ảnh lên Cloudinary
 * @param base64 Base64 string của ảnh (lấy từ ImagePicker với base64: true)
 * @param folderPath Thư mục muốn lưu trên Cloudinary (vd: 'avatars', 'account_images')
 * @param onProgress (Optional) Callback để cập nhật % upload (chưa hỗ trợ với Cloudinary)
 * @returns Promise<string> - Trả về Secure URL từ Cloudinary
 */
export const uploadImageToStorage = async (
  base64: string,
  folderPath: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing. Please check your .env.local file.');
    }

    if (!base64) {
      throw new Error('Base64 image data is required');
    }

    // 1. Tạo tên file unique
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const publicId = `${folderPath}/${filename}`;

    // 2. Tạo FormData để upload lên Cloudinary (React Native compatible)
    const formData = new FormData();
    // Đảm bảo base64 có prefix data URI nếu chưa có
    const base64Data = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    formData.append('file', base64Data as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folderPath);
    formData.append('public_id', publicId);

    // 3. Upload lên Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // Không set Content-Type header, để React Native tự động set với boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const result = await response.json();

    // 4. Trả về secure URL
    return result.secure_url || result.url;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

/**
 * Hàm upload nhiều ảnh cùng lúc (Dùng cho Album ảnh Account)
 */
export const uploadMultipleImages = async (
  uris: string[],
  folderPath: string
): Promise<string[]> => {
  try {
    // Chạy song song tất cả các request upload
    const uploadPromises = uris.map(uri => uploadImageToStorage(uri, folderPath));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Multi-upload Error:", error);
    throw error;
  }
};