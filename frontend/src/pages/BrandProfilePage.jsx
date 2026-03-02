import { useState } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { createBrand, getStrategy } from '../api/growthApi';
import { PageHeader, Button, Input, Textarea, EmptyState, Badge, Spinner } from '../components/ui';

export default function BrandProfilePage() {
    const { brand, setBrand } = useBrand();
    const [form, setForm] = useState({
        name: '', niche: '', target_audience: '', tone: '', expertise_areas: '', growth_goal: '',
        linkedin_handle: '', linkedin_access_token: '', instagram_handle: '', twitter_handle: '',
    });
    const [saving, setSaving] = useState(false);
    const [strategy, setStrategy] = useState(null);
    const [stratLoading, setStratLoading] = useState(false);
    const [error, setError] = useState('');
    const [showToken, setShowToken] = useState(false);

    function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.niche || !form.target_audience || !form.tone) { setError('Please fill all required fields.'); return; }
        setSaving(true); setError('');
        try {
            const result = await createBrand(form);
            setBrand(result);
            setForm({
                name: '', niche: '', target_audience: '', tone: '', expertise_areas: '', growth_goal: '',
                linkedin_handle: '', linkedin_access_token: '', instagram_handle: '', twitter_handle: ''
            });
        } catch (err) { setError(err.response?.data?.detail || 'Failed to create profile.'); }
        finally { setSaving(false); }
    }

    async function loadStrategy() {
        if (!brand?.id) return;
        setStratLoading(true);
        try { const data = await getStrategy(brand.id); setStrategy(data); }
        catch { setStrategy(null); }
        finally { setStratLoading(false); }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Brand Profile" subtitle="Define your brand identity, social accounts, and growth objectives" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">{brand ? 'Create Another Brand' : 'Create Brand Profile'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Brand Name *" name="name" id="brand-name" placeholder="e.g. TechVibe AI" value={form.name} onChange={handleChange} />
                            <Input label="Niche *" name="niche" id="brand-niche" placeholder="e.g. SaaS, E-commerce" value={form.niche} onChange={handleChange} />
                            <Textarea label="Target Audience *" name="target_audience" id="brand-audience" placeholder="Describe your ideal audience…" value={form.target_audience} onChange={handleChange} />
                            <Input label="Brand Tone *" name="tone" id="brand-tone" placeholder="e.g. Bold & conversational" value={form.tone} onChange={handleChange} />
                            <Input label="Expertise Areas" name="expertise_areas" id="brand-expertise" placeholder="e.g. AI, Growth Marketing" value={form.expertise_areas} onChange={handleChange} />
                            <Textarea label="Growth Goal" name="growth_goal" id="brand-goal" placeholder="e.g. 10k LinkedIn followers in 90 days" value={form.growth_goal} onChange={handleChange} />
                        </form>
                    </div>

                    {/* Social Accounts */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-sm font-semibold text-text-primary">Social Media Accounts</h3>
                            <Badge color="blue">Publishing</Badge>
                        </div>
                        <div className="space-y-4">
                            <Input label="LinkedIn Profile URL" name="linkedin_handle" id="brand-linkedin" placeholder="https://linkedin.com/in/yourname" value={form.linkedin_handle} onChange={handleChange} />
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="brand-linkedin-token" className="block text-xs font-semibold text-text-muted uppercase tracking-wider">LinkedIn Access Token</label>
                                    <button type="button" onClick={() => setShowToken(!showToken)} className="text-[10px] text-accent-light hover:underline cursor-pointer">{showToken ? 'Hide' : 'Show'}</button>
                                </div>
                                <input
                                    id="brand-linkedin-token"
                                    name="linkedin_access_token"
                                    type={showToken ? 'text' : 'password'}
                                    placeholder="Paste your LinkedIn OAuth access token"
                                    value={form.linkedin_access_token}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/[0.03] text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all hover:border-border-hover"
                                />
                                <p className="text-[9px] text-text-muted/50 mt-1">Get this from <a href="https://www.linkedin.com/developers/" target="_blank" rel="noreferrer" className="text-accent-light hover:underline">LinkedIn Developers</a></p>
                            </div>
                            <Input label="Instagram Handle" name="instagram_handle" id="brand-instagram" placeholder="@yourbrand" value={form.instagram_handle} onChange={handleChange} />
                            <Input label="Twitter/X Handle" name="twitter_handle" id="brand-twitter" placeholder="@yourbrand" value={form.twitter_handle} onChange={handleChange} />
                        </div>
                    </div>

                    {error && <p className="text-xs text-danger">{error}</p>}
                    <Button type="submit" loading={saving} className="w-full" onClick={handleSubmit}>Save Brand Profile</Button>
                </div>

                {/* Profile + Strategy */}
                <div className="space-y-4">
                    {brand ? (
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-text-primary">Active Brand</h3>
                                <Badge color="green">Active</Badge>
                            </div>
                            <div className="space-y-3">
                                {[['Name', brand.name], ['Niche', brand.niche], ['Audience', brand.target_audience], ['Tone', brand.tone], ['Expertise', brand.expertise_areas], ['Goal', brand.growth_goal], ['Created', brand.created_at ? new Date(brand.created_at).toLocaleDateString() : '—']].map(([l, v]) => (
                                    <div key={l}>
                                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{l}</p>
                                        <p className="text-sm text-text-secondary mt-0.5">{v || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyState icon="🏢" title="No Brand Yet" message="Fill out the form to create your brand profile." />
                    )}

                    {/* Social Accounts Status */}
                    {brand && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Connected Accounts</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">🔗 LinkedIn</span>
                                    {brand.linkedin_handle ? <Badge color="green">Connected</Badge> : <Badge color="gray">Not connected</Badge>}
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">📸 Instagram</span>
                                    {brand.instagram_handle ? <Badge color="green">{brand.instagram_handle}</Badge> : <Badge color="gray">Not connected</Badge>}
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-text-secondary">🐦 Twitter/X</span>
                                    {brand.twitter_handle ? <Badge color="green">{brand.twitter_handle}</Badge> : <Badge color="gray">Not connected</Badge>}
                                </div>
                            </div>
                        </div>
                    )}

                    {brand && (
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-text-primary">Strategy Preview</h3>
                                <Button variant="ghost" size="sm" onClick={loadStrategy} loading={stratLoading}>Refresh</Button>
                            </div>
                            {strategy ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-text-muted">Pillars: {strategy.content_pillars?.length || 0}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(strategy.content_pillars || []).map((p, i) => <Badge key={i} color="purple">{typeof p === 'string' ? p : p.name}</Badge>)}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-text-muted">No strategy generated yet. Run a growth cycle first.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
