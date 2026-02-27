import LeadCard from './LeadCard';
import EmptyState from '../ui/EmptyState';
import { LeadCardSkeleton } from '../ui/Skeleton';

export default function LeadGrid({ leads, onDelete, onFollowUp, loading = false }) {
    // Show skeleton loading state
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <LeadCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Show empty state when no leads
    if (!leads.length) {
        return (
            <div className="animate-fadeIn">
                <EmptyState
                    icon="🏗️"
                    title="No leads yet"
                    description="Submit your first lead and watch Claude AI analyze, score, and categorize it in real time."
                />
            </div>
        );
    }

    // Show leads grid with stagger animation
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map((lead, index) => (
                <div 
                    key={lead.id} 
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <LeadCard lead={lead} onDelete={onDelete} onFollowUp={onFollowUp} />
                </div>
            ))}
        </div>
    );
}
