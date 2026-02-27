import Card from '../ui/Card';

export default function ConversionFunnel({ funnel }) {
    if (!funnel?.length) return null;

    const colors = ['#a78bfa', '#f87171', '#34d399', '#60a5fa'];

    return (
        <Card hover={false} className="p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
                <span className="text-base">🔻</span> Conversion Funnel
            </h3>
            <div className="space-y-4">
                {funnel.map((stage, i) => (
                    <div key={stage.stage}>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-text-secondary font-medium">{stage.stage}</span>
                            <span className="text-xs font-bold" style={{ color: colors[i] }}>
                                {stage.count} <span className="text-text-muted font-normal">({stage.percentage}%)</span>
                            </span>
                        </div>
                        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stage.percentage}%`, background: colors[i] }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
