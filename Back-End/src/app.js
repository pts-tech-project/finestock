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

/**
 * CORS Configuration
 */
const allowedOrigins = [
  'http://localhost:5173',
  'http://82.165.218.214:5080',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, curl, server-side requests)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all origins for now
      // Change to callback(new Error('Not allowed by CORS')) for strict mode
      return callback(null, true);
    },
    credentials: true,
  })
);

/**
 * Body Parser
 */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));


/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'finstock-api',
    status: 'ok',
  });
});


/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/companies/:companyId/suppliers', supplierRoutes);


/**
 * Serve Frontend (React/Vite)
 *
 * Backend structure:
 *
 * Back-End/
 * ├── src/
 * │   └── app.js
 * └── dist/
 *     └── index.html
 *
 */
const frontendPath =
  process.env.FRONTEND_DIST || path.join(__dirname, '..', 'dist');

console.log('Frontend directory:', frontendPath);

app.use(express.static(frontendPath));

/**
 * React Router fallback
 * Ignore API routes
 */
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);


module.exports = app;