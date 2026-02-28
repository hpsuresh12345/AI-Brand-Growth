import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Button, Select, Input, Badge, Spinner, EmptyState } from '../components/ui';
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

    async function handleGenerate() {
        if (!topic.trim()) return;
        setLoading(true); setContent(null); setCopied(false); setSaved(false);
        try {
            const res = await axios.post('/api/growth/run-growth-cycle', { brand_id: brand.id });
            const result = res.data;
            if (result.content?.generated > 0) {
                setContent({ hook: `Generated content for "${topic}" on ${platform}`, body: `Content generated as part of growth cycle. ${result.content.generated} pieces created.`, cta: 'Check your Content Library to see all generated content.', hashtags: [], content_type: 'text', platform, topic });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    function handleCopy() {
        if (!content) return;
        const text = `${content.hook}\n\n${content.body}\n\n${content.cta}`;
        navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
    }

    if (!brand) return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Content Generator" subtitle="Create AI-powered content for any platform" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6 space-y-4">
                    <Select label="Platform" id="gen-platform" options={PLATFORMS} value={platform} onChange={(e) => setPlatform(e.target.value)} />
                    <Input label="Topic" id="gen-topic" placeholder="e.g. Top 5 AI trends for 2026" value={topic} onChange={(e) => setTopic(e.target.value)} />
                    <Button onClick={handleGenerate} loading={loading} disabled={!topic.trim()} className="w-full">✨ Generate Content</Button>
                    {loading && (
                        <div className="flex items-center gap-3 py-4 justify-center">
                            <Spinner />
                            <p className="text-sm text-text-muted">Claude is writing your content…</p>
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
                            <div className="flex gap-2 pt-2 border-t border-border">
                                <Button variant="secondary" size="sm" onClick={handleCopy}>{copied ? '✅ Copied!' : '📋 Copy'}</Button>
                                <Button variant="secondary" size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? '✅ Saved!' : '💾 Save'}</Button>
                            </div>
                        </div>
                    ) : (
                        <EmptyState icon="✏️" title="Content Preview" message="Select a platform and topic, then generate." />
                    )}
                </div>
            </div>
        </div>
    );
}
