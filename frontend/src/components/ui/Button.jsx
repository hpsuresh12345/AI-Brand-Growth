const base = `inline-flex items-center justify-center font-semibold rounded-xl 
  transition-all duration-300 active:scale-[0.96] disabled:opacity-50 
  disabled:cursor-not-allowed disabled:pointer-events-none
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900`;

const variants = {
    primary: `bg-gradient-to-r from-violet-600 via-violet-500 to-blue-500 text-white 
      shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 
      hover:-translate-y-0.5 focus:ring-violet-500/50
      relative overflow-hidden before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
      before:translate-x-[-200%] hover:before:translate-x-[200%] 
      before:transition-transform before:duration-700`,
    
    secondary: `bg-slate-700/50 text-slate-300 border border-slate-600/30 
      hover:bg-slate-600/60 hover:text-white hover:border-slate-500/50
      hover:shadow-lg hover:shadow-slate-500/10 hover:-translate-y-0.5
      focus:ring-slate-500/50`,
    
    success: `bg-gradient-to-r from-emerald-600 to-emerald-500 text-white 
      shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/35 
      hover:-translate-y-0.5 focus:ring-emerald-500/50
      relative overflow-hidden before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
      before:translate-x-[-200%] hover:before:translate-x-[200%] 
      before:transition-transform before:duration-700`,
    
    danger: `bg-red-500/15 text-red-300 border border-red-500/25 
      hover:bg-red-500/30 hover:text-red-200 hover:border-red-500/40
      hover:shadow-lg hover:shadow-red-500/20 focus:ring-red-500/50`,
    
    ghost: `bg-transparent text-slate-400 hover:text-white hover:bg-white/5
      focus:ring-slate-500/50`,
    
    outline: `bg-transparent text-violet-400 border-2 border-violet-500/30 
      hover:bg-violet-500/10 hover:border-violet-500/50 hover:text-violet-300
      focus:ring-violet-500/50`,
};

const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({ 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    children, 
    loading = false,
    ...props 
}) {
    return (
        <button 
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Loading...</span>
                </>
            ) : children}
        </button>
    );
}
