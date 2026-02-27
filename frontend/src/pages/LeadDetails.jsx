import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLead, analyzeLead, generateFollowUp, predictNoShow } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ScoreGauge from '../components/ui/ScoreGauge';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

/* ── Helpers ─────────────────────────────── */
function formatBudget(b) {
    if (b >= 10000000) return `₹${(b / 10000000).toFixed(1)}Cr`;
    if (b >= 100000) return `₹${(b / 100000).toFixed(1)}L`;
    return `₹${b?.toLocaleString('en-IN') || '0'}`;
}

function riskLevel(risk) {
    if (risk >= 0.7) return { label: 'HIGH', color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20' };
    if (risk >= 0.4) return { label: 'MEDIUM', color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'LOW', color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20' };
}

/* ── Page ─────────────────────────────────── */
export default function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast, showToast, dismissToast } = useToast();

    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [waMessage, setWaMessage] = useState(null);
    const [noShow, setNoShow] = useState(null);
    const [busy, setBusy] = useState({});

    /* Fetch lead on mount */
    useEffect(() => {
        setLoading(true);
        fetchLead(id)
            .then(setLead)
            .catch(() => showToast('Lead not found'))
            .finally(() => setLoading(false));
    }, [id, showToast]);

    /* Action helpers */
    const withBusy = (key, fn) => async () => {
        setBusy((b) => ({ ...b, [key]: true }));
        try { await fn(); }
        catch (err) { showToast(err.message || 'Action failed'); }
        finally { setBusy((b) => ({ ...b, [key]: false })); }
    };

    const handleAnalyze = withBusy('analyze', async () => {
        const result = await analyzeLead(id);
        setLead(result.lead);
        setAnalysis(result.ai_analysis);
        setBreakdown(result.score_breakdown);
        showToast('AI analysis complete!', 'success');
    });

    const handleFollowUp = withBusy('followup', async () => {
        const result = await generateFollowUp(id);
        setWaMessage(result);
        showToast('WhatsApp message generated!', 'success');
    });

    const handleNoShow = withBusy('noshow', async () => {
        const result = await predictNoShow(id);
        setNoShow(result);
        showToast('No-show risk predicted!', 'success');
    });

    const handleSimulateSend = () => {
        showToast(`Message simulated to ${lead.phone} via WhatsApp`, 'success');
    };

    /* Skeleton */
    if (loading) {
        return (
            <div className="space-y-4 max-w-5xl mx-auto">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-white/[0.02] rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-20">
                <span className="text-5xl block mb-4">🔍</span>
                <p className="text-slate-400 mb-4">Lead not found</p>
                <Button variant="secondary" onClick={() => navigate('/leads')}>← Back to Leads</Button>
            </div>
        );
    }

    const cat = lead.category || 'Cold';
    const scoreColor = cat === 'Hot' ? '#ef4444' : cat === 'Warm' ? '#f59e0b' : '#3b82f6';
    const convPct = Math.round((lead.conversion_probability || 0) * 100);
    const riskPct = Math.round((lead.no_show_risk || 0) * 100);
    const risk = riskLevel(lead.no_show_risk || 0);

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Top Bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button onClick={() => navigate('/leads')}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                    ← Back to Leads
                </button>
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={handleAnalyze} disabled={busy.analyze}>
                        {busy.analyze ? '⟳ Running…' : '🧠 Analyze'}
                    </Button>
                    <Button variant="success" size="sm" onClick={handleFollowUp} disabled={busy.followup}>
                        {busy.followup ? '⟳ Generating…' : '💬 WhatsApp'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleNoShow} disabled={busy.noshow}>
                        {busy.noshow ? '⟳ Predicting…' : '⚠️ No-Show Risk'}
                    </Button>
                </div>
            </div>

            {/* ─── CARD 1: Lead Header ─── */}
            <Card hover={false} className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
                        style={{ background: `${scoreColor}15`, color: scoreColor }}>
                        {lead.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-slate-100 truncate">{lead.name}</h1>
                            <Badge variant={cat}>{cat.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                            📍 {lead.location} · 📱 {lead.phone} · 💰 {formatBudget(lead.budget)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* ─── CARD 2: Score Gauges ─── */}
            <div className="grid grid-cols-3 gap-4">
                <Card hover={false} className="p-6 flex flex-col items-center">
                    <ScoreGauge value={lead.score ?? 0} label="Lead Score" color={scoreColor} size={80} />
                </Card>
                <Card hover={false} className="p-6 flex flex-col items-center">
                    <ScoreGauge value={convPct} label="Conversion" color="#10b981" size={80} />
                </Card>
                <Card hover={false} className="p-6 flex flex-col items-center">
                    <ScoreGauge value={riskPct} label="No-Show" color="#f59e0b" size={80} />
                </Card>
            </div>

            {/* ─── CARD 3: AI Intelligence Summary ─── */}
            <Card hover={false} className="p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="text-base">🧠</span> Lead Intelligence Summary
                </h3>

                {analysis ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                            <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
                        </div>
                        <div className="p-4 bg-violet-500/5 rounded-xl border border-violet-500/15">
                            <p className="text-[11px] text-violet-400 font-bold uppercase tracking-wider mb-1">
                                Recommended Action
                            </p>
                            <p className="text-sm text-slate-300">{analysis.recommended_action}</p>
                        </div>

                        {/* Score breakdown bars */}
                        {breakdown && (
                            <div className="space-y-3 pt-2">
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Score Breakdown</p>
                                {[
                                    { key: 'ai_score', label: 'AI Intelligence', color: '#a78bfa' },
                                    { key: 'budget_score', label: 'Budget', color: '#34d399' },
                                    { key: 'timeline_score', label: 'Timeline', color: '#fbbf24' },
                                    { key: 'loan_score', label: 'Loan Status', color: '#60a5fa' },
                                    { key: 'message_score', label: 'Message Quality', color: '#f87171' },
                                ].map((b) => (
                                    <div key={b.key}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-slate-400">{b.label}</span>
                                            <span className="text-xs font-bold" style={{ color: b.color }}>{breakdown[b.key]}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${breakdown[b.key]}%`, background: b.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <span className="text-3xl block mb-2">🤖</span>
                        <p className="text-sm text-slate-500 mb-3">Click "Analyze" to generate AI insights</p>
                        <Button variant="secondary" size="sm" onClick={handleAnalyze} disabled={busy.analyze}>
                            {busy.analyze ? '⟳ Running…' : '🧠 Run Analysis'}
                        </Button>
                    </div>
                )}
            </Card>

            {/* ─── CARD 4: Risk Flags ─── */}
            <Card hover={false} className="p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="text-base">🚩</span> Risk Flags
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* No-show risk */}
                    <div className={`p-4 rounded-xl border ${risk.bg}`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: risk.color }}>
                            No-Show Risk
                        </p>
                        <p className="text-xl font-extrabold" style={{ color: risk.color }}>
                            {riskPct}% — {risk.label}
                        </p>
                    </div>

                    {/* Loan status flag */}
                    <div className={`p-4 rounded-xl border ${lead.loan_status === 'Pre-approved' ? 'bg-emerald-500/10 border-emerald-500/20'
                            : lead.loan_status === 'Not started' ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-amber-500/10 border-amber-500/20'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">
                            Loan Status
                        </p>
                        <p className={`text-xl font-extrabold ${lead.loan_status === 'Pre-approved' ? 'text-emerald-400'
                                : lead.loan_status === 'Not started' ? 'text-red-400'
                                    : 'text-amber-400'}`}>
                            {lead.loan_status || 'Unknown'}
                        </p>
                    </div>

                    {/* Timeline urgency */}
                    <div className={`p-4 rounded-xl border ${lead.timeline === 'Immediately' ? 'bg-red-500/10 border-red-500/20'
                            : lead.timeline === '1-3 months' ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-slate-500/10 border-slate-500/20'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">
                            Timeline Urgency
                        </p>
                        <p className={`text-xl font-extrabold ${lead.timeline === 'Immediately' ? 'text-red-400'
                                : lead.timeline === '1-3 months' ? 'text-amber-400'
                                    : 'text-slate-300'}`}>
                            {lead.timeline || 'Not specified'}
                        </p>
                    </div>

                    {/* No-show deep analysis */}
                    {noShow && (
                        <div className="p-4 rounded-xl border bg-white/[0.02] border-white/[0.06]">
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">
                                AI No-Show Analysis
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">{noShow.analysis || noShow.summary}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* ─── CARD 5: Conversion Probability ─── */}
            <Card hover={false} className="p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="text-base">📈</span> Conversion Probability
                </h3>
                <div className="flex items-center gap-6">
                    <div className="shrink-0">
                        <ScoreGauge value={convPct} label="" color="#10b981" size={100} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-3xl font-extrabold text-emerald-400">{convPct}%</p>
                        <p className="text-sm text-slate-400">
                            {convPct >= 70
                                ? '🟢 High probability — prioritize this lead for immediate follow-up.'
                                : convPct >= 40
                                    ? '🟡 Moderate probability — nurture with targeted messaging.'
                                    : '🔴 Low probability — consider re-engagement or deprioritize.'}
                        </p>
                        <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden max-w-xs">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400
                transition-all duration-1000"
                                style={{ width: `${convPct}%` }} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* ─── CARD 6: WhatsApp Preview + Simulate Send ─── */}
            <Card hover={false} className="p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="text-base">💬</span> WhatsApp Follow-Up Preview
                </h3>

                {waMessage ? (
                    <div className="space-y-4">
                        {/* Chat bubble */}
                        <div className="relative max-w-lg">
                            <div className="p-4 bg-[#005c4b]/60 rounded-2xl rounded-tl-sm
                border border-emerald-800/30 shadow-lg shadow-emerald-900/10">
                                <p className="text-sm text-emerald-50 leading-relaxed whitespace-pre-wrap">
                                    {waMessage.whatsapp_message}
                                </p>
                                <p className="text-[10px] text-emerald-200/40 text-right mt-2">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                                </p>
                            </div>
                            {/* Tail */}
                            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-[#005c4b]/60 rotate-45
                border-l border-b border-emerald-800/30" />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button variant="success" onClick={handleSimulateSend}>
                                📤 Simulate Send to {lead.phone}
                            </Button>
                            <Button variant="secondary" onClick={async () => {
                                await navigator.clipboard.writeText(waMessage.whatsapp_message);
                                showToast('Copied to clipboard!', 'success');
                            }}>
                                📋 Copy
                            </Button>
                            <Button variant="secondary" onClick={handleFollowUp} disabled={busy.followup}>
                                ↻ Regenerate
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <span className="text-3xl block mb-2">📱</span>
                        <p className="text-sm text-slate-500 mb-3">Generate a personalized WhatsApp follow-up</p>
                        <Button variant="success" onClick={handleFollowUp} disabled={busy.followup}>
                            {busy.followup ? '⟳ Generating…' : '💬 Generate Message'}
                        </Button>
                    </div>
                )}
            </Card>

            {/* ─── CARD 7: Lead Details ─── */}
            <Card hover={false} className="p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="text-base">📋</span> Lead Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        { k: 'Property Type', v: lead.property_type },
                        { k: 'Timeline', v: lead.timeline },
                        { k: 'Loan Status', v: lead.loan_status },
                        { k: 'Budget', v: formatBudget(lead.budget) },
                        { k: 'Location', v: lead.location },
                        { k: 'Phone', v: lead.phone },
                    ].filter((r) => r.v).map((r) => (
                        <div key={r.k} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">{r.k}</p>
                            <p className="text-sm text-slate-300 font-medium">{r.v}</p>
                        </div>
                    ))}
                </div>
                {lead.message && (
                    <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Inquiry Message</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{lead.message}</p>
                    </div>
                )}
            </Card>

            <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
        </div>
    );
}
