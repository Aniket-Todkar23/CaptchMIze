// Environment Configuration
export const ENV = {
  // App Environment
  NODE_ENV: import.meta.env.MODE,
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Application Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Captchamize',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // External URLs
  DEMO_URL: import.meta.env.VITE_DEMO_URL || 'https://captchamize.vercel.app',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // Computed Properties
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
};

// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: `${ENV.API_BASE_URL}/api/register`,
  CAPTCHA_GENERATE: `${ENV.API_BASE_URL}/api/captcha/generate`,
  CAPTCHA_VERIFY: `${ENV.API_BASE_URL}/api/captcha/verify`,
  USAGE: `${ENV.API_BASE_URL}/api/usage`,
  DOCS: `${ENV.API_BASE_URL}/api/docs`,
  HEALTH: `${ENV.API_BASE_URL}/api/health`,
};

// Debug logging
if (ENV.ENABLE_DEBUG_MODE) {
  console.log('🔧 Environment Configuration:', {
    NODE_ENV: ENV.NODE_ENV,
    APP_ENV: ENV.APP_ENV,
    API_BASE_URL: ENV.API_BASE_URL,
    IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
    IS_PRODUCTION: ENV.IS_PRODUCTION,
  });
}

export default ENV;