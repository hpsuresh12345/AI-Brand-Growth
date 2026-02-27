const variants = {
    Hot: 'bg-red-500/20 text-red-200 border-red-500/30 shadow-lg shadow-red-500/20 hover:bg-red-500/30 hover:scale-105',
    Warm: 'bg-amber-500/20 text-amber-200 border-amber-500/30 shadow-lg shadow-amber-500/20 hover:bg-amber-500/30 hover:scale-105',
    Cold: 'bg-blue-500/20 text-blue-200 border-blue-500/30 shadow-lg shadow-blue-500/20 hover:bg-blue-500/30 hover:scale-105',
};

const icons = {
    Hot: '🔥',
    Warm: '☀️',
    Cold: '❄️',
};

export default function Badge({ variant, children, showIcon = true }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                          font-bold tracking-wide border transition-all duration-300
                          ${variants[variant] || variants.Cold}`}>
            {showIcon && icons[variant] && <span>{icons[variant]}</span>}
            {children}
        </span>
    );
}
