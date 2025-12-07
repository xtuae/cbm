import dotenv from 'dotenv';

// Load environment variables first (for local development only)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import app from './app.js';

// Handle uncaught exceptions and unhandled promise rejections (for local dev only)
if (process.env.NODE_ENV !== 'production') {
  import('./lib/errorHandler.js').then(({ unhandledException, unhandledRejection }) => {
    process.on('uncaughtException', unhandledException);
    process.on('unhandledRejection', unhandledRejection);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}
