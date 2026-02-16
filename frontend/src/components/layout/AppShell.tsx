import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSearch from '../GlobalSearch';

const AppShell: React.FC = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Map paths to titles
  const getTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/companies')) return 'Companies';
    if (path.startsWith('/contacts')) return 'Contacts';
    if (path.startsWith('/segments')) return 'Segments';
    if (path.startsWith('/users')) return 'User Management';
    if (path.startsWith('/approval-queue')) return 'Approval Queue';
    if (path.startsWith('/workbench')) return 'Researcher Workbench';
    if (path.startsWith('/upload')) return 'CSV Import';
    if (path.startsWith('/collaterals')) return 'Marketing Collateral';
    return 'Spanner';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle(location.pathname)} onSearchOpen={() => setIsSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default AppShell;
