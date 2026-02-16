import React, { useState, useEffect } from 'react';
import { getApprovalQueueCompanies, approveCompany } from '../../api/companies';
import { Company } from '../../types/models';
import CompanyRejectionModal from '../../components/CompanyRejectionModal';

const CompanyApprovalTab: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getApprovalQueueCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch approval queue', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveCompany(id);
      fetchQueue();
    } catch (error) {
      console.error('Failed to approve company', error);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Segment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Researcher</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Upload Date</th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {loading ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
          ) : companies.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">No pending companies</td></tr>
          ) : companies.map((company) => (
            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                    {company.name[0]}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-slate-900">{company.name}</div>
                    <div className="text-sm text-slate-500">{company.website}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{company.segment?.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                Jane Researcher
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {new Date(company.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleApprove(company.id)}
                    className="bg-green-50 text-green-700 hover:bg-green-100 border border-transparent rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1">check</span>
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-transparent rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1">close</span>
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCompany && (
        <CompanyRejectionModal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onConfirm={async (reason) => {
            const { rejectCompany } = await import('../../api/companies');
            await rejectCompany(selectedCompany.id, reason);
            setSelectedCompany(null);
            fetchQueue();
          }}
        />
      )}
    </div>
  );
};

export default CompanyApprovalTab;
