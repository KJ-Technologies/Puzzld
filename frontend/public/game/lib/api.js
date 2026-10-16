const defaultApiUrl =
  window.location.port === '3000' ? 'http://localhost:3001' : window.location.origin;
const API_BASE_URL = (window.__PUZZLD_API_URL__ || defaultApiUrl).replace(/\/$/, '');

export function apiUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options);
}
