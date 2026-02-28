import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Badge, EmptyState } from '../components/ui';

export default function ReportsPage() {
    const { brand } = useBrand();
    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Reports" subtitle="Executive summary and performance reports" />

            <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Executive Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Strategy Status</p><div className="mt-1 flex items-center gap-2"><Badge color="green">Active</Badge><span className="text-sm text-text-secondary">Pillars deployed</span></div></div>
                    <div><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Content Generated</p><p className="text-2xl font-bold text-text-primary mt-1">—</p><p className="text-xs text-text-muted">Total this month</p></div>
                    <div><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Avg Engagement</p><p className="text-2xl font-bold text-text-primary mt-1">—</p><p className="text-xs text-text-muted">Across platforms</p></div>
                </div>
            </div>

            <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Actions Taken</h3>
                <div className="space-y-3">
                    {[
                        { action: 'Growth cycle executed', time: 'Today', done: true },
                        { action: 'Strategy generated', time: 'Today', done: true },
                        { action: 'Content batch created', time: 'Today', done: true },
                        { action: 'Engagement analysis run', time: 'Pending', done: false },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${item.done ? 'bg-success' : 'bg-text-muted/30'}`} />
                            <span className="text-sm text-text-secondary flex-1">{item.action}</span>
                            <span className="text-xs text-text-muted">{item.time}</span>
                            <Badge color={item.done ? 'green' : 'gray'}>{item.done ? 'completed' : 'pending'}</Badge>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-xs text-text-muted/30 text-center">PDF export coming soon</p>
        </div>
    );
}
