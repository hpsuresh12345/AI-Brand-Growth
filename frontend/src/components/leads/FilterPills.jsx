const FILTERS = [
    { key: null, label: 'All', icon: '📊' },
    { key: 'Hot', label: 'Hot', icon: '🔥' },
    { key: 'Warm', label: 'Warm', icon: '🟡' },
    { key: 'Cold', label: 'Cold', icon: '🔵' },
];

export default function FilterPills({ active, onChange, leads = [] }) {
    const counts = leads.reduce((acc, l) => {
        acc[l.category] = (acc[l.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => {
                const isActive = active === f.key;
                const count = f.key ? counts[f.key] || 0 : leads.length;
                return (
                    <button key={f.key ?? 'all'} onClick={() => onChange(f.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200
              flex items-center gap-1.5
              ${isActive
                                ? 'bg-primary/12 text-primary-light border-primary/25 shadow-sm shadow-primary/8'
                                : 'bg-transparent text-text-muted border-white/[0.06] hover:border-white/[0.12] hover:text-text-secondary'}`}>
                        <span>{f.icon}</span> {f.label}
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px]
              ${isActive ? 'bg-primary/15' : 'bg-white/[0.04]'}`}>{count}</span>
                    </button>
                );
            })}
        </div>
    );
}
