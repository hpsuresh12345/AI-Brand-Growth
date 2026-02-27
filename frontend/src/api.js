/**
 * API client for the Lead Conversion Engine backend.
 */

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// ── Leads ──────────────────────────────────────

export const createLead = (leadData) =>
    api.post('/leads/', leadData).then((r) => r.data);

export const getLeads = (params = {}) =>
    api.get('/leads/', { params }).then((r) => r.data);

export const getLead = (id) =>
    api.get(`/leads/${id}`).then((r) => r.data);

export const deleteLead = (id) =>
    api.delete(`/leads/${id}`);

// ── Follow-up ──────────────────────────────────

export const generateFollowUp = (leadId) =>
    api.post(`/leads/${leadId}/followup`).then((r) => r.data);

// ── No-Show Risk ───────────────────────────────

export const predictNoShow = (leadId) =>
    api.post(`/leads/${leadId}/no-show-risk`).then((r) => r.data);

// ── Analytics ──────────────────────────────────

export const getDashboardMetrics = () =>
    api.get('/analytics/dashboard').then((r) => r.data);

export const getConversionFunnel = () =>
    api.get('/analytics/conversion-funnel').then((r) => r.data);

export default api;
