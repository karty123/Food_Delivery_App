// API Configuration
// In development, defaults to localhost:5000
// In production, set VITE_API_URL environment variable

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default API_URL

