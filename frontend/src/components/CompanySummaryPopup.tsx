import React, { useState, useEffect } from 'react';
import { getCompany } from '../api/companies';
import { Company } from '../types/models';
import CompanyDetailPanel from './CompanyDetailPanel';

interface Props {
  companyId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const CompanySummaryPopup: React.FC<Props> = ({ companyId, onClose, onUpdate }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const fetchCompany = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await getCompany(companyId);
      setCompany(data);
    } catch (error) {
      console.error('Failed to fetch company summary', error);
    } finally {
      setLoading(false);
    }
  };

  if (!companyId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
            </div>
          ) : company ? (
            <>
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{company.name}</h2>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                      {company.website.replace(/^https?:\/\//, '')}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  )}
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 border ${
                      company.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      company.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Segment</label>
                    <p className="text-sm text-slate-900 mt-1 font-medium">{company.segment?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</label>
                    <p className="text-sm text-slate-700 mt-1">{company.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</label>
                    <p className="text-sm text-slate-700 mt-1">Jane R.</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsDetailOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Full Details
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <CompanyDetailPanel
        companyId={isDetailOpen ? companyId : null}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={() => { onUpdate(); fetchCompany(); }}
      />
    </>
  );
};

export default CompanySummaryPopup;
