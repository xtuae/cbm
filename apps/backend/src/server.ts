import dotenv from 'dotenv';

// Load environment variables first (for local development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import express, { Request, Response } from 'express';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import creditPackRoutes from './routes/credit-packs.js';
import pagesRoutes from './routes/pages.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';
import creditRoutes from './routes/credits.js';
import walletAddressRoutes from './routes/wallet-addresses.js';
import nilaTransferRoutes from './routes/nila-transfers.js';
import wishlistRoutes from './routes/wishlist.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, logRequest, unhandledException, unhandledRejection } from './lib/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/credit-packs', creditPackRoutes);
app.use('/api/v1/admin/credit-packs', creditPackRoutes);
app.use('/api/v1/pages', pagesRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/credits', creditRoutes);
app.use('/api/v1/wallet-addresses', walletAddressRoutes);
app.use('/api/v1/nila-transfers', nilaTransferRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Add logging middleware
app.use('/api/v1', logRequest);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'credits-marketplace-backend'
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Export the app for serverless use
export { app };

// Start server only for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  // Handle uncaught exceptions and unhandled promise rejections (for local dev)
  process.on('uncaughtException', unhandledException);
  process.on('unhandledRejection', unhandledRejection);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
