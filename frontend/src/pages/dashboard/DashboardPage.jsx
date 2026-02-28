import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBrand } from '../../contexts/BrandContext';
import { getDashboardMetrics, runGrowthCycle } from '../../api/growthApi';
import { KpiCard, ChartCard, AlertBanner, Badge, Button, PageHeader, Spinner, EmptyState } from '../../components/ui';

export default function DashboardPage() {
    const { brand } = useBrand();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cycleRunning, setCycleRunning] = useState(false);
    const [cycleResult, setCycleResult] = useState(null);

    useEffect(() => { if (brand?.id) fetchMetrics(); }, [brand?.id]);

    async function fetchMetrics() {
        setLoading(true);
        try {
            const data = await getDashboardMetrics(brand.id);
            setMetrics(data);
        } catch { setMetrics(null); }
        finally { setLoading(false); }
    }

    async function handleRunCycle() {
        if (!brand?.id) return;
        setCycleRunning(true);
        try {
            const result = await runGrowthCycle(brand.id);
            setCycleResult(result);
            await fetchMetrics();
        } catch (err) { console.error(err); }
        finally { setCycleRunning(false); }
    }

    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile to get started." />;
    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    const trendData = (metrics?.weekly_trend || []).map((score, i) => ({ week: `W${i + 1}`, score: (score * 100).toFixed(0) }));
    const weeklyData = trendData.length > 0 ? trendData : [{ week: 'W1', score: 0 }, { week: 'W2', score: 0 }, { week: 'W3', score: 0 }, { week: 'W4', score: 0 }];

    const chartTooltipStyle = {
        contentStyle: { background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#f1f5f9' },
        labelStyle: { color: '#94a3b8' },
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Dashboard" subtitle={`${brand.name} Growth Overview`}>
                <Button onClick={handleRunCycle} loading={cycleRunning}>🚀 Run Growth Cycle</Button>
            </PageHeader>

            {/* Cycle result banner */}
            {cycleResult && (
                <AlertBanner
                    type={cycleResult.success ? 'success' : 'warning'}
                    title={cycleResult.success ? 'Growth cycle completed!' : 'Cycle ran with warnings'}
                    message={`${cycleResult.content?.generated || 0} content pieces generated · ${cycleResult.decisions?.actions_count || 0} actions taken${cycleResult.errors?.length ? ` · ${cycleResult.errors.length} warnings` : ''}`}
                    onDismiss={() => setCycleResult(null)}
                />
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Posts" value={metrics?.total_content || 0} icon="📝" trend={5.2} />
                <KpiCard title="Avg Engagement" value={`${((metrics?.avg_engagement || 0) * 100).toFixed(0)}%`} icon="📈" trend={-2.1} />
                <KpiCard title="Strategy" value={metrics?.strategy_exists ? 'Active' : 'None'} icon="🎯" />
                <KpiCard title="System" value="Online" icon="🟢" subtitle="All agents running" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Growth Trend" subtitle="Weekly engagement score">
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Weekly Engagement" subtitle="Content performance by week">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyData}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTooltipStyle} />
                            <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}
