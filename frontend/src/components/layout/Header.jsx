import { useBrand } from '../../contexts/BrandContext';

export default function Header() {
    const { brand } = useBrand();

    return (
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-bg-secondary/80 backdrop-blur-xl flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                {brand ? (
                    <>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm font-semibold text-text-primary">{brand.name}</span>
                        <span className="text-xs text-text-muted px-2 py-0.5 rounded-lg bg-white/5 border border-border">{brand.niche}</span>
                    </>
                ) : (
                    <span className="text-sm text-text-muted">No brand selected</span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-xs font-medium text-text-muted">System Online</span>
                </div>
            </div>
        </header>
    );
}
