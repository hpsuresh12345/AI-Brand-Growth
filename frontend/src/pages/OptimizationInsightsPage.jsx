import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Badge, Button, EmptyState } from '../components/ui';

const RECOMMENDATIONS = [
    { priority: 1, action_type: 'optimize_content', title: 'Rewrite underperforming LinkedIn posts', detail: '3 posts scored below 30%. Strengthen hooks, add clear CTAs.', impact: 'high', suggested_shift: 'Move from text-only to carousel format.' },
    { priority: 2, action_type: 'adjust_pillars', title: 'Replace "Company News" pillar', detail: 'Replace with "Customer Stories" for higher engagement.', impact: 'high', suggested_shift: 'Shift to customer-centric storytelling.' },
    { priority: 3, action_type: 'ab_test', title: 'A/B test posting times', detail: 'Morning posts get 40% less engagement than noon. Test 12–2 PM.', impact: 'medium', suggested_shift: 'Reschedule posts to 12:30 PM.' },
    { priority: 3, action_type: 'optimize_content', title: 'Add video content to Instagram', detail: 'Reels average 3x engagement of static posts. Add 2 per week.', impact: 'medium', suggested_shift: 'Allocate 2 weekly slots to Reels.' },
    { priority: 4, action_type: 'replace_pillars', title: 'Diversify Twitter/X content', detail: 'Threads drive 2x engagement vs single tweets.', impact: 'low', suggested_shift: 'Convert insights into 5–7 tweet threads.' },
];

const IMPACT = { high: 'red', medium: 'amber', low: 'blue' };
const PRIO = { 1: ['Critical', 'red'], 2: ['High', 'amber'], 3: ['Medium', 'blue'], 4: ['Low', 'gray'] };

export default function OptimizationInsightsPage() {
    const { brand } = useBrand();
    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Optimization Insights" subtitle="AI-ranked recommendations to improve growth">
                <Button variant="secondary">📥 Export</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-text-primary">{RECOMMENDATIONS.length}</p><p className="text-xs text-text-muted">Total</p></div>
                <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-danger">{RECOMMENDATIONS.filter(r => r.priority <= 2).length}</p><p className="text-xs text-text-muted">High Priority</p></div>
                <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-success">{RECOMMENDATIONS.filter(r => r.impact === 'high').length}</p><p className="text-xs text-text-muted">High Impact</p></div>
            </div>

            <div className="space-y-3">
                {RECOMMENDATIONS.map((rec, i) => (
                    <div key={i} className="glass glass-hover rounded-2xl p-5 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge color={PRIO[rec.priority][1]}>{PRIO[rec.priority][0]}</Badge>
                                    <Badge color={IMPACT[rec.impact]}>{rec.impact} impact</Badge>
                                    <Badge color="gray">{rec.action_type.replace('_', ' ')}</Badge>
                                </div>
                                <h4 className="text-sm font-semibold text-text-primary">{rec.title}</h4>
                                <p className="text-xs text-text-muted mt-1">{rec.detail}</p>
                                {rec.suggested_shift && (
                                    <div className="mt-3 bg-accent/10 rounded-xl px-3 py-2 border border-accent/15">
                                        <p className="text-[10px] font-semibold text-accent-light uppercase tracking-wider mb-0.5">Suggested Shift</p>
                                        <p className="text-xs text-text-secondary">{rec.suggested_shift}</p>
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
