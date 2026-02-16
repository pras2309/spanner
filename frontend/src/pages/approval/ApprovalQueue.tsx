import React, { useState } from 'react';
import CompanyApprovalTab from './CompanyApprovalTab';
import ContactApprovalTab from './ContactApprovalTab';

const ApprovalQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'contacts'>('companies');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve pending companies and contacts.</p>
      </header>

      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('companies')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'companies' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Pending Companies
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Uploaded Contacts
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'companies' ? <CompanyApprovalTab /> : <ContactApprovalTab />}
      </div>
    </div>
  );
};

export default ApprovalQueue;
