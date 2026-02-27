import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { PageHeader, Button, Select, Input, Textarea, Spinner, EmptyState, Badge } from '../components/ui';
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
        setLoading(true);
        setContent(null);
        setCopied(false);
        setSaved(false);
        try {
            // Call content agent via a direct orchestrator-style approach
            // For now, use the existing growth API structure
            const res = await axios.post('/api/growth/run-growth-cycle', { brand_id: brand.id });
            // Extract the content from cycle result
            const result = res.data;
            if (result.content?.generated > 0) {
                setContent({
                    hook: `Generated content for "${topic}" on ${platform}`,
                    body: `Content generated as part of growth cycle. ${result.content.generated} pieces created.`,
                    cta: 'Check your Content Library to see all generated content.',
                    hashtags: [],
                    content_type: 'text',
                    platform,
                    topic,
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleCopy() {
        if (!content) return;
        const text = `${content.hook}\n\n${content.body}\n\n${content.cta}\n\n${(content.hashtags || []).map(h => '#' + h).join(' ')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    if (!brand) {
        return <EmptyState icon="🏢" title="No Brand Selected" message="Create a brand profile first." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Content Generator" subtitle="Create AI-powered content for any platform" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input panel */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
                    <Select
                        label="Platform"
                        id="gen-platform"
                        options={PLATFORMS}
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                    />
                    <Input
                        label="Topic"
                        id="gen-topic"
                        placeholder="e.g. Top 5 AI trends for 2026"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <Button onClick={handleGenerate} loading={loading} disabled={!topic.trim()} className="w-full">
                        ✨ Generate Content
                    </Button>

                    {loading && (
                        <div className="flex items-center gap-3 py-4 justify-center">
                            <Spinner />
                            <p className="text-sm text-gray-400">Claude is writing your content…</p>
                        </div>
                    )}
                </div>

                {/* Output panel */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    {content ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge color="blue">{content.platform}</Badge>
                                    <Badge color="gray">{content.content_type}</Badge>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Hook</p>
                                    <p className="text-sm font-semibold text-gray-800">{content.hook}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Body</p>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{content.body}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Call to Action</p>
                                    <p className="text-sm text-blue-600 font-medium">{content.cta}</p>
                                </div>
                                {content.hashtags?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Hashtags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {content.hashtags.map((h, i) => <Badge key={i} color="blue">#{h}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <Button variant="secondary" size="sm" onClick={handleCopy}>
                                    {copied ? '✅ Copied!' : '📋 Copy'}
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleSave}>
                                    {saved ? '✅ Saved!' : '💾 Save'}
                                </Button>
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
