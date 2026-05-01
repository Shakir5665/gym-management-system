import logger from './logger.js';

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

export const validateConfig = () => {
  const missing = [];
  
  REQUIRED_VARS.forEach(v => {
    if (!process.env[v]) {
      missing.push(v);
    }
  });

  if (missing.length > 0) {
    logger.error('❌ CRITICAL: Missing Environment Variables:');
    missing.forEach(m => logger.error(`   - ${m}`));
    
    // In production, we should stop the server if config is missing
    if (process.env.NODE_ENV === 'production') {
      logger.error('💥 Halting server due to missing configuration.');
      process.exit(1);
    } else {
      logger.warn('⚠️ Server will continue in development mode, but some features will fail.');
    }
    return false;
  }

  logger.info('✅ Environment Configuration Verified');
  return true;
};
