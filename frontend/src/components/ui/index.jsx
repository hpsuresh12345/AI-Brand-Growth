export function KpiCard({ title, value, subtitle, icon, trend }) {
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">
                        {icon}
                    </div>
                )}
            </div>
            {trend !== undefined && trend !== null && (
                <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-gray-400'}`}>
                    <span>{isPositive ? '↑' : isNegative ? '↓' : '→'}</span>
                    <span>{Math.abs(trend).toFixed(1)}% vs last week</span>
                </div>
            )}
        </div>
    );
}

export function ChartCard({ title, subtitle, children, action }) {
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export function AlertBanner({ type = 'info', title, message, onDismiss }) {
    const styles = {
        critical: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };
    const icons = { critical: '🔴', warning: '🟡', info: 'ℹ️', success: '✅' };

    return (
        <div className={`rounded-xl border p-4 ${styles[type] || styles.info}`}>
            <div className="flex items-start gap-3">
                <span className="text-base shrink-0 mt-0.5">{icons[type] || icons.info}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    {message && <p className="text-xs mt-1 opacity-80">{message}</p>}
                </div>
                {onDismiss && (
                    <button onClick={onDismiss} className="text-sm opacity-50 hover:opacity-100 transition-opacity">✕</button>
                )}
            </div>
        </div>
    );
}

export function Modal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, ...props }) {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-sm',
    };
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    return (
        <button className={`${base} ${sizes[size]} ${variants[variant]}`} disabled={disabled || loading} {...props}>
            {loading && <Spinner size="sm" />}
            {children}
        </button>
    );
}

export function Badge({ children, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        gray: 'bg-gray-50 text-gray-600 border-gray-100',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors[color] || colors.gray}`}>
            {children}
        </span>
    );
}

export function Input({ label, id, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={id} className="block text-xs font-medium text-gray-600">{label}</label>}
            <input
                id={id}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function Select({ label, id, options, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={id} className="block text-xs font-medium text-gray-600">{label}</label>}
            <select
                id={id}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function Textarea({ label, id, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={id} className="block text-xs font-medium text-gray-600">{label}</label>}
            <textarea
                id={id}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-y"
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function Spinner({ size = 'md' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return (
        <div className={`${sizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
    );
}

export function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}

export function EmptyState({ icon, title, message, children }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {icon && <div className="text-4xl mb-4">{icon}</div>}
            <h3 className="text-base font-semibold text-gray-700">{title}</h3>
            {message && <p className="text-sm text-gray-400 mt-1 max-w-sm">{message}</p>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
