import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { simulateWeeklyCheck } from '../api/growthApi';
import { PageHeader, Button, Badge, AlertBanner, Spinner, EmptyState } from '../components/ui';

export default function AlertsPage() {
    const { brand } = useBrand();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    async function handleRunCheck() {
        setLoading(true);
        try {
            const data = await simulateWeeklyCheck();
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const alerts = result?.alerts || [];
    const criticalCount = alerts.filter(a => a.level === 'critical').length;
    const warningCount = alerts.filter(a => a.level === 'warning').length;

    return (
        <div className="space-y-6">
            <PageHeader title="Alerts" subtitle="Monitoring triggers and engagement alerts">
                <Button onClick={handleRunCheck} loading={loading}>
                    🔍 Run Weekly Check
                </Button>
            </PageHeader>

            {/* Summary */}
            {result && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-gray-800">{result.brands_checked}</p>
                        <p className="text-xs text-gray-400">Brands Checked</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                        <p className="text-xs text-gray-400">Critical Alerts</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
                        <p className="text-xs text-gray-400">Warnings</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{result.cycles_triggered}</p>
                        <p className="text-xs text-gray-400">Cycles Triggered</p>
                    </div>
                </div>
            )}

            {/* Alert Feed */}
            {alerts.length > 0 ? (
                <div className="space-y-3">
                    {alerts.map((alert, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                            <div className="flex items-start gap-3">
                                <span className="text-xl shrink-0">
                                    {alert.level === 'critical' ? '🔴' : alert.level === 'warning' ? '🟡' : '🟢'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge color={alert.level === 'critical' ? 'red' : alert.level === 'warning' ? 'amber' : 'green'}>
                                            {alert.level}
                                        </Badge>
                                        {alert.brand_name && <Badge color="gray">{alert.brand_name}</Badge>}
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-800">{alert.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{alert.detail}</p>

                                    {/* Metadata */}
                                    {alert.metadata && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {alert.metadata.growth_rate !== undefined && (
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                    Growth: {(alert.metadata.growth_rate * 100).toFixed(1)}%
                                                </span>
                                            )}
                                            {alert.metadata.previous_week !== undefined && (
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                    Prev: {(alert.metadata.previous_week * 100).toFixed(1)}%
                                                </span>
                                            )}
                                            {alert.metadata.current_week !== undefined && (
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                    Current: {(alert.metadata.current_week * 100).toFixed(1)}%
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-[10px] text-gray-300 mt-2">{alert.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : result ? (
                <AlertBanner type="success" title="All Clear" message="No issues detected. All brands are performing well." />
            ) : (
                <EmptyState
                    icon="🔔"
                    title="No Alerts Yet"
                    message="Run a weekly check to monitor your brands and detect engagement issues."
                >
                    <Button onClick={handleRunCheck} loading={loading}>Run Weekly Check</Button>
                </EmptyState>
            )}

            {/* Brand Results Detail */}
            {result?.results?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Brand Status</h3>
                    <div className="space-y-2">
                        {result.results.map((r, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">{r.brand_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {r.growth_rate !== null && (
                                        <span className={`text-xs font-medium ${r.growth_rate >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {(r.growth_rate * 100).toFixed(1)}%
                                        </span>
                                    )}
                                    <Badge color={r.status === 'healthy' ? 'green' : r.status === 'declining' ? 'red' : r.status === 'stagnant' ? 'amber' : 'gray'}>
                                        {r.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
