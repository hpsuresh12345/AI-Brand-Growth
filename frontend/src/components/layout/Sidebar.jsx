import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/brand', icon: '🏢', label: 'Brand Profile' },
    { to: '/strategy', icon: '🎯', label: 'Strategy' },
    { to: '/generate', icon: '✏️', label: 'Content Generator' },
    { to: '/library', icon: '📚', label: 'Content Library' },
    { to: '/analytics', icon: '📈', label: 'Analytics' },
    { to: '/optimization', icon: '💡', label: 'Optimization' },
    { to: '/alerts', icon: '🔔', label: 'Alerts' },
    { to: '/reports', icon: '📄', label: 'Reports' },
];

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`
            }
        >
            <span className="text-base w-6 text-center shrink-0">{icon}</span>
            <span className="hidden lg:inline truncate">{label}</span>
        </NavLink>
    );
}

export default function Sidebar() {
    return (
        <aside className="hidden sm:flex flex-col w-16 lg:w-64 border-r border-gray-200 bg-white shrink-0 sticky top-0 h-screen">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    AI
                </div>
                <div className="hidden lg:block">
                    <p className="text-sm font-bold text-gray-800 leading-tight">Growth Copilot</p>
                    <p className="text-[10px] text-gray-400 font-medium">AI Brand Engine</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((n) => (
                    <NavItem key={n.to} {...n} />
                ))}
            </nav>

            {/* Footer status */}
            <div className="p-3 border-t border-gray-100">
                <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden lg:inline text-[11px] text-gray-400 font-medium">Claude AI Active</span>
                </div>
            </div>
        </aside>
    );
}

export { NAV_ITEMS };
