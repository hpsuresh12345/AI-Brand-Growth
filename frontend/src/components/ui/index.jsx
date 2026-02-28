export function KpiCard({ title, value, subtitle, icon, trend }) {
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;

    return (
        <div className="glass glass-hover rounded-2xl p-5 transition-all duration-300 hover:glow-sm animate-fade-in group">
            <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                    {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
                </div>
                {icon && (
                    <div className="w-11 h-11 rounded-xl bg-accent-glow flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                )}
            </div>
            {trend !== undefined && trend !== null && (
                <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-text-muted'}`}>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${isPositive ? 'bg-success/15' : isNegative ? 'bg-danger/15' : 'bg-text-muted/15'}`}>
                        {isPositive ? '↑' : isNegative ? '↓' : '→'}
                    </span>
                    <span>{Math.abs(trend).toFixed(1)}% vs last week</span>
                </div>
            )}
        </div>
    );
}

export function ChartCard({ title, subtitle, children, action }) {
    return (
        <div className="glass rounded-2xl p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                    {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export function AlertBanner({ type = 'info', title, message, onDismiss }) {
    const styles = {
        critical: 'bg-danger/10 border-danger/20 text-red-300',
        warning: 'bg-warning/10 border-warning/20 text-amber-300',
        info: 'bg-accent/10 border-accent/20 text-indigo-300',
        success: 'bg-success/10 border-success/20 text-emerald-300',
    };
    const icons = { critical: '🔴', warning: '🟡', info: '💡', success: '✅' };

    return (
        <div className={`rounded-xl border p-4 animate-fade-in ${styles[type] || styles.info}`}>
            <div className="flex items-start gap-3">
                <span className="text-base shrink-0 mt-0.5">{icons[type] || icons.info}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{title}</p>
                    {message && <p className="text-xs mt-1 opacity-75">{message}</p>}
                </div>
                {onDismiss && (
                    <button onClick={onDismiss} className="text-sm opacity-40 hover:opacity-100 transition-opacity">✕</button>
                )}
            </div>
        </div>
    );
}

export function Modal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative glass rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto glow-sm animate-fade-in">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-sm',
    };
    const variants = {
        primary: 'bg-gradient-to-r from-accent to-indigo-500 text-white hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]',
        secondary: 'bg-white/5 text-text-secondary border border-border hover:bg-white/10 hover:text-text-primary hover:border-border-hover',
        ghost: 'text-text-muted hover:text-text-primary hover:bg-white/5',
        danger: 'bg-danger/15 text-red-400 border border-danger/20 hover:bg-danger/25',
    };

    return (
        <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
            {loading && <Spinner size="sm" />}
            {children}
        </button>
    );
}

export function Badge({ children, color = 'blue' }) {
    const colors = {
        blue: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
        green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
        red: 'bg-red-500/15 text-red-400 border-red-500/20',
        gray: 'bg-white/5 text-text-secondary border-border',
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${colors[color] || colors.gray}`}>
            {children}
        </span>
    );
}

export function Input({ label, id, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={id} className="block text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>}
            <input
                id={id}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/[0.03] text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all hover:border-border-hover"
                {...props}
            />
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

export function Select({ label, id, options, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={id} className="block text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>}
            <select
                id={id}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-card text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all hover:border-border-hover"
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

export function Textarea({ label, id, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={id} className="block text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>}
            <textarea
                id={id}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/[0.03] text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all resize-y hover:border-border-hover"
                {...props}
            />
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

export function Spinner({ size = 'md' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return (
        <div className={`${sizes[size]} border-2 border-accent/20 border-t-accent rounded-full animate-spin`} />
    );
}

export function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl font-bold text-text-primary">{title}</h1>
                {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}

export function EmptyState({ icon, title, message, children }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            {icon && <div className="text-4xl mb-4 opacity-60">{icon}</div>}
            <h3 className="text-base font-semibold text-text-secondary">{title}</h3>
            {message && <p className="text-sm text-text-muted mt-1 max-w-sm">{message}</p>}
            {children && <div className="mt-5">{children}</div>}
        </div>
    );
}
