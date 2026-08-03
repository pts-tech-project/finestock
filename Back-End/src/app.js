const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const companyRoutes = require('./routes/company.routes');
const roleRoutes = require('./routes/role.routes');
const itemRoutes = require('./routes/item.routes');
const purchaseOrderRoutes = require('./routes/purchaseOrder.routes');
const goodsReceiptRoutes = require('./routes/goodsReceipt.routes');
const stockRoutes = require('./routes/stock.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'finstock-api', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/companies/:companyId/items', itemRoutes);
app.use('/api/companies/:companyId/purchase-orders', purchaseOrderRoutes);
app.use('/api/companies/:companyId/goods-receipts', goodsReceiptRoutes);
app.use('/api/companies/:companyId/stock', stockRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
