import { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { getDashboardMetrics } from '../api/growthApi';
import { PageHeader, Badge, Button, EmptyState, Spinner, Select } from '../components/ui';

const PLATFORM_FILTER = [
    { value: '', label: 'All Platforms' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Twitter/X', label: 'Twitter / X' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'YouTube', label: 'YouTube' },
];

// Mock content library — in production would come from a dedicated API
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
    const [sortBy, setSortBy] = useState('date');

    if (!brand) {
        return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    }

    let content = [...MOCK_CONTENT];
    if (filter) content = content.filter(c => c.platform === filter);
    if (sortBy === 'score') content.sort((a, b) => b.engagement_score - a.engagement_score);
    else content.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    function scoreColor(s) {
        if (s >= 0.6) return 'green';
        if (s >= 0.35) return 'amber';
        return 'red';
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Content Library" subtitle={`${content.length} content pieces`}>
                <Select
                    id="lib-filter"
                    options={PLATFORM_FILTER}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </PageHeader>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Topic</th>
                                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Platform</th>
                                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Engagement</th>
                                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Status</th>
                                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Date</th>
                                <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{item.topic}</td>
                                    <td className="px-5 py-3.5"><Badge color="blue">{item.platform}</Badge></td>
                                    <td className="px-5 py-3.5">
                                        <Badge color={scoreColor(item.engagement_score)}>
                                            {(item.engagement_score * 100).toFixed(0)}%
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <Badge color={item.status === 'published' ? 'green' : 'gray'}>{item.status}</Badge>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-400">{item.created_at}</td>
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
