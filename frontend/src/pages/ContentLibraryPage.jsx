import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Badge, Button, EmptyState, Select } from '../components/ui';

const PLATFORM_FILTER = [
    { value: '', label: 'All Platforms' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Twitter/X', label: 'Twitter / X' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'YouTube', label: 'YouTube' },
];

const MOCK_CONTENT = [
    { id: 1, platform: 'LinkedIn', topic: 'AI Trends 2026', engagement_score: 0.78, created_at: '2026-02-20', status: 'published' },
    { id: 2, platform: 'Twitter/X', topic: 'Quick SaaS Tip', engagement_score: 0.45, created_at: '2026-02-21', status: 'published' },
    { id: 3, platform: 'Instagram', topic: 'Behind the Scenes', engagement_score: 0.62, created_at: '2026-02-22', status: 'draft' },
    { id: 4, platform: 'LinkedIn', topic: 'Growth Hacking Guide', engagement_score: 0.31, created_at: '2026-02-23', status: 'published' },
    { id: 5, platform: 'YouTube', topic: 'Product Demo Script', engagement_score: 0.55, created_at: '2026-02-24', status: 'draft' },
];

export default function ContentLibraryPage() {
    const { brand } = useBrand();
    const [filter, setFilter] = useState('');

    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;

    let content = [...MOCK_CONTENT];
    if (filter) content = content.filter(c => c.platform === filter);

    function scoreColor(s) { return s >= 0.6 ? 'green' : s >= 0.35 ? 'amber' : 'red'; }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Content Library" subtitle={`${content.length} content pieces`}>
                <Select id="lib-filter" options={PLATFORM_FILTER} value={filter} onChange={(e) => setFilter(e.target.value)} />
            </PageHeader>

            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {['Topic', 'Platform', 'Engagement', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className={`text-${h === 'Actions' ? 'right' : 'left'} text-[11px] font-semibold text-text-muted uppercase tracking-wider px-5 py-3`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {content.map((item) => (
                                <tr key={item.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3.5 text-sm font-medium text-text-primary">{item.topic}</td>
                                    <td className="px-5 py-3.5"><Badge color="blue">{item.platform}</Badge></td>
                                    <td className="px-5 py-3.5"><Badge color={scoreColor(item.engagement_score)}>{(item.engagement_score * 100).toFixed(0)}%</Badge></td>
                                    <td className="px-5 py-3.5"><Badge color={item.status === 'published' ? 'green' : 'gray'}>{item.status}</Badge></td>
                                    <td className="px-5 py-3.5 text-xs text-text-muted">{item.created_at}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="sm">✏️ Edit</Button>
                                            <Button variant="ghost" size="sm">💡 Optimize</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
