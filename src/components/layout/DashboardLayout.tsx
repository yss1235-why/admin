import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser, adminData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navigationItems = [
    {
      title: 'Host Management',
      path: '/dashboard/hosts',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Subscriptions',
      path: '/dashboard/subscriptions',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="px-4 py-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Tambola Admin</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {adminData?.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3">{adminData?.username}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-margin duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;