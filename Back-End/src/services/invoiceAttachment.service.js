const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../uploads/supplier-invoices');
const TYPES = {
  pdf: { extension: '.pdf', mimeType: 'application/pdf' },
  jpg: { extension: '.jpg', mimeType: 'image/jpeg' },
  png: { extension: '.png', mimeType: 'image/png' },
};

function httpError(message) { const error = new Error(message); error.status = 400; return error; }
function detectType(buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') return TYPES.pdf;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return TYPES.jpg;
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return TYPES.png;
  throw httpError('The attachment content is not a valid PDF, JPG or PNG file');
}
async function store(file) {
  if (!file) return null;
  const type = detectType(file.buffer);
  if (type.mimeType === TYPES.pdf.mimeType && file.buffer.includes(Buffer.from('/Encrypt'))) throw httpError('Encrypted PDF files are not supported');
  const storedName = `${crypto.randomUUID()}${type.extension}`;
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(path.join(ROOT, storedName), file.buffer, { flag: 'wx' });
  return {
    attachmentOriginalName: path.basename(file.originalname).slice(0, 255),
    attachmentStoredName: storedName,
    attachmentMimeType: type.mimeType,
    attachmentSize: file.size,
    attachmentSha256: crypto.createHash('sha256').update(file.buffer).digest('hex'),
  };
}
async function remove(storedName) {
  if (!storedName || path.basename(storedName) !== storedName) return;
  await fs.unlink(path.join(ROOT, storedName)).catch((error) => { if (error.code !== 'ENOENT') throw error; });
}
function pathFor(storedName) {
  if (!storedName || path.basename(storedName) !== storedName) throw httpError('Invalid attachment');
  return path.join(ROOT, storedName);
}
module.exports = { store, remove, pathFor };
