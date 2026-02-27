import { useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import useAnalytics from '../hooks/useAnalytics';
import Card from '../components/ui/Card';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';

/* ──────────────────────────────────────────────────────
   KPI Stat Card (local — dashboard-specific)
   ────────────────────────────────────────────────────── */
function KpiCard({ icon, label, value, delta, deltaType, accentColor, delay = 0 }) {
    return (
        <Card hover={false}
            glow
            className="p-5 group cursor-default animate-fadeIn relative overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}>
            {/* Gradient background on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ 
                     background: `radial-gradient(circle at 50% 120%, ${accentColor}15, transparent 70%)`
                 }} />
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl
                                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
                                    shadow-lg"
                        style={{ 
                            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
                            border: `1px solid ${accentColor}30`
                        }}>
                        {icon}
                    </div>
                    {delta != null && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all
                                          group-hover:scale-105
                            ${deltaType === 'up'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : deltaType === 'down'
                                    ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                                    : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'}`}>
                            {deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '—'} {delta}
                        </span>
                    )}
                </div>
                <p className="text-3xl font-extrabold tracking-tight mb-1 
                              group-hover:scale-105 transition-transform origin-left"
                   style={{ color: accentColor }}>
                    {value}
                </p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {label}
                </p>
            </div>
        </Card>
    );
}

/* ──────────────────────────────────────────────────────
   Custom Recharts Tooltip
   ────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/[0.08]
      rounded-xl px-4 py-3 shadow-2xl text-xs">
            <p className="font-semibold text-slate-200 mb-1">{d.stage}</p>
            <p className="text-slate-400">
                <span className="font-bold text-slate-200">{d.count}</span> leads ·{' '}
                <span className="font-bold" style={{ color: d.color }}>{d.percentage}%</span>
            </p>
        </div>
    );
}

/* ──────────────────────────────────────────────────────
   Dashboard Page
   ────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const { metrics, funnel, loading, fetchAll } = useAnalytics();

    useEffect(() => { 
        fetchAll(); 
    }, [fetchAll]);

    /* ── Derived KPIs ── */
    const hotPct = useMemo(() => {
        if (!metrics?.total_leads) return '0%';
        return `${Math.round(((metrics.categories?.Hot || 0) / metrics.total_leads) * 100)}%`;
    }, [metrics]);

    const estimatedRevenue = useMemo(() => {
        if (!metrics?.total_leads) return '₹0';
        const avgDeal = 5500000; // ₹55L average deal in Indian RE
        const hotLeads = metrics.categories?.Hot || 0;
        const warmLeads = metrics.categories?.Warm || 0;
        const revenue = (hotLeads * avgDeal * 0.6) + (warmLeads * avgDeal * 0.25);
        if (revenue >= 10000000) return `₹${(revenue / 10000000).toFixed(1)}Cr`;
        if (revenue >= 100000) return `₹${(revenue / 100000).toFixed(0)}L`;
        return `₹${revenue.toLocaleString('en-IN')}`;
    }, [metrics]);

    const commission = useMemo(() => {
        if (!metrics?.total_leads) return '₹0';
        const avgDeal = 5500000;
        const hotLeads = metrics.categories?.Hot || 0;
        const warmLeads = metrics.categories?.Warm || 0;
        const revenue = (hotLeads * avgDeal * 0.6) + (warmLeads * avgDeal * 0.25);
        const comm = revenue * 0.02; // 2% brokerage
        if (comm >= 100000) return `₹${(comm / 100000).toFixed(1)}L`;
        if (comm >= 1000) return `₹${(comm / 1000).toFixed(0)}K`;
        return `₹${Math.round(comm).toLocaleString('en-IN')}`;
    }, [metrics]);

    /* ── Funnel chart data ── */
    const COLORS = ['#a78bfa', '#f87171', '#34d399', '#60a5fa', '#fbbf24'];
    const funnelData = useMemo(() =>
        (funnel || []).map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] })),
        [funnel]
    );

    /* ── Skeleton ── */
    if (loading && !metrics) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>
                <ChartSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── KPI Cards Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon="👥" label="Total Leads"
                    value={metrics?.total_leads ?? 0}
                    delta="+12%" deltaType="up"
                    accentColor="#a78bfa" delay={0}
                />
                <KpiCard
                    icon="🔥" label="Hot Leads"
                    value={hotPct}
                    delta={`${metrics?.categories?.Hot ?? 0} leads`} deltaType="up"
                    accentColor="#f87171" delay={60}
                />
                <KpiCard
                    icon="💰" label="Est. Revenue"
                    value={estimatedRevenue}
                    delta="Pipeline" deltaType={null}
                    accentColor="#34d399" delay={120}
                />
                <KpiCard
                    icon="🏦" label="Commission"
                    value={commission}
                    delta="2% brokerage" deltaType={null}
                    accentColor="#fbbf24" delay={180}
                />
            </div>

            {/* ── Secondary Stats Row ── */}
            <div className="grid grid-cols-3 gap-4">
                <Card hover={false} glow className="p-6 text-center group animate-fadeIn" 
                      style={{ animationDelay: '250ms' }}>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                        Avg Score
                    </p>
                    <p className="text-4xl font-extrabold text-violet-400 group-hover:scale-110 
                                  transition-transform">
                        {metrics?.avg_score ?? '—'}
                    </p>
                    <div className="mt-3 h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full
                                        group-hover:animate-pulse"
                             style={{ width: `${(metrics?.avg_score || 0)}%` }} />
                    </div>
                </Card>
                <Card hover={false} glow className="p-6 text-center group animate-fadeIn" 
                      style={{ animationDelay: '300ms' }}>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                        Avg Conversion
                    </p>
                    <p className="text-4xl font-extrabold text-emerald-400 group-hover:scale-110 
                                  transition-transform">
                        {metrics?.avg_conversion != null ? `${Math.round(metrics.avg_conversion * 100)}%` : '—'}
                    </p>
                    <div className="mt-3 h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full
                                        group-hover:animate-pulse"
                             style={{ width: `${Math.round((metrics?.avg_conversion || 0) * 100)}%` }} />
                    </div>
                </Card>
                <Card hover={false} glow className="p-6 text-center group animate-fadeIn" 
                      style={{ animationDelay: '350ms' }}>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                        Avg No-Show Risk
                    </p>
                    <p className="text-4xl font-extrabold text-amber-400 group-hover:scale-110 
                                  transition-transform">
                        {metrics?.avg_no_show != null ? `${Math.round(metrics.avg_no_show * 100)}%` : '—'}
                    </p>
                    <div className="mt-3 h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full
                                        group-hover:animate-pulse"
                             style={{ width: `${Math.round((metrics?.avg_no_show || 0) * 100)}%` }} />
                    </div>
                </Card>
            </div>

            {/* ── Conversion Funnel Chart ── */}
            <Card hover={false} glow className="p-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                            <span className="text-2xl">🔻</span> 
                            <span className="bg-gradient-to-r from-violet-400 to-blue-400 
                                            bg-clip-text text-transparent">
                                Conversion Funnel
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Lead progression through pipeline stages</p>
                    </div>
                    <button onClick={fetchAll}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white 
                                   px-4 py-2 rounded-lg border border-slate-600/30 
                                   hover:bg-slate-700/30 hover:border-slate-500/50
                                   transition-all duration-300 group">
                        <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {funnelData.length > 0 ? (
                    <div className="relative">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 30 }}
                                barCategoryGap="28%">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"
                                    horizontal={false} />
                                <XAxis type="number" domain={[0, 100]}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`} />
                                <YAxis dataKey="stage" type="category" width={110}
                                    tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="percentage" radius={[0, 8, 8, 0]} maxBarSize={36}
                                    animationDuration={1200} animationEasing="ease-out">
                                    {funnelData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                        <div className="text-6xl mb-4 float-animation">📊</div>
                        <p className="text-base font-semibold text-slate-300 mb-2">No funnel data yet</p>
                        <p className="text-sm text-slate-500">Submit some leads to see your conversion funnel</p>
                    </div>
                )}
            </Card>

            {/* ── Top Leads Table ── */}
            {metrics?.top_leads?.length > 0 && (
                <Card hover={false} glow className="p-6 animate-fadeIn" style={{ animationDelay: '450ms' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                            <span className="text-2xl">🏆</span> 
                            <span className="bg-gradient-to-r from-amber-400 to-orange-400 
                                            bg-clip-text text-transparent">
                                Top Performing Leads
                            </span>
                        </h3>
                        <span className="text-xs text-slate-500 px-3 py-1.5 bg-slate-700/30 rounded-lg 
                                        border border-slate-600/30">
                            Best {metrics.top_leads.length} Leads
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase tracking-wider 
                                               border-b border-slate-700/50">
                                    <th className="text-left pb-4 font-semibold">Name</th>
                                    <th className="text-left pb-4 font-semibold">Location</th>
                                    <th className="text-center pb-4 font-semibold">Score</th>
                                    <th className="text-center pb-4 font-semibold">Category</th>
                                    <th className="text-right pb-4 font-semibold">Conversion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {metrics.top_leads.map((lead, i) => (
                                    <tr key={lead.id || i} 
                                        className="group hover:bg-gradient-to-r hover:from-violet-500/5 
                                                   hover:to-transparent transition-all duration-300
                                                   animate-fadeIn"
                                        style={{ animationDelay: `${500 + i * 50}ms` }}>
                                        <td className="py-4 font-bold text-slate-100 group-hover:text-violet-300 
                                                       transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-500 text-xs font-bold 
                                                                 w-6 h-6 flex items-center justify-center 
                                                                 bg-slate-700/50 rounded-lg">
                                                    {i + 1}
                                                </span>
                                                {lead.name}
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-400">{lead.location}</td>
                                        <td className="py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-10 h-10 
                                                            rounded-xl bg-violet-500/15 text-violet-300 
                                                            border border-violet-500/30 font-bold text-sm
                                                            group-hover:scale-110 group-hover:bg-violet-500/25
                                                            transition-all duration-300 shadow-lg 
                                                            shadow-violet-500/10">
                                                {lead.score}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border
                                                            inline-flex items-center gap-1.5
                                                            transition-all duration-300 group-hover:scale-105
                                                ${lead.category === 'Hot'
                                                    ? 'bg-red-500/15 text-red-300 border-red-500/30'
                                                    : lead.category === 'Warm'
                                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'}`}>
                                                <span>
                                                    {lead.category === 'Hot' ? '🔥' : 
                                                     lead.category === 'Warm' ? '☀️' : '❄️'}
                                                </span>
                                                {lead.category}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="font-bold text-emerald-300 text-base">
                                                {lead.conversion_probability != null
                                                    ? `${Math.round(lead.conversion_probability * 100)}%`
                                                    : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
