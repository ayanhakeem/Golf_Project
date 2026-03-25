import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-forest-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight text-gold-500 flex items-center gap-2">
              <span className="text-3xl">⛳</span> Golf for Good
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link to="/charities" className="text-forest-100 hover:text-white font-medium transition-colors">
              Charities
            </Link>
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-forest-100 hover:text-white font-medium transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 border-l border-forest-500 pl-4">
                  <span className="text-sm text-forest-100 flex items-center gap-2">
                    <UserIcon size={16} />
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-forest-100 hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-forest-100 hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/subscribe"
                  className="bg-gold-500 text-forest-700 hover:bg-gold-400 px-5 py-2 rounded-full font-bold transition-all shadow-sm"
                >
                  Subscribe
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
