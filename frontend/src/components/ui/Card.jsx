export default function Card({ 
    children, 
    hover = true, 
    className = '', 
    glow = false,
    gradient = false,
    ...props 
}) {
    const baseStyles = `
        rounded-2xl
        bg-slate-800/50 backdrop-blur-xl
        border border-slate-700/30
        shadow-lg shadow-black/10
        transition-all duration-300
    `;
    
    const hoverStyles = hover ? `
        hover:border-slate-600/50 
        hover:shadow-2xl 
        hover:shadow-violet-500/10 
        hover:-translate-y-1
        cursor-pointer
    ` : '';
    
    const glowStyles = glow ? `
        before:absolute before:inset-0 before:rounded-2xl 
        before:bg-gradient-to-br before:from-violet-500/5 before:to-blue-500/5
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
        relative overflow-hidden
    ` : '';
    
    const gradientStyles = gradient ? `
        bg-gradient-to-br from-slate-800/60 to-slate-800/40
        border-slate-600/40
    ` : '';
    
    return (
        <div
            className={`
                ${baseStyles}
                ${hoverStyles}
                ${glowStyles}
                ${gradientStyles}
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}
