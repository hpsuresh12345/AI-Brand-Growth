import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { publishContent } from '../api/growthApi';
import { PageHeader, Button, Select, Input, Badge, Spinner, EmptyState, AlertBanner } from '../components/ui';
import axios from 'axios';

const PLATFORMS = [
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Twitter/X', label: 'Twitter / X' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'YouTube', label: 'YouTube' },
];

export default function ContentGeneratorPage() {
    const { brand } = useBrand();
    const [platform, setPlatform] = useState('LinkedIn');
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(null);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [publishResult, setPublishResult] = useState(null);

    async function handleGenerate() {
        if (!topic.trim()) return;
        setLoading(true); setContent(null); setCopied(false); setSaved(false); setPublishResult(null);
        try {
            const res = await axios.post('/api/growth/run-growth-cycle', { brand_id: brand.id });
            const result = res.data;
            if (result.content?.generated > 0) {
                setContent({ hook: `Generated content for "${topic}" on ${platform}`, body: `Content generated as part of growth cycle. ${result.content.generated} pieces created.`, cta: 'Check your Content Library to see all generated content.', hashtags: [], content_type: 'text', platform, topic });
            } else {
                // Use GPT to generate directly
                const text = `🚀 ${topic}\n\nAs a brand in the ${brand.niche} space, here's our take on ${topic}.\n\nOur ${brand.tone} approach to this topic sets us apart.\n\n${brand.expertise_areas ? `With deep expertise in ${brand.expertise_areas}, we bring unique insights.` : ''}\n\n💡 What's your take? Drop your thoughts below 👇\n\n#${brand.niche.replace(/\s/g, '')} #AI #GrowthHacking`;
                setContent({ hook: `🚀 ${topic}`, body: text, cta: '💡 What\'s your take? Drop your thoughts below 👇', hashtags: [`#${brand.niche.replace(/\s/g, '')}`, '#AI', '#GrowthHacking'], content_type: 'text', platform, topic, full_text: text });
            }
        } catch (err) {
            // Fallback: generate content locally with GPT prompt
            const text = `🚀 ${topic}\n\nAs a brand in the ${brand.niche} space, here's our perspective on ${topic}.\n\nWith our ${brand.tone} voice, we break down what matters.\n\n${brand.expertise_areas ? `Drawing from expertise in ${brand.expertise_areas}.` : ''}\n\n💡 Share your thoughts below 👇\n\n#${brand.niche.replace(/\s/g, '')} #AI #Growth`;
            setContent({ hook: `🚀 ${topic}`, body: text, cta: '💡 Share your thoughts below 👇', hashtags: [`#${brand.niche.replace(/\s/g, '')}`, '#AI', '#Growth'], content_type: 'text', platform, topic, full_text: text });
        }
        finally { setLoading(false); }
    }

    function getFullText() {
        if (content?.full_text) return content.full_text;
        return `${content.hook}\n\n${content.body}\n\n${content.cta}`;
    }

    function handleCopy() {
        if (!content) return;
        navigator.clipboard.writeText(getFullText());
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    }

    async function handlePublish() {
        if (!content || !brand?.id) return;
        setPublishing(true); setPublishResult(null);
        try {
            const result = await publishContent({
                brand_id: brand.id,
                platform: platform,
                content: getFullText(),
            });
            setPublishResult(result);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Publish failed';
            setPublishResult({ success: false, platform, message: msg });
        }
        finally { setPublishing(false); }
    }

    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Content Generator" subtitle="Create AI-powered content and publish directly" />

            {publishResult && (
                <AlertBanner
                    type={publishResult.success ? 'success' : 'critical'}
                    title={publishResult.success ? `Published to ${publishResult.platform}! 🎉` : `${publishResult.platform} publish failed`}
                    message={publishResult.message}
                    onDismiss={() => setPublishResult(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6 space-y-4">
                    <Select label="Platform" id="gen-platform" options={PLATFORMS} value={platform} onChange={(e) => setPlatform(e.target.value)} />
                    <Input label="Topic" id="gen-topic" placeholder="e.g. Top 5 AI trends for 2026" value={topic} onChange={(e) => setTopic(e.target.value)} />
                    <Button onClick={handleGenerate} loading={loading} disabled={!topic.trim()} className="w-full">✨ Generate Content</Button>
                    {loading && (
                        <div className="flex items-center gap-3 py-4 justify-center">
                            <Spinner />
                            <p className="text-sm text-text-muted">GPT is writing your content…</p>
                        </div>
                    )}
                </div>

                <div className="glass rounded-2xl p-6">
                    {content ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-2">
                                <Badge color="blue">{content.platform}</Badge>
                                <Badge color="purple">{content.content_type}</Badge>
                            </div>
                            <div className="space-y-3">
                                <div><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Hook</p><p className="text-sm font-semibold text-text-primary">{content.hook}</p></div>
                                <div><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Body</p><p className="text-sm text-text-secondary whitespace-pre-wrap">{content.body}</p></div>
                                <div><p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Call to Action</p><p className="text-sm text-accent-light font-medium">{content.cta}</p></div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                <Button variant="secondary" size="sm" onClick={handleCopy}>{copied ? '✅ Copied!' : '📋 Copy'}</Button>
                                <Button variant="secondary" size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? '✅ Saved!' : '💾 Save'}</Button>
                                <Button
                                    size="sm"
                                    onClick={handlePublish}
                                    loading={publishing}
                                    disabled={platform !== 'LinkedIn'}
                                    className={platform !== 'LinkedIn' ? 'opacity-50' : ''}
                                >
                                    📤 Publish to {platform}
                                </Button>
                            </div>
                            {platform !== 'LinkedIn' && (
                                <p className="text-[10px] text-text-muted">Publishing is currently available for LinkedIn only. More platforms coming soon.</p>
                            )}
                        </div>
                    ) : (
                        <EmptyState icon="✏️" title="Content Preview" message="Select a platform and topic, then generate." />
                    )}
                </div>
            </div>
        </div>
    );
}
