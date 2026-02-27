import { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const TIMELINES = ['Immediately', '1-3 months', '3-6 months', '6+ months'];
const TYPES = ['1BHK', '2BHK', '3BHK', 'Villa', 'Plot', 'Commercial'];
const LOANS = ['Pre-approved', 'Applied', 'In progress', 'Not started'];

export default function LeadForm({ onSubmit, loading }) {
    const [form, setForm] = useState({
        name: '', phone: '', budget: '', location: '',
        timeline: '', property_type: '', loan_status: '', message: '',
    });
    
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (field) => (e) => {
        const newValue = e.target.value;
        setForm((f) => ({ ...f, [field]: newValue }));
        console.log(`✏️ Field '${field}' changed to:`, newValue);
        if (touched[field]) {
            // Clear touched on change for better UX
        }
    };
    
    const handleBlur = (field) => () => {
        setTouched((t) => ({ ...t, [field]: true }));
    };
    
    // Validation
    const errors = {
        name: touched.name && !form.name ? 'Name is required' : '',
        phone: touched.phone && !form.phone ? 'Phone is required' : 
               touched.phone && !/^[0-9]{10}$/.test(form.phone) ? 'Enter valid 10-digit number' : '',
        budget: touched.budget && !form.budget ? 'Budget is required' : 
                touched.budget && parseInt(form.budget) < 100000 ? 'Minimum ₹1L budget' : '',
        location: touched.location && !form.location ? 'Location is required' : '',
    };
    
    const isValid = form.name && form.phone && /^[0-9]{10}$/.test(form.phone) && 
                    form.budget && parseInt(form.budget) >= 100000 && form.location;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Mark all as touched to show errors
        setTouched({ name: true, phone: true, budget: true, location: true });
        
        if (!isValid) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({ ...form, budget: parseInt(form.budget, 10) || 0 });
            // Reset form on success
            setForm({
                name: '', phone: '', budget: '', location: '',
                timeline: '', property_type: '', loan_status: '', message: ''
            });
            setTouched({});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card hover={false} glow={false} className="p-6 animate-slideInLeft">
            {/* Header with icon animation */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 
                                flex items-center justify-center text-lg float-animation 
                                border border-violet-500/20 shadow-lg shadow-violet-500/10">
                    🏠
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">New Lead</h2>
                    <p className="text-xs text-slate-400">AI-powered lead scoring</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name & Phone */}
                <div className="grid grid-cols-2 gap-3">
                    <Input 
                        label="Full Name *" 
                        placeholder="Rahul Sharma" 
                        value={form.name} 
                        onChange={set('name')}
                        onBlur={handleBlur('name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        icon={<span className="text-sm">👤</span>}
                        required 
                    />
                    <Input 
                        label="Phone *" 
                        placeholder="9876543210" 
                        value={form.phone} 
                        onChange={set('phone')}
                        onBlur={handleBlur('phone')}
                        error={!!errors.phone}
                        success={form.phone && !errors.phone && touched.phone}
                        helperText={errors.phone}
                        icon={<span className="text-sm">📱</span>}
                        maxLength={10}
                        required 
                    />
                </div>
                
                {/* Budget & Location */}
                <div className="grid grid-cols-2 gap-3">
                    <Input 
                        label="Budget (₹) *" 
                        placeholder="5000000" 
                        type="number" 
                        value={form.budget} 
                        onChange={set('budget')}
                        onBlur={handleBlur('budget')}
                        error={!!errors.budget}
                        success={form.budget && !errors.budget && touched.budget}
                        helperText={errors.budget}
                        icon={<span className="text-sm">💰</span>}
                        required 
                    />
                    <Input 
                        label="Location *" 
                        placeholder="Whitefield, Bangalore" 
                        value={form.location} 
                        onChange={set('location')}
                        onBlur={handleBlur('location')}
                        error={!!errors.location}
                        success={form.location && !errors.location && touched.location}
                        helperText={errors.location}
                        icon={<span className="text-sm">📍</span>}
                        required 
                    />
                </div>
                
                {/* Dropdowns */}
                <div className="grid grid-cols-3 gap-3 relative z-10">
                    <Select 
                        label="Timeline" 
                        options={TIMELINES} 
                        value={form.timeline} 
                        onChange={set('timeline')} 
                    />
                    <Select 
                        label="Property" 
                        options={TYPES} 
                        value={form.property_type} 
                        onChange={set('property_type')} 
                    />
                    <Select 
                        label="Loan" 
                        options={LOANS} 
                        value={form.loan_status} 
                        onChange={set('loan_status')} 
                    />
                </div>
                
                {/* Message */}
                <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Additional Notes</label>
                    <textarea
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl
                                   text-slate-100 text-sm placeholder-slate-500/60 outline-none resize-none
                                   transition-all duration-300 focus:border-violet-500/60 focus:ring-2 
                                   focus:ring-violet-500/15 hover:border-white/[0.14] focus:bg-white/[0.05]
                                   font-medium"
                        rows={3} 
                        placeholder="Any specific requirements or preferences..."
                        value={form.message} 
                        onChange={set('message')} 
                    />
                </div>
                
                {/* Submit Button */}
                <Button 
                    type="submit" 
                    disabled={!isValid || loading || isSubmitting}
                    loading={loading || isSubmitting}
                    className="w-full"
                    size="lg"
                >
                    {loading || isSubmitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <span className="text-lg">🚀</span>
                            Submit & Analyze
                        </>
                    )}
                </Button>
                
                {/* Info text */}
                <p className="text-center text-xs text-slate-500 mt-3">
                    🤖 Powered by <span className="text-violet-400 font-semibold">Claude AI</span> for intelligent lead scoring
                </p>
            </form>
        </Card>
    );
}
