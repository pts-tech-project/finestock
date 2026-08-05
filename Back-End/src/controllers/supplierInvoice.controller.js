const service = require('../services/supplierInvoice.service');
const attachments = require('../services/invoiceAttachment.service');
function serialize(value) {
  const row = value.get ? value.get({ plain: true }) : value;
  for (const key of ['netAmount', 'vatAmount', 'totalAmount', 'paidAmount', 'balanceAmount']) {
    if (row[key] !== undefined && row[key] !== null) row[key] = Number(row[key]);
  }
  if (row.goodsReceipt) row.goodsReceipt.totalAmount = Number(row.goodsReceipt.totalAmount);
  return row;
}
async function eligible(req, res, next) { try { return res.json({ success: true, data: (await service.eligibleGoodsReceipts(req.params.companyId)).map(serialize) }); } catch (e) { return next(e); } }
async function create(req, res, next) {
  let attachment;
  try {
    attachment = await attachments.store(req.file);
    return res.status(201).json({ success: true, data: serialize(await service.create(req.params.companyId, req.body, attachment)), message: 'Supplier invoice saved as draft' });
  } catch (e) { if (attachment) await attachments.remove(attachment.attachmentStoredName).catch(() => {}); return next(e); }
}
async function list(req, res, next) { try { const result = await service.list(req.params.companyId, req.query); return res.json({ success: true, data: result.rows.map(serialize), pagination: result.pagination }); } catch (e) { return next(e); } }
async function get(req, res, next) { try { return res.json({ success: true, data: serialize(await service.get(req.params.companyId, req.params.invoiceId)) }); } catch (e) { return next(e); } }
async function update(req, res, next) {
  let attachment;
  try {
    const before = await service.get(req.params.companyId, req.params.invoiceId);
    attachment = await attachments.store(req.file);
    const result = await service.update(req.params.companyId, req.params.invoiceId, req.body, attachment);
    if (attachment && before.attachmentStoredName) await attachments.remove(before.attachmentStoredName).catch(() => {});
    return res.json({ success: true, data: serialize(result), message: 'Supplier invoice updated' });
  } catch (e) { if (attachment) await attachments.remove(attachment.attachmentStoredName).catch(() => {}); return next(e); }
}
async function approve(req, res, next) { try { return res.json({ success: true, data: serialize(await service.approve(req.params.companyId, req.params.invoiceId, req.user.id)), message: 'Supplier invoice approved and locked' }); } catch (e) { return next(e); } }
async function attachment(req, res, next) {
  try {
    const invoice = await service.get(req.params.companyId, req.params.invoiceId);
    if (!invoice.attachmentStoredName) { const error = new Error('This invoice has no attachment'); error.status = 404; throw error; }
    res.type(invoice.attachmentMimeType);
    const disposition = req.query.download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodeURIComponent(invoice.attachmentOriginalName)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(attachments.pathFor(invoice.attachmentStoredName));
  } catch (e) { return next(e); }
}
module.exports = { eligible, create, list, get, update, approve, attachment };
