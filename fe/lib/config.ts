// API Configuration
export const API_CONFIG = {
  // Base API URL
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000/v1',
  
  // Auth API
  AUTH_API_URL: process.env.AUTH_API_URL || 'http://localhost:8000/v1/auth',
  
  // Contact API
  CONTACT_API_URL: process.env.CONTACT_API_URL || 'http://localhost:8000/v1/contacts',
  
  // Photos API
  PHOTOS_API_URL: process.env.PHOTOS_API_URL || 'http://localhost:8000/v1/photos',
  
  // Chat API (Eazytec)
  EAZYTEC_API_KEY: process.env.EAZYTEC_API_KEY || 'eazytec_25abefe91013adef_9e8e77041a87c925de10acf21040f6c8',
  EAZYTEC_BASE_URL: process.env.EAZYTEC_BASE_URL || 'https://maas.eazytec-cloud.com/v1',
  EAZYTEC_MODEL: process.env.EAZYTEC_MODEL || 'maas/qwen2.5-coder',
  
  // Request timeouts and limits
  MAX_DURATION: parseInt(process.env.MAX_DURATION || '30'),
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '10000'),
}

// Type definitions for better type safety
export type ApiConfig = typeof API_CONFIG