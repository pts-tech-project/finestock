const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const companyRoutes = require('./routes/company.routes');
const roleRoutes = require('./routes/role.routes');
const supplierRoutes = require('./routes/supplier.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://82.165.218.214',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin browser requests (no Origin) and allowed frontends
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // Allow any origin that matches this server's host:port (served from Express)
      callback(null, true);
    },
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
app.use('/api/companies/:companyId/suppliers', supplierRoutes);

// Serve frontend build (same pattern as other PTS apps on this server)
const frontendDist =
  process.env.FRONTEND_DIST ||
  path.join(__dirname, '..', '..', 'Front-End', 'dist');

app.use(express.static(frontendDist));

app.get(/^\/(?!api|health).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      console.error(`Error serving index.html: ${err.message}`);
      res.status(500).send('Server error — is FRONTEND_DIST built and set?');
    }
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
