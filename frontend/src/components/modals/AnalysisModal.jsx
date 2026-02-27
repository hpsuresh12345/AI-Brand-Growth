import Modal, { ModalHeader, ModalBody } from '../ui/Modal';

const bars = [
    { key: 'ai_score', label: 'AI Intelligence', color: '#a78bfa' },
    { key: 'budget_score', label: 'Budget', color: '#34d399' },
    { key: 'timeline_score', label: 'Timeline', color: '#fbbf24' },
    { key: 'loan_score', label: 'Loan Status', color: '#60a5fa' },
    { key: 'message_score', label: 'Message Quality', color: '#f87171' },
];

export default function AnalysisModal({ open, onClose, analysis, breakdown }) {
    if (!analysis) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                <span className="text-lg">🧠</span>
                <h2 className="text-base font-bold text-text-primary">AI Analysis</h2>
            </ModalHeader>

            <ModalBody className="space-y-5">
                {/* Summary */}
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <p className="text-sm text-text-secondary leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Recommended action */}
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/15">
                    <p className="text-[11px] text-primary-light font-semibold uppercase tracking-wider mb-1">
                        Recommended Action
                    </p>
                    <p className="text-sm text-text-secondary">{analysis.recommended_action}</p>
                </div>

                {/* Score breakdown */}
                {breakdown && (
                    <div className="space-y-3">
                        <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Score Breakdown</p>
                        {bars.map((b) => (
                            <div key={b.key}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-text-secondary">{b.label}</span>
                                    <span className="text-xs font-bold" style={{ color: b.color }}>
                                        {breakdown[b.key]}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${breakdown[b.key]}%`, background: b.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
}
