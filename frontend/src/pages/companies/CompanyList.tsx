import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listCompanies } from '../../api/companies';
import { Company } from '../../types/models';
import CompanySummaryPopup from '../../components/CompanySummaryPopup';
import { useAuth } from '../../contexts/AuthContext';

const CompanyList: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params: any = { search };
      if (statusFilter) params.status = statusFilter;
      const data = await listCompanies(params);
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, statusFilter]);

  const canCreate = user?.roles.some(r => ['admin', 'researcher'].includes(r.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <header className="flex-none flex items-center justify-between mb-8 -mt-8 -mx-8 bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-800">Companies</h1>
          <div className="h-4 w-px bg-slate-300 mx-2"></div>
          <div className="text-sm text-slate-500">All Companies</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          {canCreate && (
            <Link to="/companies/new" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Company
            </Link>
          )}
        </div>
      </header>

      <div className="px-8 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4 flex-wrap -mx-8 -mt-8 mb-6">
        <div className="relative max-w-xs w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[20px]">search</span>
          <input
            className="w-full pl-9 pr-3 py-1.5 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search companies..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="h-6 w-px bg-slate-300"></div>
        <select
          className="text-sm border-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 text-slate-600"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status: All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created At</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">No companies found</td>
                </tr>
              ) : companies.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{company.name}</div>
                    <div className="text-xs text-slate-500">{company.website}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {company.segment?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      company.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      company.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {company.industry || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CompanySummaryPopup
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
        onUpdate={fetchCompanies}
      />
    </div>
  );
};

export default CompanyList;
