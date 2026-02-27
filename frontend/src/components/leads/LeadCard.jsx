import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ScoreGauge from '../ui/ScoreGauge';
import Button from '../ui/Button';

function formatBudget(b) {
    if (b >= 10000000) return `₹${(b / 10000000).toFixed(1)}Cr`;
    if (b >= 100000) return `₹${(b / 100000).toFixed(1)}L`;
    return `₹${b?.toLocaleString('en-IN') || '0'}`;
}

export default function LeadCard({ lead, onDelete, onFollowUp }) {
    const navigate = useNavigate();
    const cat = lead.category || 'Cold';
    const scoreColor = cat === 'Hot' ? '#ef4444' : cat === 'Warm' ? '#f59e0b' : '#3b82f6';
    const convPct = Math.round((lead.conversion_probability || 0) * 100);
    const riskPct = Math.round((lead.no_show_risk || 0) * 100);

    return (
        <Card className="p-5 group animate-fadeIn hover:scale-[1.02]" glow>
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r 
                            from-violet-500 via-blue-500 to-purple-500 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4 cursor-pointer"
                onClick={() => navigate(`/leads/${lead.id}`)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold 
                                        shrink-0 transition-all duration-300 group-hover:scale-110 
                                        group-hover:rotate-3 shadow-lg"
                            style={{ 
                                background: `linear-gradient(135deg, ${scoreColor}20, ${scoreColor}10)`,
                                color: scoreColor,
                                border: `2px solid ${scoreColor}30`
                            }}>
                            {lead.name?.charAt(0)?.toUpperCase()}
                        </div>
                        {/* Status indicator */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 
                                        border-slate-800 pulse-glow"
                             style={{ backgroundColor: scoreColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-violet-300 
                                       transition-colors">
                            {lead.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                            <span>📍</span> {lead.location}
                        </p>
                    </div>
                </div>
                <Badge variant={cat}>{cat.toUpperCase()}</Badge>
            </div>

            {/* Gauges with better spacing */}
            <div className="flex justify-around items-center py-4 px-2 mb-4
                            bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] 
                            rounded-xl border border-white/[0.05]">
                <div className="text-center">
                    <ScoreGauge value={lead.score ?? 0} label="Score" color={scoreColor} size={56} />
                </div>
                <div className="w-px h-12 bg-slate-700/50" />
                <div className="text-center">
                    <ScoreGauge value={convPct} label="Conv" color="#10b981" size={56} />
                </div>
                <div className="w-px h-12 bg-slate-700/50" />
                <div className="text-center">
                    <ScoreGauge value={riskPct} label="Risk" color="#f59e0b" size={56} />
                </div>
            </div>

            {/* Tags with icons */}
            <div className="flex flex-wrap gap-2 mb-4">
                {lead.budget && (
                    <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-300 text-xs
                                     font-semibold rounded-lg border border-emerald-500/20 
                                     flex items-center gap-1.5 hover:bg-emerald-500/15 transition-colors">
                        <span>💰</span> {formatBudget(lead.budget)}
                    </span>
                )}
                {lead.property_type && (
                    <span className="px-2.5 py-1.5 bg-blue-500/10 text-blue-300 text-xs
                                     font-semibold rounded-lg border border-blue-500/20 
                                     flex items-center gap-1.5 hover:bg-blue-500/15 transition-colors">
                        <span>🏠</span> {lead.property_type}
                    </span>
                )}
                {lead.timeline && (
                    <span className="px-2.5 py-1.5 bg-violet-500/10 text-violet-300 text-xs
                                     font-semibold rounded-lg border border-violet-500/20 
                                     flex items-center gap-1.5 hover:bg-violet-500/15 transition-colors">
                        <span>⏰</span> {lead.timeline}
                    </span>
                )}
            </div>

            {/* Actions with better styling */}
            <div className="flex gap-2">
                <Button 
                    variant="success" 
                    size="sm" 
                    className="flex-1 group/btn" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onFollowUp(lead.id);
                    }}
                >
                    <span className="group-hover/btn:scale-110 transition-transform inline-block">💬</span>
                    WhatsApp
                </Button>
                <Button 
                    variant="danger" 
                    size="sm" 
                    className="group/btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(lead.id);
                    }}
                    aria-label="Delete"
                >
                    <span className="group-hover/btn:scale-110 group-hover/btn:rotate-12 
                                     transition-transform inline-block">🗑️</span>
                </Button>
            </div>
        </Card>
    );
}
