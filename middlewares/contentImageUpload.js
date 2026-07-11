const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

const sanitizeContentSlug = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const getRequestSlug = (req) =>
  sanitizeContentSlug(req.body?.slug || req.query?.slug);

const getExtension = (file) => {
  const fromName = path.extname(file.originalname || '').toLowerCase();
  if (fromName) {
    return fromName;
  }

  if (file.mimetype === 'image/png') {
    return '.png';
  }

  if (file.mimetype === 'image/webp') {
    return '.webp';
  }

  return '.jpg';
};

const contentImageStorage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const slug = getRequestSlug(req);
      if (!slug) {
        return cb(new Error('Slug is required for content image upload'));
      }

      const destination = path.join(__dirname, '..', 'uploads', 'content', slug);
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const mediaId = new mongoose.Types.ObjectId();
    req.generatedMediaId = mediaId;
    cb(null, `${mediaId.toString()}${getExtension(file)}`);
  },
});

const contentImageUpload = multer({
  storage: contentImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Invalid image type. Use JPG, PNG or WEBP.'));
  },
});

module.exports = {
  contentImageUpload,
  sanitizeContentSlug,
  getRequestSlug,
};
