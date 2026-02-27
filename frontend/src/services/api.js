/**
 * API Service — AI Real Estate Lead Conversion Engine
 *
 * Centralized Axios client with error handling.
 * All functions return unwrapped data or throw descriptive errors.
 */

import axios from 'axios';

// ── Axios Instance ─────────────────────────────────────

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // 30s — AI calls can take a moment
});

// ── Error Handler ──────────────────────────────────────

function handleError(error) {
    if (error.response) {
        // Server responded with 4xx/5xx
        const detail = error.response.data?.detail || error.response.statusText;
        const status = error.response.status;
        throw new Error(`API ${status}: ${detail}`);
    } else if (error.request) {
        // Request sent but no response (network / server down)
        throw new Error('Network error — backend may be offline');
    } else {
        throw new Error(error.message || 'Unknown API error');
    }
}

// ── Lead Endpoints ─────────────────────────────────────

/**
 * Fetch all leads with optional filters.
 * @param {{ skip?: number, limit?: number, category?: string }} params
 * @returns {Promise<{ total: number, leads: object[] }>}
 */
export async function fetchLeads(params = {}) {
    try {
        const { data } = await api.get('/leads/', { params: { limit: 50, ...params } });
        return data;
    } catch (error) {
        handleError(error);
    }
}

/**
 * Create a new lead and run AI analysis + scoring.
 * @param {{ name: string, phone: string, budget: number, location: string, ... }} leadData
 * @returns {Promise<{ lead: object, ai_analysis: object, score_breakdown: object }>}
 */
export async function createLead(leadData) {
    try {
        const { data } = await api.post('/leads/', leadData);
        return data;
    } catch (error) {
        handleError(error);
    }
}

/**
 * Re-analyze an existing lead — runs all 3 AI agents sequentially.
 * @param {number} id - Lead ID
 * @returns {Promise<{ lead: object, ai_analysis: object, score_breakdown: object }>}
 */
export async function analyzeLead(id) {
    try {
        const { data } = await api.post(`/leads/${id}/analyze`);
        return data;
    } catch (error) {
        handleError(error);
    }
}

/**
 * Fetch aggregated dashboard stats + conversion funnel.
 * @returns {Promise<{ metrics: object, funnel: object[] }>}
 */
export async function fetchDashboardStats() {
    try {
        const [metricsRes, funnelRes] = await Promise.all([
            api.get('/analytics/dashboard'),
            api.get('/analytics/conversion-funnel'),
        ]);
        return {
            metrics: metricsRes.data,
            funnel: funnelRes.data.funnel,
        };
    } catch (error) {
        handleError(error);
    }
}

// ── Additional Endpoints ───────────────────────────────

/** Fetch a single lead by ID. */
export async function fetchLead(id) {
    try {
        const { data } = await api.get(`/leads/${id}`);
        return data;
    } catch (error) {
        handleError(error);
    }
}

/** Delete a lead by ID. */
export async function deleteLead(id) {
    try {
        await api.delete(`/leads/${id}`);
    } catch (error) {
        handleError(error);
    }
}

/** Generate a WhatsApp follow-up message. */
export async function generateFollowUp(id) {
    try {
        const { data } = await api.post(`/leads/${id}/followup`);
        return data;
    } catch (error) {
        handleError(error);
    }
}

/** Predict no-show risk for a lead. */
export async function predictNoShow(id) {
    try {
        const { data } = await api.post(`/leads/${id}/no-show-risk`);
        return data;
    } catch (error) {
        handleError(error);
    }
}

export default api;
