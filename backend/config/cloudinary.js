import { v2 as cloudinary } from 'cloudinary';

// Cloudinary will automatically use the CLOUDINARY_URL environment variable
// from the .env file if it exists.
cloudinary.config({
    secure: true
});

export default cloudinary;
