// API Configuration
export const API_CONFIG = {
  // Frontend Configuration
  FRONTEND_HOST: process.env.NEXT_PUBLIC_FRONTEND_HOST || 'localhost',
  FRONTEND_PORT: process.env.NEXT_PUBLIC_FRONTEND_PORT || '3000',
  
  // Backend Configuration
  BACKEND_HOST: process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost',
  BACKEND_PORT: process.env.NEXT_PUBLIC_BACKEND_PORT || '8000',
  
  // Base API URL
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000/v1',
  
  // Auth API
  AUTH_API_URL: process.env.AUTH_API_URL || 'http://localhost:8000/v1/auth',
  
  // Contact API
  CONTACT_API_URL: process.env.CONTACT_API_URL || 'http://localhost:8000/v1/contacts',
  
  // Photos API
  PHOTOS_API_URL: process.env.PHOTOS_API_URL || 'http://localhost:8000/v1/photos',
  
  // Blogs API
  BLOGS_API_URL: process.env.BLOGS_API_URL || 'http://localhost:8000/v1/blogs',
  
  // AI Chat API
  EAZYTEC_API_KEY: process.env.EAZYTEC_API_KEY || '',
  EAZYTEC_BASE_URL: process.env.EAZYTEC_BASE_URL || 'https://api.deepseek.com',
  EAZYTEC_MODEL: process.env.EAZYTEC_MODEL || 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  
  // Request timeouts and limits
  MAX_DURATION: parseInt(process.env.MAX_DURATION || '30'),
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '10000'),
}

// Type definitions for better type safety
