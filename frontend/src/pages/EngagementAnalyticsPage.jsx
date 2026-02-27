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

const UNDERPERFORMERS = [
    { topic: 'Generic Company Update', platform: 'LinkedIn', score: 0.18, reason: 'Weak hook, no CTA' },
    { topic: 'Holiday Greeting', platform: 'Instagram', score: 0.22, reason: 'Low value density' },
    { topic: 'Product Feature List', platform: 'Twitter/X', score: 0.15, reason: 'Too promotional' },
];

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
        try {
            const result = await analyzeContent({
                content_text: contentText,
                likes: parseInt(likes) || 0,
                comments: parseInt(comments) || 0,
                shares: parseInt(shares) || 0,
            });
            setAnalysis(result);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    }

    if (!brand) {
        return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Engagement Analytics" subtitle="Track, analyze, and optimize content performance" />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Engagement Trend" subtitle="Weekly engagement by platform">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={TREND_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Area type="monotone" dataKey="LinkedIn" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                            <Area type="monotone" dataKey="Twitter" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                            <Area type="monotone" dataKey="Instagram" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Platform Comparison" subtitle="Avg engagement by platform">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={[
                            { platform: 'LinkedIn', score: 71 },
                            { platform: 'Twitter/X', score: 45 },
                            { platform: 'Instagram', score: 61 },
                            { platform: 'YouTube', score: 55 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="platform" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                            <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Underperformers */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Underperforming Posts</h3>
                <div className="space-y-2">
                    {UNDERPERFORMERS.map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <Badge color="red">{(p.score * 100).toFixed(0)}%</Badge>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">{p.topic}</p>
                                    <p className="text-xs text-gray-400">{p.reason}</p>
                                </div>
                            </div>
                            <Badge color="gray">{p.platform}</Badge>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Analysis Panel */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">AI Content Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <Textarea label="Paste your content" id="analyze-content" placeholder="Paste the content you want to analyze…" value={contentText} onChange={(e) => setContentText(e.target.value)} />
                        <div className="grid grid-cols-3 gap-2">
                            <Input label="Likes" id="a-likes" type="number" placeholder="0" value={likes} onChange={(e) => setLikes(e.target.value)} />
                            <Input label="Comments" id="a-comments" type="number" placeholder="0" value={comments} onChange={(e) => setComments(e.target.value)} />
                            <Input label="Shares" id="a-shares" type="number" placeholder="0" value={shares} onChange={(e) => setShares(e.target.value)} />
                        </div>
                        <Button onClick={handleAnalyze} loading={analyzing} disabled={!contentText.trim()} className="w-full">
                            🔍 Analyze Content
                        </Button>
                    </div>

                    <div>
                        {analysis ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-800">{analysis.overall_score?.toFixed(1)}</span>
                                    <span className="text-sm text-gray-400">/ 10</span>
                                </div>
                                {analysis.diagnosis && (
                                    <p className="text-xs text-gray-500">{analysis.diagnosis.summary}</p>
                                )}
                                {/* Dimension bars */}
                                {analysis.diagnosis && Object.entries(analysis.diagnosis).filter(([k]) => k !== 'summary').map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                            <span className="text-gray-400">{val.score}/10</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(val.score / 10) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {analysis.predicted_lift && (
                                    <AlertBanner type="info" title="Predicted Lift" message={analysis.predicted_lift} />
                                )}
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
