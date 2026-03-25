import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Trophy, ClipboardCheck } from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/dashboard'); // Kick out non-admins
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="p-12"><LoadingSkeleton type="text" /></div>;
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/charities', icon: Users, label: 'Charities' },
    { to: '/admin/draws', icon: Trophy, label: 'Draw Engine' },
    { to: '/admin/winners', icon: ClipboardCheck, label: 'Verifications' },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-forest-800 text-white shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gold-500 tracking-tight flex items-center gap-2">
            <span className="bg-white/10 p-1.5 rounded disabled">👑</span> Admin Portal
          </h2>
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? 'bg-forest-600 text-white shadow-sm' : 'text-forest-200 hover:bg-forest-700 hover:text-white'
                }`
              }
            >
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
