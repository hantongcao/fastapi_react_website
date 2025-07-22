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
  EAZYTEC_API_KEY: process.env.EAZYTEC_API_KEY || 'sk-lywtivqzfpinemwjzjsuzxifdmemuurijhahpijbqlnrfmoa',
  EAZYTEC_BASE_URL: process.env.EAZYTEC_BASE_URL || 'https://api.siliconflow.cn/v1',
  EAZYTEC_MODEL: process.env.EAZYTEC_MODEL || 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  
  // Request timeouts and limits
  MAX_DURATION: parseInt(process.env.MAX_DURATION || '30'),
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '10000'),
}

// Type definitions for better type safety
export type ApiConfig = typeof API_CONFIG