import { useState, useCallback } from 'react';
import { fetchDashboardStats } from '../services/api';

export default function useAnalytics() {
    const [metrics, setMetrics] = useState(null);
    const [funnel, setFunnel] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const { metrics: m, funnel: f } = await fetchDashboardStats();
            setMetrics(m);
            setFunnel(f);
        } catch (error) {
            /* silent — dashboard will show empty */
        } finally {
            setLoading(false);
        }
    }, []);

    return { metrics, funnel, loading, fetchAll };
}
