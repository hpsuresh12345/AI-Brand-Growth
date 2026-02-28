import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const MOBILE_NAV = [
    { path: '/', icon: '📊', label: 'Home' },
    { path: '/brand', icon: '🏢', label: 'Brand' },
    { path: '/generate', icon: '✨', label: 'Create' },
    { path: '/analytics', icon: '📈', label: 'Stats' },
    { path: '/alerts', icon: '🔔', label: 'Alerts' },
];

export default function CopilotLayout() {
    return (
        <div className="flex min-h-screen bg-bg-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-5 md:p-6 pb-24 md:pb-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/90 backdrop-blur-xl border-t border-border">
                <div className="flex items-center justify-around py-2">
                    {MOBILE_NAV.map(({ path, icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-accent-light' : 'text-text-muted'
                                }`
                            }
                        >
                            <span className="text-lg">{icon}</span>
                            <span className="text-[9px] font-semibold">{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
