import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Pending Companies', value: '24', icon: 'domain_verification', color: 'text-amber-600', bg: 'bg-amber-50', link: '/approval-queue' },
    { label: 'Approved Contacts', value: '1,284', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50', link: '/contacts' },
    { label: 'Active Segments', value: '8', icon: 'pie_chart', color: 'text-blue-600', bg: 'bg-blue-50', link: '/segments' },
  ];

  const recentActivity = [
    { text: 'Approved Acme Corp', time: '1h ago', icon: 'check', color: 'text-green-600', bg: 'bg-green-100' },
    { text: 'Jane R. uploaded contacts.csv', time: '3h ago', icon: 'upload_file', color: 'text-blue-600', bg: 'bg-blue-100' },
    { text: 'Meeting scheduled with GlobalTech', time: '5h ago', icon: 'event', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || 'User'}</h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening in your workspace today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-2 ${stat.bg} rounded-lg`}>
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">Since last week</span>
              <Link to={stat.link} className="text-blue-600 hover:text-blue-700 text-xs font-medium">View all →</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Pipeline Velocity</h3>
          <div className="h-64 w-full bg-slate-50 rounded-lg flex items-end justify-between px-8 pb-4 gap-4">
             <div className="w-full bg-blue-100 rounded-t h-[40%]"></div>
             <div className="w-full bg-blue-200 rounded-t h-[65%]"></div>
             <div className="w-full bg-blue-300 rounded-t h-[55%]"></div>
             <div className="w-full bg-blue-400 rounded-t h-[80%]"></div>
             <div className="w-full bg-blue-500 rounded-t h-[30%]"></div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] uppercase font-bold text-slate-400 px-2">
            <span>Research</span>
            <span>Approval</span>
            <span>Handoff</span>
            <span>Meetings</span>
            <span>Closed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, idx) => (
                <li key={idx} className="relative pb-8">
                  {idx !== recentActivity.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.bg}`}>
                        <span className={`material-symbols-outlined text-sm ${activity.color}`}>{activity.icon}</span>
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-slate-600">{activity.text}</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-xs text-slate-400">{activity.time}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
