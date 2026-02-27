export default function Select({ label, options = [], placeholder = 'Select…', value, onChange, className = '', ...props }) {
    const handleChange = (e) => {
        console.log('🔽 Select changed:', e.target.value);
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="relative z-auto">
            {label && (
                <label className="block text-xs text-slate-400 mb-2 font-medium">
                    {label}
                </label>
            )}
            <select
                value={value || ''}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl
                    text-white text-sm outline-none transition-all duration-300 
                    focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 focus:bg-slate-800/70
                    hover:border-slate-700 cursor-pointer font-medium relative z-10
                    [appearance:none] [-webkit-appearance:none] [-moz-appearance:none]
                    pr-10 ${className}`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a78bfa' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center'
                }}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
