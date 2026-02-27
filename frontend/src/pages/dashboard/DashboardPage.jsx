import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBrand } from '../../contexts/BrandContext';
import { getDashboardMetrics, runGrowthCycle } from '../../api/growthApi';
import { KpiCard, ChartCard, AlertBanner, Badge, Button, PageHeader, Spinner, EmptyState } from '../../components/ui';

export default function DashboardPage() {
    const { brand } = useBrand();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cycleLoading, setCycleLoading] = useState(false);
    const [cycleResult, setCycleResult] = useState(null);

    useEffect(() => {
        if (brand?.id) fetchMetrics();
    }, [brand?.id]);

    async function fetchMetrics() {
        setLoading(true);
        try {
            const data = await getDashboardMetrics(brand.id);
            setMetrics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRunCycle() {
        if (!brand?.id) return;
        setCycleLoading(true);
        try {
            const result = await runGrowthCycle(brand.id);
            setCycleResult(result);
            fetchMetrics();
        } catch (err) {
            console.error(err);
        } finally {
            setCycleLoading(false);
        }
    }

    if (!brand) {
        return (
            <EmptyState
                icon="🏢"
                title="No Brand Selected"
                message="Create a brand profile first to see your dashboard."
            />
        );
    }

    if (loading && !metrics) {
        return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
    }

    const weeklyData = (metrics?.weekly_trend || []).map((val, i) => ({
        week: `W${i + 1}`,
        engagement: +(val * 100).toFixed(1),
    }));

    const currentWeek = weeklyData[weeklyData.length - 1]?.engagement || 0;
    const prevWeek = weeklyData[weeklyData.length - 2]?.engagement || 0;
    const trend = prevWeek > 0 ? ((currentWeek - prevWeek) / prevWeek * 100) : 0;

    return (
        <div className="space-y-6">
            <PageHeader title="Dashboard" subtitle={`Growth overview for ${brand.name}`}>
                <Button onClick={handleRunCycle} loading={cycleLoading}>
                    🚀 Run Growth Cycle
                </Button>
            </PageHeader>

            {/* AI Recommendation Banner */}
            {cycleResult && (
                <AlertBanner
                    type={cycleResult.success ? 'success' : 'warning'}
                    title={cycleResult.success ? 'Growth Cycle Complete' : 'Cycle Completed with Issues'}
                    message={`Generated ${cycleResult.content?.generated || 0} content pieces. ${cycleResult.decisions?.actions_count || 0} optimisation actions identified.`}
                    onDismiss={() => setCycleResult(null)}
                />
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total Posts"
                    value={metrics?.total_content || 0}
                    icon="📝"
                    subtitle="Generated content pieces"
                />
                <KpiCard
                    title="Avg Engagement"
                    value={`${((metrics?.avg_engagement || 0) * 100).toFixed(1)}%`}
                    icon="📊"
                    trend={trend}
                    subtitle="Engagement score"
                />
                <KpiCard
                    title="Active Pillars"
                    value={metrics?.strategy_exists ? '✓ Active' : '—'}
                    icon="🎯"
                    subtitle={metrics?.strategy_exists ? 'Strategy deployed' : 'No strategy yet'}
                />
                <KpiCard
                    title="Monitoring"
                    value={<Badge color="green">Online</Badge>}
                    icon="🔔"
                    subtitle="Weekly checks enabled"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Growth Trend" subtitle="Weekly engagement over time">
                    {weeklyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
                                />
                                <Area type="monotone" dataKey="engagement" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-gray-400 py-10 text-center">No trend data yet</p>
                    )}
                </ChartCard>

                <ChartCard title="Weekly Engagement" subtitle="Engagement by week">
                    {weeklyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
                                />
                                <Bar dataKey="engagement" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-gray-400 py-10 text-center">No engagement data yet</p>
                    )}
                </ChartCard>
            </div>

            {/* Recent alerts placeholder */}
            {metrics?.recent_alerts?.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700">Recent Alerts</h3>
                    {metrics.recent_alerts.map((alert, i) => (
                        <AlertBanner key={i} type={alert.level} title={alert.title} message={alert.detail} />
                    ))}
                </div>
            )}
        </div>
    );
}
