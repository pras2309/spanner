import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/', roles: ['admin'] },
    { label: 'User Management', icon: 'manage_accounts', path: '/users', roles: ['admin'] },
    { label: 'Segments', icon: 'pie_chart', path: '/segments', roles: ['admin', 'segment_owner', 'researcher', 'approver', 'sdr', 'marketing'] },
    { label: 'Companies', icon: 'domain', path: '/companies', roles: ['admin', 'segment_owner', 'researcher', 'approver', 'sdr'] },
    { label: 'Contacts', icon: 'group', path: '/contacts', roles: ['admin', 'segment_owner', 'researcher', 'approver', 'sdr'] },
    { label: 'Approval Queue', icon: 'fact_check', path: '/approval-queue', roles: ['admin', 'approver', 'sdr'], badge: 12 },
    { label: 'Workbench', icon: 'science', path: '/workbench', roles: ['researcher', 'approver'] },
    { label: 'CSV Upload', icon: 'upload_file', path: '/upload', roles: ['admin', 'researcher', 'approver'] },
    { label: 'Collateral', icon: 'folder_open', path: '/collaterals', roles: ['admin', 'marketing'] },
  ];

  const filteredItems = navItems.filter(item =>
    !item.roles || (user?.roles && user.roles.some(r => item.roles.includes(r.toLowerCase())))
  );

  return (
    <aside className="w-64 flex flex-col bg-white border-r border-slate-200 h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>build_circle</span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Spanner</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-50">
        <Link to="/settings" className="flex items-center px-2 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined mr-3 text-[20px]">settings</span>
          Settings
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
