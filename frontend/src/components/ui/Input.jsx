export default function Input({ 
    label, 
    className = '', 
    error = false, 
    success = false,
    helperText = '',
    icon = null,
    ...props 
}) {
    const getInputStyles = () => {
        if (error) {
            return `border-red-500/50 focus:border-red-500 focus:ring-red-500/20 
                    bg-red-500/5`;
        }
        if (success) {
            return `border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20 
                    bg-emerald-500/5`;
        }
        return `border-white/[0.08] focus:border-violet-500/60 focus:ring-violet-500/15 
                hover:border-white/[0.14] bg-white/[0.03] focus:bg-white/[0.05]`;
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-xs text-slate-400 mb-2 font-medium transition-colors">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full px-4 py-3 
                        ${icon ? 'pl-10' : ''} 
                        rounded-xl
                        text-slate-100 text-sm font-medium
                        placeholder-slate-500/60
                        outline-none 
                        transition-all duration-300
                        ring-2 ring-transparent
                        ${getInputStyles()}
                        ${className}
                    `}
                    {...props}
                />
                {success && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                {error && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}
            </div>
            {helperText && (
                <p className={`mt-1.5 text-xs font-medium ${error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
}
