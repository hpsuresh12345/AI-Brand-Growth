/**
 * API client for the Lead Conversion Engine backend.
 * Single Axios instance with all endpoint functions.
 */

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// ── Leads ──────────────────────────────────────

export const createLead = (data) =>
    api.post('/leads/', data).then((r) => r.data);

export const getLeads = (params = {}) =>
    api.get('/leads/', { params }).then((r) => r.data);

export const getLead = (id) =>
    api.get(`/leads/${id}`).then((r) => r.data);

export const deleteLead = (id) =>
    api.delete(`/leads/${id}`);

export const analyzeLead = (id) =>
    api.post(`/leads/${id}/analyze`).then((r) => r.data);

// ── Follow-up ──────────────────────────────────

export const generateFollowUp = (id) =>
    api.post(`/leads/${id}/followup`).then((r) => r.data);

// ── No-Show Risk ───────────────────────────────

export const predictNoShow = (id) =>
    api.post(`/leads/${id}/no-show-risk`).then((r) => r.data);

// ── Analytics ──────────────────────────────────

export const getDashboardMetrics = () =>
    api.get('/analytics/dashboard').then((r) => r.data);

export const getConversionFunnel = () =>
    api.get('/analytics/conversion-funnel').then((r) => r.data);

export default api;
