import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/leads', icon: '👥', label: 'Leads' },
];

function SidebarLink({ to, icon, label }) {
    return (
        <NavLink to={to} end
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
                    ? 'bg-primary/12 text-primary-light shadow-sm shadow-primary/5'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03]'}`
            }
        >
            <span className="text-base">{icon}</span>
            <span className="hidden lg:inline">{label}</span>
        </NavLink>
    );
}

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex">
            {/* ── Sidebar ── */}
            <aside className="hidden sm:flex flex-col w-16 lg:w-60 border-r border-white/[0.06]
        bg-surface-card/50 backdrop-blur-xl shrink-0 sticky top-0 h-screen">
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-500
            flex items-center justify-center text-base font-bold text-white shadow-lg shadow-primary/20">
                        AI
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-bold text-text-primary leading-tight">Lead Engine</p>
                        <p className="text-[10px] text-text-muted font-medium">Real Estate AI</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1">
                    {NAV.map((n) => <SidebarLink key={n.to} {...n} />)}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="hidden lg:inline text-[11px] text-text-muted font-medium">Claude AI Active</span>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 min-w-0">
                {/* Mobile nav bar */}
                <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06]
          bg-surface-card/70 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-500
              flex items-center justify-center text-xs font-bold text-white">AI</div>
                        <span className="text-sm font-semibold text-text-primary">Lead Engine</span>
                    </div>
                    <div className="flex gap-1">
                        {NAV.map((n) => (
                            <NavLink key={n.to} to={n.to} end
                                className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isActive ? 'bg-primary/15 text-primary-light' : 'text-text-muted'}`
                                }>
                                {n.icon} {n.label}
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Page content */}
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
