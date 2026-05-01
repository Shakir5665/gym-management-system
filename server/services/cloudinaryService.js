import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a base64 string or file path to Cloudinary
 * @param {string} fileContent - Base64 string or file path
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (fileContent, folder = 'gym-system') => {
  try {
    if (!fileContent) return null;
    
    // If it's already a URL, don't re-upload
    if (fileContent.startsWith('http')) return fileContent;

    const result = await cloudinary.uploader.upload(fileContent, {
      folder: folder,
      resource_type: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return null;
  }
};

export default cloudinary;
