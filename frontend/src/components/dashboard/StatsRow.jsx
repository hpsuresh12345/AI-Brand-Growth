import StatCard from './StatCard';

export default function StatsRow({ metrics }) {
    if (!metrics) return null;

    const stats = [
        { icon: '📊', label: 'Total Leads', value: metrics.total_leads, color: '#a78bfa' },
        { icon: '🔥', label: 'Hot', value: metrics.categories?.Hot || 0, color: '#f87171' },
        { icon: '🟡', label: 'Warm', value: metrics.categories?.Warm || 0, color: '#fbbf24' },
        { icon: '🔵', label: 'Cold', value: metrics.categories?.Cold || 0, color: '#60a5fa' },
        { icon: '⚡', label: 'Avg Score', value: metrics.avg_score, color: '#34d399' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 60} />)}
        </div>
    );
}
