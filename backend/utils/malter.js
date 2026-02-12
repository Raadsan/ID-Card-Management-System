import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";

// Set Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "idms_uploads", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "svg"],
    // Remove individual filename logic as Cloudinary handles it
  },
});

// File filter (optional) - accept only images and allowed types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|html|htm/;
  const allowedMimetypes = /image\/|application\/pdf|text\/html/;

  const isExtensionValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimetypeValid = allowedMimetypes.test(file.mimetype);

  if (isExtensionValid || isMimetypeValid) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported. Allowed: images (jpeg, png, gif, webp, svg), HTML, and PDF."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // max 50MB
});

export default upload;
