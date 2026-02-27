import { useEffect } from 'react';

const styles = {
    error: 'border-red-500/25 bg-red-500/8 text-red-300',
    success: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-300',
    info: 'border-primary/25 bg-primary/8 text-primary-light',
};

export default function Toast({ message, type = 'error', onDismiss, duration = 5000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onDismiss]);

    if (!message) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${styles[type]}`}>
                <span className="text-base mt-0.5">{type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}</span>
                <p className="text-sm flex-1 font-medium leading-relaxed">{message}</p>
                <button onClick={onDismiss} className="text-current/50 hover:text-current text-xs mt-0.5">✕</button>
            </div>
        </div>
    );
}
