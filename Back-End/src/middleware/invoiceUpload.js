const multer = require('multer');

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 20 },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only PDF, JPG and PNG attachments are allowed'); error.status = 400; return callback(error);
    }
    return callback(null, true);
  },
}).single('attachment');

function invoiceUpload(req, res, next) {
  parser(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') error.message = 'Invoice attachment must be 10 MB or smaller';
    error.status = 400;
    return next(error);
  });
}
module.exports = invoiceUpload;
