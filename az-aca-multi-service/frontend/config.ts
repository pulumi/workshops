/// <reference types="vite/client" />

// Use ?? instead of || to properly handle empty string (for BFF proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
