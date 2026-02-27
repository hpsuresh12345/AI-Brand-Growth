import { useEffect, useState, useMemo } from 'react';
import useLeads from '../hooks/useLeads';
import useToast from '../hooks/useToast';
import LeadForm from '../components/leads/LeadForm';
import LeadGrid from '../components/leads/LeadGrid';
import FilterPills from '../components/leads/FilterPills';
import WhatsAppModal from '../components/modals/WhatsAppModal';
import AnalysisModal from '../components/modals/AnalysisModal';
import Toast from '../components/ui/Toast';

export default function LeadsPage() {
    const { leads, loading, error, fetchLeads, addLead, removeLead, followUp, clearError } = useLeads();
    const { toast, showToast, dismissToast } = useToast();
    const [filter, setFilter] = useState(null);
    const [waData, setWaData] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    // Sync hook errors into toast
    useEffect(() => { if (error) showToast(error); }, [error, showToast]);

    const filtered = useMemo(
        () => filter ? leads.filter((l) => l.category === filter) : leads,
        [leads, filter]
    );

    const handleSubmit = async (data) => {
        try {
            const result = await addLead(data);
            showToast(`${result.lead.name} scored ${result.lead.score} — ${result.lead.category}`, 'success');
            setAnalysisData(result);
        } catch { /* error already in toast via hook */ }
    };

    const handleFollowUp = async (id) => {
        try {
            const result = await followUp(id);
            setWaData(result);
        } catch { /* error in toast */ }
    };

    return (
        <div>
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Leads</h1>
                    <p className="text-sm text-text-muted mt-1">Manage and analyze your pipeline</p>
                </div>
                <FilterPills active={filter} onChange={setFilter} leads={leads} />
            </div>

            {/* Content grid: form + lead grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sticky form sidebar */}
                <div className="lg:col-span-4 xl:col-span-4">
                    <div className="lg:sticky lg:top-6">
                        <LeadForm onSubmit={handleSubmit} loading={loading} />
                    </div>
                </div>

                {/* Lead grid */}
                <div className="lg:col-span-8 xl:col-span-8">
                    <LeadGrid 
                        leads={filtered} 
                        onDelete={removeLead} 
                        onFollowUp={handleFollowUp}
                        loading={loading && leads.length === 0}
                    />
                </div>
            </div>

            {/* Modals */}
            <WhatsAppModal open={!!waData} onClose={() => setWaData(null)} data={waData} />
            <AnalysisModal
                open={!!analysisData}
                onClose={() => setAnalysisData(null)}
                analysis={analysisData?.ai_analysis}
                breakdown={analysisData?.score_breakdown}
            />

            {/* Toast */}
            <Toast message={toast.message} type={toast.type} onDismiss={() => { dismissToast(); clearError(); }} />
        </div>
    );
}
