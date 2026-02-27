import { useEffect } from 'react';

export default function Modal({ open, onClose, children, className = '' }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
            onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            {/* Content */}
            <div
                className={`relative z-10 w-full max-w-xl bg-surface-card/90 backdrop-blur-2xl
          border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40
          animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

export function ModalHeader({ children, onClose }) {
    return (
        <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex items-center gap-3">{children}</div>
            {onClose && (
                <button onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center
            text-text-muted hover:text-text-primary hover:bg-white/[0.08] transition-all text-sm">
                    ✕
                </button>
            )}
        </div>
    );
}

export function ModalBody({ children, className = '' }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}
