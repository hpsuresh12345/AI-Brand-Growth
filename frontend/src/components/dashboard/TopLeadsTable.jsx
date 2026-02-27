import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function TopLeadsTable({ leads = [] }) {
    const navigate = useNavigate();

    if (!leads.length) return null;

    return (
        <Card hover={false} className="p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-base">🏆</span> Top Leads
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-[11px] text-text-muted uppercase tracking-wider">
                            <th className="text-left pb-3 font-medium">Name</th>
                            <th className="text-center pb-3 font-medium">Score</th>
                            <th className="text-center pb-3 font-medium">Category</th>
                            <th className="text-right pb-3 font-medium">Conversion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {leads.map((lead) => (
                            <tr key={lead.id}
                                className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                                onClick={() => navigate(`/leads/${lead.id}`)}
                            >
                                <td className="py-3 font-medium text-text-primary">{lead.name}</td>
                                <td className="py-3 text-center">
                                    <span className="font-bold text-primary-light">{lead.score}</span>
                                </td>
                                <td className="py-3 text-center">
                                    <Badge variant={lead.category}>{lead.category}</Badge>
                                </td>
                                <td className="py-3 text-right text-emerald-400 font-medium">
                                    {lead.conversion_probability != null
                                        ? `${Math.round(lead.conversion_probability * 100)}%`
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
