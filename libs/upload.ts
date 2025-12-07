import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';

/**
 * Hàm upload 1 ảnh lên Firebase Storage
 * @param uri Đường dẫn file ảnh trên thiết bị (lấy từ ImagePicker)
 * @param folderPath Thư mục muốn lưu trên Firebase (vd: 'avatars', 'account_images')
 * @param onProgress (Optional) Callback để cập nhật % upload
 * @returns Promise<string> - Trả về Download URL
 */
export const uploadImageToStorage = async (
  uri: string,
  folderPath: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // 1. Xử lý đường dẫn file cho chuẩn
    // Trên Android đôi khi uri có prefix 'file://', cần đảm bảo path sạch
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    
    // 2. Tạo tên file unique (Dùng timestamp + random string)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    // 3. Tạo reference đến vị trí lưu
    const storageRef = storage().ref(`${folderPath}/${filename}`);

    // 4. Bắt đầu upload dùng putFile (Nhanh & Ổn định hơn put Blob)
    const task = storageRef.putFile(uploadUri);

    // 5. Lắng nghe tiến độ (nếu có callback onProgress)
    if (onProgress) {
      task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress)); // Trả về số nguyên 0-100
      });
    }

    // 6. Đợi upload xong
    await task;

    // 7. Lấy URL công khai để lưu vào Firestore
    const downloadUrl = await storageRef.getDownloadURL();
    return downloadUrl;

  } catch (error) {
    console.error("Upload Error:", error);
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