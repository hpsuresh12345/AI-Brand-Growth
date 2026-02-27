import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Sidebar, { NAV_ITEMS } from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function CopilotLayout() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Desktop & tablet sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 min-w-0 flex flex-col">
                <Header />

                {/* Mobile bottom nav */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-2 py-1.5 flex justify-around">
                    {NAV_ITEMS.slice(0, 5).map((n) => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all
                ${isActive ? 'text-blue-600' : 'text-gray-400'}`
                            }
                        >
                            <span className="text-base">{n.icon}</span>
                            <span>{n.label.split(' ')[0]}</span>
                        </NavLink>
                    ))}
                    <NavLink
                        to="/alerts"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all
              ${isActive ? 'text-blue-600' : 'text-gray-400'}`
                        }
                    >
                        <span className="text-base">🔔</span>
                        <span>Alerts</span>
                    </NavLink>
                </div>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 sm:pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
