// Backend API Constants
// Easily modify these values for different environments

export const API_BASE_URL = 'https://textimoni.vercel.app';
// export const API_BASE_URL = 'http://localhost:3000';
export const API_KEY = 'ozPBrcATKdSh7CD3O2xtUYZ6HE8Wnmqi';

// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD_PHOTO_DRAFT: '/api/photo-draft',
  UPLOAD_PHOTO: '/api/photo',
  GET_PHOTO_DRAFTS: '/api/photo-draft',
  GET_PHOTOS: '/api/photos',
} as const;