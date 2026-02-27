import { createContext, useContext, useState, useCallback } from 'react';
import { getDashboardMetrics } from '../api/growthApi';

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
    const [brand, setBrand] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);

    const selectBrand = useCallback((brandData) => {
        setBrand(brandData);
    }, []);

    const refreshMetrics = useCallback(async () => {
        if (!brand?.id) return;
        setLoading(true);
        try {
            const data = await getDashboardMetrics(brand.id);
            setMetrics(data);
        } catch (err) {
            console.error('Failed to fetch metrics:', err);
        } finally {
            setLoading(false);
        }
    }, [brand?.id]);

    return (
        <BrandContext.Provider value={{ brand, setBrand: selectBrand, metrics, refreshMetrics, loading }}>
            {children}
        </BrandContext.Provider>
    );
}

export function useBrand() {
    const ctx = useContext(BrandContext);
    if (!ctx) throw new Error('useBrand must be used within BrandProvider');
    return ctx;
}
