import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useBrand } from '../contexts/BrandContext';
import { analyzeContent } from '../api/growthApi';
import { PageHeader, ChartCard, Button, Textarea, Input, Badge, Spinner, EmptyState, AlertBanner } from '../components/ui';

const TREND_DATA = [
    { week: 'W1', LinkedIn: 65, Twitter: 42, Instagram: 58 },
    { week: 'W2', LinkedIn: 72, Twitter: 38, Instagram: 61 },
    { week: 'W3', LinkedIn: 68, Twitter: 51, Instagram: 55 },
    { week: 'W4', LinkedIn: 78, Twitter: 47, Instagram: 70 },
];

const chartTooltip = { contentStyle: { background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#f1f5f9' }, labelStyle: { color: '#94a3b8' } };

export default function EngagementAnalyticsPage() {
    const { brand } = useBrand();
    const [contentText, setContentText] = useState('');
    const [likes, setLikes] = useState('');
    const [comments, setComments] = useState('');
    const [shares, setShares] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    async function handleAnalyze() {
        if (!contentText.trim()) return;
        setAnalyzing(true);
        try { const result = await analyzeContent({ content_text: contentText, likes: parseInt(likes) || 0, comments: parseInt(comments) || 0, shares: parseInt(shares) || 0 }); setAnalysis(result); }
        catch (err) { console.error(err); }
        finally { setAnalyzing(false); }
    }

    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Engagement Analytics" subtitle="Track, analyze, and optimize content performance" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Engagement Trend" subtitle="Weekly engagement by platform">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={TREND_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip {...chartTooltip} />
                            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                            <Area type="monotone" dataKey="LinkedIn" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                            <Area type="monotone" dataKey="Twitter" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                            <Area type="monotone" dataKey="Instagram" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Platform Comparison" subtitle="Avg engagement by platform">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={[{ platform: 'LinkedIn', score: 71 }, { platform: 'Twitter/X', score: 45 }, { platform: 'Instagram', score: 61 }, { platform: 'YouTube', score: 55 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="platform" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip {...chartTooltip} />
                            <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* AI Analysis */}
            <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">AI Content Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <Textarea label="Paste your content" id="analyze-content" placeholder="Paste the content you want to analyze…" value={contentText} onChange={(e) => setContentText(e.target.value)} />
                        <div className="grid grid-cols-3 gap-2">
                            <Input label="Likes" id="a-likes" type="number" placeholder="0" value={likes} onChange={(e) => setLikes(e.target.value)} />
                            <Input label="Comments" id="a-comments" type="number" placeholder="0" value={comments} onChange={(e) => setComments(e.target.value)} />
                            <Input label="Shares" id="a-shares" type="number" placeholder="0" value={shares} onChange={(e) => setShares(e.target.value)} />
                        </div>
                        <Button onClick={handleAnalyze} loading={analyzing} disabled={!contentText.trim()} className="w-full">🔍 Analyze Content</Button>
                    </div>
                    <div>
                        {analysis ? (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold gradient-text">{analysis.overall_score?.toFixed(1)}</span>
                                    <span className="text-sm text-text-muted">/ 10</span>
                                </div>
                                {analysis.diagnosis && Object.entries(analysis.diagnosis).filter(([k]) => k !== 'summary').map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-text-secondary capitalize">{key.replace('_', ' ')}</span>
                                            <span className="text-text-muted">{val.score}/10</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5">
                                            <div className="bg-gradient-to-r from-accent to-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${(val.score / 10) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="📊" title="Analysis Results" message="Paste content and metrics to get AI-powered analysis." />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
