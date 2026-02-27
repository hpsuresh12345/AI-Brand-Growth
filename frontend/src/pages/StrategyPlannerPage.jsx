import { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { getStrategy, runGrowthCycle } from '../api/growthApi';
import { PageHeader, Button, Badge, EmptyState, Spinner } from '../components/ui';

export default function StrategyPlannerPage() {
    const { brand } = useBrand();
    const [strategy, setStrategy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (brand?.id) fetchStrategy();
    }, [brand?.id]);

    async function fetchStrategy() {
        setLoading(true);
        try {
            const data = await getStrategy(brand.id);
            setStrategy(data);
        } catch {
            setStrategy(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate() {
        if (!brand?.id) return;
        setGenerating(true);
        try {
            await runGrowthCycle(brand.id);
            await fetchStrategy();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    }

    function handleExport() {
        if (!strategy) return;
        const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategy-${brand?.name || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (!brand) {
        return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    }

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
    }

    const pillars = strategy?.content_pillars || [];
    const weeklyPlan = strategy?.weekly_plan || [];
    const calendar = [];

    // Build 30-day grid
    for (let d = 1; d <= 30; d++) {
        const scheduled = weeklyPlan.find(w => {
            const weekNum = Math.ceil(d / 7);
            return w.week === weekNum;
        });
        calendar.push({ day: d, week: Math.ceil(d / 7), theme: scheduled?.theme || '' });
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Strategy Planner" subtitle="30-day content strategy">
                <Button variant="secondary" onClick={handleExport} disabled={!strategy}>📥 Export</Button>
                <Button onClick={handleGenerate} loading={generating}>
                    {strategy ? '🔄 Regenerate' : '🎯 Generate Strategy'}
                </Button>
            </PageHeader>

            {!strategy ? (
                <EmptyState
                    icon="🎯"
                    title="No Strategy Yet"
                    message="Generate a strategy to see your content pillars, weekly themes, and calendar."
                >
                    <Button onClick={handleGenerate} loading={generating}>Generate Strategy</Button>
                </EmptyState>
            ) : (
                <>
                    {/* Content Pillars */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Content Pillars</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pillars.map((pillar, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <h4 className="text-sm font-semibold text-gray-800">
                                            {typeof pillar === 'string' ? pillar : pillar.name}
                                        </h4>
                                    </div>
                                    {pillar.description && (
                                        <p className="text-xs text-gray-400 mb-2">{pillar.description}</p>
                                    )}
                                    {pillar.platforms && (
                                        <div className="flex flex-wrap gap-1">
                                            {pillar.platforms.map((p, j) => <Badge key={j} color="blue">{p}</Badge>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Weekly Themes */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Weekly Themes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {weeklyPlan.map((week, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                                    <Badge color="gray">Week {week.week || i + 1}</Badge>
                                    <h4 className="text-sm font-semibold text-gray-800 mt-2">{week.theme}</h4>
                                    {week.objective && (
                                        <p className="text-xs text-gray-400 mt-1">{week.objective}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 30-Day Calendar Grid */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">30-Day Calendar</h3>
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                            <div className="grid grid-cols-7 gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="text-[10px] font-semibold text-gray-400 text-center uppercase pb-1">{d}</div>
                                ))}
                                {calendar.map(({ day, week, theme }) => (
                                    <div
                                        key={day}
                                        className="aspect-square rounded-lg border border-gray-100 p-1.5 text-center hover:bg-blue-50 transition-colors cursor-default"
                                    >
                                        <p className="text-xs font-semibold text-gray-700">{day}</p>
                                        {theme && <p className="text-[9px] text-gray-400 mt-0.5 truncate">{theme}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Metadata */}
                    <p className="text-xs text-gray-400">Last updated: {strategy.last_updated || 'N/A'}</p>
                </>
            )}
        </div>
    );
}
