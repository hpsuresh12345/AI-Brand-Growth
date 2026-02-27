import { useState, useCallback } from 'react';
import { fetchLeads as apiFetchLeads, createLead as apiCreateLead, deleteLead as apiDeleteLead, analyzeLead as apiAnalyzeLead, generateFollowUp as apiFollowUp, predictNoShow as apiNoShow } from '../services/api';

export default function useLeads() {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLeads = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Fetching leads with params:', params);
            const data = await apiFetchLeads({ limit: 50, ...params });
            console.log('✅ Fetched leads:', data.leads.length, 'total:', data.total);
            setLeads(data.leads);
            setTotal(data.total);
        } catch (err) {
            console.error('❌ Failed to fetch leads:', err);
            setError(err.message || 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }, []);

    const addLead = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('📤 Creating lead:', formData);
            const result = await apiCreateLead(formData);
            console.log('✅ Lead created:', result.lead);
            console.log('🔄 Refreshing leads list...');
            await fetchLeads();
            console.log('✅ Leads list refreshed, total leads:', leads.length);
            return result;
        } catch (err) {
            console.error('❌ Failed to create lead:', err);
            const msg = err.message || 'Failed to create lead';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [fetchLeads, leads.length]);

    const removeLead = useCallback(async (id) => {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        try {
            await apiDeleteLead(id);
        } catch (err) {
            setError('Failed to delete lead');
            await fetchLeads();
        }
    }, [fetchLeads]);

    const reAnalyze = useCallback(async (id) => {
        try {
            const result = await apiAnalyzeLead(id);
            await fetchLeads();
            return result;
        } catch (err) {
            const msg = err.message || 'Re-analysis failed';
            setError(msg);
            throw new Error(msg);
        }
    }, [fetchLeads]);

    const followUp = useCallback(async (id) => {
        try {
            return await apiFollowUp(id);
        } catch (err) {
            const msg = err.message || 'Follow-up generation failed';
            setError(msg);
            throw new Error(msg);
        }
    }, []);

    const noShowRisk = useCallback(async (id) => {
        try {
            return await apiNoShow(id);
        } catch (err) {
            const msg = err.message || 'No-show prediction failed';
            setError(msg);
            throw new Error(msg);
        }
    }, []);

    return {
        leads, total, loading, error,
        fetchLeads, addLead, removeLead, reAnalyze, followUp, noShowRisk,
        clearError: () => setError(null),
    };
}
