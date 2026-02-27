import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Badge, EmptyState } from '../components/ui';

export default function ReportsPage() {
    const { brand } = useBrand();

    if (!brand) {
        return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Reports" subtitle="Executive summary and performance reports" />

            {/* Summary card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Executive Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Strategy Status</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge color="green">Active</Badge>
                            <span className="text-sm text-gray-600">Pillars deployed</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Content Generated</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">—</p>
                        <p className="text-xs text-gray-400">Total pieces this month</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Avg Engagement</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">—</p>
                        <p className="text-xs text-gray-400">Across all platforms</p>
                    </div>
                </div>
            </div>

            {/* Actions timeline */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Actions Taken</h3>
                <div className="space-y-3">
                    {[
                        { action: 'Growth cycle executed', time: 'Today', badge: 'completed' },
                        { action: 'Strategy generated', time: 'Today', badge: 'completed' },
                        { action: 'Content batch created', time: 'Today', badge: 'completed' },
                        { action: 'Engagement analysis run', time: 'Pending', badge: 'pending' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${item.badge === 'completed' ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                            <span className="text-sm text-gray-700 flex-1">{item.action}</span>
                            <span className="text-xs text-gray-400">{item.time}</span>
                            <Badge color={item.badge === 'completed' ? 'green' : 'gray'}>{item.badge}</Badge>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-xs text-gray-300 text-center">PDF export coming soon</p>
        </div>
    );
}
