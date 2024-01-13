const multer = require('multer');

const storageEvent = multer.diskStorage({
  destination: 'uploads/event/',
  filename: function (req, file, cb) {
    const uniqueCode = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueCode + '-' + file.originalname);
  }
});

const storageSuperAdmin = multer.diskStorage({
  destination: 'uploads/superAdmin/',
  filename: function (req, file, cb) {
    const uniqueCode = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueCode + '-' + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed'), false);
  }
};

const uploadEvent = multer({
  storage: storageEvent,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  },
  fileFilter: fileFilter
}).fields([{name: 'image', maxCount: 1}, {name: 'miniature', maxCount: 1}])

const uploadSuperAdmin = multer({
  storage: storageSuperAdmin,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  },
  fileFilter: fileFilter
}).single('logo')

module.exports = {uploadEvent, uploadSuperAdmin};
