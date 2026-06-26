const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'files';
    if (file.mimetype.startsWith('image/')) subfolder = 'images';
    if (file.mimetype.includes('apk') || file.originalname.endsWith('.apk')) subfolder = 'apk';
    if (file.originalname.endsWith('.exe')) subfolder = 'exe';
    cb(null, path.join(process.env.UPLOAD_DIR || './uploads', subfolder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.apk', '.exe', '.zip', '.rar', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Bu dosya türü desteklenmiyor'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

module.exports = upload;
