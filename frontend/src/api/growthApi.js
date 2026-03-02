import axios from 'axios';

// In production (Render), VITE_API_URL points to the backend service URL.
// In local dev, Vite proxies /api to localhost:8000 so no full URL needed.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/growth`
  : '/api/growth';

const api = axios.create({ baseURL: BASE_URL });

// ── Brand Profile ────────────────────────────
export const createBrand = (data) => api.post('/brand-profile', data).then(r => r.data);

// ── Growth Cycle ─────────────────────────────
export const runGrowthCycle = (brandId) =>
  api.post('/run-growth-cycle', { brand_id: brandId }).then(r => r.data);

// ── Dashboard ────────────────────────────────
export const getDashboardMetrics = (brandId) =>
  api.get('/dashboard-metrics', { params: { brand_id: brandId } }).then(r => r.data);

// ── Strategy ─────────────────────────────────
export const getStrategy = (brandId) =>
  api.get('/strategy', { params: { brand_id: brandId } }).then(r => r.data);

// ── Content Analysis ─────────────────────────
export const analyzeContent = (data) =>
  api.post('/analyze-content', data).then(r => r.data);

// ── Monitoring ───────────────────────────────
export const simulateWeeklyCheck = () =>
  api.post('/simulate-weekly-check').then(r => r.data);

// ── Publishing ───────────────────────────────
export const publishContent = (data) =>
  api.post('/publish', data).then(r => r.data);

export const validateLinkedInToken = (token) =>
  api.post('/validate-linkedin-token', { access_token: token }).then(r => r.data);

export default api;
