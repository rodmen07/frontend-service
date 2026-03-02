export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://backend-service.example.com'
    : 'http://localhost:3000')
