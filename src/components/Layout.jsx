import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Zap, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-background text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <span className="text-2xl">✨</span>
                    <span className="font-bold text-lg tracking-tight">Rel. Intelligence</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
                    <SidebarItem icon={Users} label="Clients" to="/clients" />
                    <SidebarItem icon={MessageSquare} label="Feed" to="/feed" />
                    <SidebarItem icon={Zap} label="Integrations" to="/integrations" />
                </nav>

                <div className="mt-auto">
                    <SidebarItem icon={Settings} label="Settings" to="/settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
