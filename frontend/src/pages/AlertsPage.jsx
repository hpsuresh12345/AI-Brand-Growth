import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { simulateWeeklyCheck } from '../api/growthApi';
import { PageHeader, Button, Badge, AlertBanner, EmptyState } from '../components/ui';

export default function AlertsPage() {
    const { brand } = useBrand();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    async function handleRunCheck() {
        setLoading(true);
        try { const data = await simulateWeeklyCheck(); setResult(data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    const alerts = result?.alerts || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Alerts" subtitle="Monitoring triggers and engagement alerts">
                <Button onClick={handleRunCheck} loading={loading}>🔍 Run Weekly Check</Button>
            </PageHeader>

            {result && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-text-primary">{result.brands_checked}</p><p className="text-xs text-text-muted">Brands Checked</p></div>
                    <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-danger">{alerts.filter(a => a.level === 'critical').length}</p><p className="text-xs text-text-muted">Critical</p></div>
                    <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-warning">{alerts.filter(a => a.level === 'warning').length}</p><p className="text-xs text-text-muted">Warnings</p></div>
                    <div className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-accent-light">{result.cycles_triggered}</p><p className="text-xs text-text-muted">Cycles Triggered</p></div>
                </div>
            )}

            {alerts.length > 0 ? (
                <div className="space-y-3">
                    {alerts.map((alert, i) => (
                        <div key={i} className="glass rounded-2xl p-5 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <span className="text-xl shrink-0">{alert.level === 'critical' ? '🔴' : alert.level === 'warning' ? '🟡' : '🟢'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge color={alert.level === 'critical' ? 'red' : alert.level === 'warning' ? 'amber' : 'green'}>{alert.level}</Badge>
                                        {alert.brand_name && <Badge color="gray">{alert.brand_name}</Badge>}
                                    </div>
                                    <h4 className="text-sm font-semibold text-text-primary">{alert.title}</h4>
                                    <p className="text-xs text-text-muted mt-1">{alert.detail}</p>
                                    <p className="text-[10px] text-text-muted/50 mt-2">{alert.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : result ? (
                <AlertBanner type="success" title="All Clear" message="No issues detected. All brands are performing well." />
            ) : (
                <EmptyState icon="🔔" title="No Alerts Yet" message="Run a weekly check to monitor your brands.">
                    <Button onClick={handleRunCheck} loading={loading}>Run Weekly Check</Button>
                </EmptyState>
            )}
        </div>
    );
}
