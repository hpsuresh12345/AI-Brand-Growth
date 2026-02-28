import { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { getStrategy, runGrowthCycle } from '../api/growthApi';
import { PageHeader, Button, Badge, EmptyState, Spinner } from '../components/ui';

export default function StrategyPlannerPage() {
    const { brand } = useBrand();
    const [strategy, setStrategy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => { if (brand?.id) fetchStrategy(); }, [brand?.id]);

    async function fetchStrategy() {
        setLoading(true);
        try { const data = await getStrategy(brand.id); setStrategy(data); }
        catch { setStrategy(null); }
        finally { setLoading(false); }
    }

    async function handleGenerate() {
        if (!brand?.id) return;
        setGenerating(true);
        try { await runGrowthCycle(brand.id); await fetchStrategy(); }
        catch (err) { console.error(err); }
        finally { setGenerating(false); }
    }

    function handleExport() {
        if (!strategy) return;
        const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `strategy-${brand?.name || 'export'}.json`; a.click();
        URL.revokeObjectURL(url);
    }

    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    const pillars = strategy?.content_pillars || [];
    const weeklyPlan = strategy?.weekly_plan || [];
    const calendar = [];
    for (let d = 1; d <= 30; d++) {
        const scheduled = weeklyPlan.find(w => w.week === Math.ceil(d / 7));
        calendar.push({ day: d, theme: scheduled?.theme || '' });
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Strategy Planner" subtitle="30-day content strategy">
                <Button variant="secondary" onClick={handleExport} disabled={!strategy}>📥 Export</Button>
                <Button onClick={handleGenerate} loading={generating}>{strategy ? '🔄 Regenerate' : '🎯 Generate Strategy'}</Button>
            </PageHeader>

            {!strategy ? (
                <EmptyState icon="🎯" title="No Strategy Yet" message="Generate a strategy to see your content pillars, weekly themes, and calendar.">
                    <Button onClick={handleGenerate} loading={generating}>Generate Strategy</Button>
                </EmptyState>
            ) : (
                <>
                    {/* Pillars */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-secondary mb-3">Content Pillars</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pillars.map((pillar, i) => (
                                <div key={i} className="glass glass-hover rounded-2xl p-4 transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                        <h4 className="text-sm font-semibold text-text-primary">{typeof pillar === 'string' ? pillar : pillar.name}</h4>
                                    </div>
                                    {pillar.description && <p className="text-xs text-text-muted mb-2">{pillar.description}</p>}
                                    {pillar.platforms && <div className="flex flex-wrap gap-1">{pillar.platforms.map((p, j) => <Badge key={j} color="purple">{p}</Badge>)}</div>}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Weekly Themes */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-secondary mb-3">Weekly Themes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {weeklyPlan.map((week, i) => (
                                <div key={i} className="glass rounded-2xl p-4">
                                    <Badge color="blue">Week {week.week || i + 1}</Badge>
                                    <h4 className="text-sm font-semibold text-text-primary mt-2">{week.theme}</h4>
                                    {week.objective && <p className="text-xs text-text-muted mt-1">{week.objective}</p>}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Calendar */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-secondary mb-3">30-Day Calendar</h3>
                        <div className="glass rounded-2xl p-4">
                            <div className="grid grid-cols-7 gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="text-[10px] font-semibold text-text-muted text-center uppercase pb-1">{d}</div>
                                ))}
                                {calendar.map(({ day, theme }) => (
                                    <div key={day} className="aspect-square rounded-xl border border-border p-1.5 text-center hover:bg-accent/10 hover:border-accent/20 transition-all duration-200 cursor-default">
                                        <p className="text-xs font-semibold text-text-primary">{day}</p>
                                        {theme && <p className="text-[8px] text-text-muted mt-0.5 truncate">{theme}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
