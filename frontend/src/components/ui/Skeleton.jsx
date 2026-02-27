export default function Skeleton({ className = '', variant = 'default', ...props }) {
    const variants = {
        default: 'h-4 w-full',
        text: 'h-4 w-3/4',
        title: 'h-6 w-1/2',
        avatar: 'h-12 w-12 rounded-full',
        card: 'h-32 w-full',
        button: 'h-10 w-24 rounded-xl',
    };

    return (
        <div
            className={`skeleton ${variants[variant]} ${className}`}
            {...props}
        />
    );
}

export function LeadCardSkeleton() {
    return (
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/30 space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="avatar" className="w-10 h-10 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
            </div>
            
            <div className="flex justify-around items-center py-3 px-2 bg-white/[0.02] rounded-xl">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-14 w-14 rounded-full" />
            </div>
            
            <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            
            <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 w-12 rounded-xl" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/30 space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="h-64 bg-slate-800/30 rounded-xl border border-slate-700/20 flex items-end justify-around p-4 gap-2">
                {[60, 80, 45, 90, 70].map((height, i) => (
                    <div key={i} className="flex-1 bg-slate-700/30 rounded-t-lg animate-pulse" 
                         style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }} />
                ))}
            </div>
        </div>
    );
}
