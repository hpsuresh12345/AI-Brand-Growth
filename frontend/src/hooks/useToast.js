import { useState, useCallback } from 'react';

export default function useToast() {
    const [toast, setToast] = useState({ message: '', type: 'error' });

    const showToast = useCallback((message, type = 'error') => {
        setToast({ message, type });
    }, []);

    const dismissToast = useCallback(() => {
        setToast({ message: '', type: 'error' });
    }, []);

    return { toast, showToast, dismissToast };
}
