import { useBrand } from '../../contexts/BrandContext';

export default function Header() {
    const { brand } = useBrand();

    return (
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {brand?.name || 'AI Brand Growth Copilot'}
                    </h2>
                    {brand?.niche && (
                        <p className="text-xs text-gray-400 mt-0.5">{brand.niche}</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs text-gray-500 font-medium">System Online</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
