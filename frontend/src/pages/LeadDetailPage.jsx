import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLead } from '../services/api';
import useLeads from '../hooks/useLeads';
import useToast from '../hooks/useToast';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ScoreGauge from '../components/ui/ScoreGauge';
import Toast from '../components/ui/Toast';
import WhatsAppModal from '../components/modals/WhatsAppModal';
import AnalysisModal from '../components/modals/AnalysisModal';

function formatBudget(b) {
    if (b >= 10000000) return `₹${(b / 10000000).toFixed(1)}Cr`;
    if (b >= 100000) return `₹${(b / 100000).toFixed(1)}L`;
    return `₹${b?.toLocaleString('en-IN') || '0'}`;
}

export default function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reAnalyze, followUp } = useLeads();
    const { toast, showToast, dismissToast } = useToast();

    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [waData, setWaData] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchLead(id)
            .then(setLead)
            .catch(() => showToast('Lead not found'))
            .finally(() => setLoading(false));
    }, [id, showToast]);

    const handleReAnalyze = async () => {
        setAnalyzing(true);
        try {
            const result = await reAnalyze(id);
            setLead(result.lead);
            setAnalysisData(result);
            showToast('Re-analysis complete!', 'success');
        } catch { /* error shown by hook */ }
        setAnalyzing(false);
    };

    const handleFollowUp = async () => {
        try {
            const result = await followUp(id);
            setWaData(result);
        } catch { /* error shown by hook */ }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/[0.02] rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted">Lead not found.</p>
                <Button variant="secondary" className="mt-4" onClick={() => navigate('/leads')}>
                    ← Back to Leads
                </Button>
            </div>
        );
    }

    const cat = lead.category || 'Cold';
    const scoreColor = cat === 'Hot' ? '#ef4444' : cat === 'Warm' ? '#f59e0b' : '#3b82f6';
    const convPct = Math.round((lead.conversion_probability || 0) * 100);
    const riskPct = Math.round((lead.no_show_risk || 0) * 100);

    return (
        <div>
            {/* Nav + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <button onClick={() => navigate('/leads')}
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1">
                    ← Back to Leads
                </button>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleReAnalyze} disabled={analyzing}>
                        {analyzing ? '⟳ Analyzing…' : '🔄 Re-Analyze'}
                    </Button>
                    <Button variant="success" size="sm" onClick={handleFollowUp}>
                        💬 WhatsApp
                    </Button>
                </div>
            </div>

            {/* Lead Header */}
            <Card hover={false} className="p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
                        style={{ background: `${scoreColor}12`, color: scoreColor }}>
                        {lead.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-text-primary truncate">{lead.name}</h1>
                            <Badge variant={cat}>{cat.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-text-muted">
                            {lead.location} · {lead.phone} · {formatBudget(lead.budget)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Score Gauges */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { v: lead.score ?? 0, l: 'Score', c: scoreColor },
                    { v: convPct, l: 'Conversion', c: '#10b981' },
                    { v: riskPct, l: 'No-Show Risk', c: '#f59e0b' },
                ].map((g) => (
                    <Card key={g.l} hover={false} className="p-6 flex flex-col items-center">
                        <ScoreGauge value={g.v} label={g.l} color={g.c} size={80} />
                    </Card>
                ))}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Lead info */}
                <Card hover={false} className="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <span>📋</span> Lead Details
                    </h3>
                    <div className="space-y-3">
                        {[
                            { k: 'Timeline', v: lead.timeline },
                            { k: 'Property', v: lead.property_type },
                            { k: 'Loan Status', v: lead.loan_status },
                        ].filter((r) => r.v).map((r) => (
                            <div key={r.k} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                                <span className="text-xs text-text-muted">{r.k}</span>
                                <span className="text-sm text-text-secondary font-medium">{r.v}</span>
                            </div>
                        ))}
                        {lead.message && (
                            <div className="mt-2 p-3 bg-white/[0.02] rounded-xl">
                                <span className="text-xs text-text-muted font-medium block mb-1">Message</span>
                                <p className="text-sm text-text-secondary leading-relaxed">{lead.message}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* AI Summary placeholder */}
                <Card hover={false} className="p-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <span>🧠</span> AI Summary
                    </h3>
                    {analysisData?.ai_analysis ? (
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary leading-relaxed">{analysisData.ai_analysis.summary}</p>
                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/15">
                                <p className="text-[11px] text-primary-light font-semibold uppercase tracking-wider mb-1">Next Step</p>
                                <p className="text-sm text-text-secondary">{analysisData.ai_analysis.recommended_action}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-text-muted text-sm mb-3">Run AI analysis to see insights</p>
                            <Button variant="secondary" size="sm" onClick={handleReAnalyze} disabled={analyzing}>
                                {analyzing ? '⟳ Analyzing…' : '🔄 Analyze Now'}
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modals */}
            <WhatsAppModal open={!!waData} onClose={() => setWaData(null)} data={waData} />
            <AnalysisModal
                open={!!analysisData && false /* shown inline instead */}
                onClose={() => setAnalysisData(null)}
                analysis={analysisData?.ai_analysis}
                breakdown={analysisData?.score_breakdown}
            />

            <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
        </div>
    );
}
