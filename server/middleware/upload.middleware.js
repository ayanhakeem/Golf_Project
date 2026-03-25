const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Cloudinary storage for charity images
 */
const charityStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'golf-charity/charities',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

/**
 * Cloudinary storage for winner proof screenshots
 */
const proofStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'golf-charity/winner-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ width: 1600, quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, or PDF files are allowed'), false);
  }
};

const uploadCharityImage = multer({
  storage: charityStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadProof = multer({
  storage: proofStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { uploadCharityImage, uploadProof };
