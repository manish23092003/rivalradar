/**
 * API configuration for RivalRadar client.
 * Uses VITE_API_URL in production (e.g., Render backend URL)
 * or falls back to empty string in development to use Vite's local dev proxy.
 */
const rawBase = import.meta.env.VITE_API_URL || '';

// Normalize to ensure no trailing slash
export const API_BASE = rawBase.replace(/\/+$/, '');

/**
 * Returns a clean, normalized API URL with no double slashes.
 * @param {string} endpoint - e.g. '/api/health' or 'api/health'
 * @returns {string} - e.g. 'https://backend.onrender.com/api/health' or '/api/health'
 */
export function apiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
}
