export default function EmptyState({ 
    icon = '🏗️', 
    title, 
    description, 
    action = null,
    compact = false 
}) {
    return (
        <div className={`flex flex-col items-center justify-center text-center animate-fadeIn
                        ${compact ? 'py-12 px-4' : 'py-24 px-6'}`}>
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 
                                rounded-full blur-3xl opacity-50" />
                <div className={`relative float-animation ${compact ? 'text-5xl mb-3' : 'text-7xl mb-5'}`}>
                    {icon}
                </div>
            </div>
            
            <h3 className={`font-bold text-white mb-3 
                           ${compact ? 'text-base' : 'text-xl'}`}>
                {title}
            </h3>
            
            <p className={`text-slate-400 max-w-md leading-relaxed
                          ${compact ? 'text-sm' : 'text-base'}`}>
                {description}
            </p>
            
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
