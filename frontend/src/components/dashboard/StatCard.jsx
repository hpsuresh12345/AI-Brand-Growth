import Card from '../ui/Card';

export default function StatCard({ icon, label, value, color, delay = 0 }) {
    return (
        <Card hover={false} className="p-5 text-center group cursor-default"
            style={{ animationDelay: `${delay}ms` }}>
            <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3
        transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}15` }}>
                {icon}
            </div>
            <p className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</p>
            <p className="text-[11px] text-text-muted mt-1 font-medium uppercase tracking-wider">{label}</p>
        </Card>
    );
}
