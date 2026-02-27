import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';

/* ── Badge colors ─────────────────────────── */
const badgeStyles = {
    Hot: 'bg-red-500/10 text-red-400 border-red-500/20',
    Warm: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Cold: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function CategoryBadge({ category }) {
    const style = badgeStyles[category] || badgeStyles.Cold;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px]
      font-bold tracking-wide border ${style}`}>
            {category}
        </span>
    );
}

/* ── Budget formatter ─────────────────────── */
function formatBudget(b) {
    if (b >= 10000000) return `₹${(b / 10000000).toFixed(1)}Cr`;
    if (b >= 100000) return `₹${(b / 100000).toFixed(1)}L`;
    return `₹${b?.toLocaleString('en-IN') || '0'}`;
}

/* ── Score pill ────────────────────────────── */
function ScorePill({ score }) {
    const color = score >= 75 ? 'text-emerald-400 bg-emerald-500/10'
        : score >= 50 ? 'text-amber-400 bg-amber-500/10'
            : 'text-slate-400 bg-slate-500/10';
    return (
        <span className={`inline-flex items-center justify-center w-10 h-10
      rounded-xl font-bold text-sm ${color}`}>
            {score}
        </span>
    );
}

/* ── Lead Table ────────────────────────────── */
export default function LeadTable({ leads = [] }) {
    const navigate = useNavigate();

    if (!leads.length) {
        return (
            <Card hover={false} className="p-10 text-center">
                <span className="text-4xl block mb-3">📋</span>
                <p className="text-sm text-slate-400">No leads to display</p>
            </Card>
        );
    }

    return (
        <Card hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    {/* Header */}
                    <thead>
                        <tr className="text-[11px] text-slate-500 uppercase tracking-wider
              border-b border-white/[0.06] bg-white/[0.01]">
                            <th className="text-left px-6 py-4 font-semibold">Name</th>
                            <th className="text-left px-4 py-4 font-semibold">Budget</th>
                            <th className="text-left px-4 py-4 font-semibold">Location</th>
                            <th className="text-center px-4 py-4 font-semibold">Category</th>
                            <th className="text-center px-4 py-4 font-semibold">Score</th>
                            <th className="text-right px-6 py-4 font-semibold">Action</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-white/[0.04]">
                        {leads.map((lead) => (
                            <tr key={lead.id}
                                className="group hover:bg-white/[0.02] transition-colors duration-150">
                                {/* Name */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center
                      bg-violet-500/10 text-violet-400 text-xs font-bold shrink-0">
                                            {lead.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                                            {lead.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Budget */}
                                <td className="px-4 py-4 text-slate-300 font-medium">
                                    {formatBudget(lead.budget)}
                                </td>

                                {/* Location */}
                                <td className="px-4 py-4 text-slate-400">
                                    {lead.location}
                                </td>

                                {/* Category Badge */}
                                <td className="px-4 py-4 text-center">
                                    <CategoryBadge category={lead.category || 'Cold'} />
                                </td>

                                {/* Score */}
                                <td className="px-4 py-4 text-center">
                                    <ScorePill score={lead.score ?? 0} />
                                </td>

                                {/* View Button */}
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
                      text-xs font-semibold text-violet-400 bg-violet-500/8
                      border border-violet-500/15
                      hover:bg-violet-500/15 hover:shadow-sm hover:shadow-violet-500/10
                      transition-all duration-200 active:scale-[0.97]"
                                    >
                                        View →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
