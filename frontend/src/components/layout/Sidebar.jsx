import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/brand', label: 'Brand Profile', icon: '🏢' },
    { path: '/strategy', label: 'Strategy', icon: '🎯' },
    { path: '/generate', label: 'Generate', icon: '✨' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/optimization', label: 'Optimize', icon: '💡' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
    { path: '/reports', label: 'Reports', icon: '📋' },
];

export default function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-[240px] h-screen bg-bg-secondary border-r border-border sticky top-0">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-accent/20">
                        AI
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-text-primary tracking-tight">Growth Copilot</h1>
                        <p className="text-[10px] text-text-muted font-medium">AI Brand Engine</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ path, label, icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-accent/15 text-accent-light border border-accent/20 shadow-sm shadow-accent/10'
                                : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04] border border-transparent'
                            }`
                        }
                    >
                        <span className="text-base group-hover:scale-110 transition-transform duration-200">{icon}</span>
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-border">
                <div className="glass rounded-xl p-3 text-center">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Powered by</p>
                    <p className="text-xs font-bold gradient-text mt-0.5">Claude AI</p>
                </div>
            </div>
        </aside>
    );
}
