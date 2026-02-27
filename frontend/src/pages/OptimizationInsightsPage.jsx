import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Badge, Button, EmptyState } from '../components/ui';

const RECOMMENDATIONS = [
    {
        priority: 1,
        action_type: 'optimize_content',
        title: 'Rewrite underperforming LinkedIn posts',
        detail: '3 posts scored below 30% engagement. Strengthen hooks, add clear CTAs, and improve formatting.',
        impact: 'high',
        suggested_shift: 'Move from text-only to carousel format for educational content.',
    },
    {
        priority: 2,
        action_type: 'adjust_pillars',
        title: 'Replace "Company News" pillar',
        detail: 'Company news consistently underperforms. Replace with "Customer Stories" pillar for higher engagement.',
        impact: 'high',
        suggested_shift: 'Shift from company-centric to customer-centric storytelling.',
    },
    {
        priority: 3,
        action_type: 'ab_test',
        title: 'A/B test posting times',
        detail: 'Current posts published at 9 AM get 40% less engagement than noon posts. Test 12–2 PM slot.',
        impact: 'medium',
        suggested_shift: 'Reschedule LinkedIn posts from 9 AM to 12:30 PM.',
    },
    {
        priority: 3,
        action_type: 'optimize_content',
        title: 'Add video content to Instagram',
        detail: 'Instagram Reels average 3x the engagement of static posts. Add 2 Reels per week.',
        impact: 'medium',
        suggested_shift: 'Allocate 2 weekly slots to short-form video content.',
    },
    {
        priority: 4,
        action_type: 'replace_pillars',
        title: 'Diversify Twitter/X content types',
        detail: 'Thread format drives 2x engagement vs single tweets. Convert key insights into threads.',
        impact: 'low',
        suggested_shift: 'Package longer insights as 5–7 tweet threads with numbered format.',
    },
];

const IMPACT_COLORS = { high: 'red', medium: 'amber', low: 'blue' };
const PRIORITY_LABELS = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' };
const PRIORITY_COLORS = { 1: 'red', 2: 'amber', 3: 'blue', 4: 'gray' };

export default function OptimizationInsightsPage() {
    const { brand } = useBrand();

    if (!brand) {
        return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Optimization Insights" subtitle="AI-ranked recommendations to improve growth">
                <Button variant="secondary">📥 Export</Button>
            </PageHeader>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{RECOMMENDATIONS.length}</p>
                    <p className="text-xs text-gray-400">Total Recommendations</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{RECOMMENDATIONS.filter(r => r.priority <= 2).length}</p>
                    <p className="text-xs text-gray-400">High Priority</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{RECOMMENDATIONS.filter(r => r.impact === 'high').length}</p>
                    <p className="text-xs text-gray-400">High Impact</p>
                </div>
            </div>

            {/* Recommendation list */}
            <div className="space-y-3">
                {RECOMMENDATIONS.map((rec, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge color={PRIORITY_COLORS[rec.priority]}>{PRIORITY_LABELS[rec.priority]}</Badge>
                                    <Badge color={IMPACT_COLORS[rec.impact]}>{rec.impact} impact</Badge>
                                    <Badge color="gray">{rec.action_type.replace('_', ' ')}</Badge>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-800">{rec.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{rec.detail}</p>

                                {rec.suggested_shift && (
                                    <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                                        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Suggested Shift</p>
                                        <p className="text-xs text-blue-800">{rec.suggested_shift}</p>
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" size="sm">Apply</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
