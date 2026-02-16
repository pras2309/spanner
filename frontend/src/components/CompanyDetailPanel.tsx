import React, { useState, useEffect } from 'react';
import { getCompany, approveCompany, updateCompany } from '../api/companies';
import { Company } from '../types/models';
import CompanyRejectionModal from './CompanyRejectionModal';
import AssignmentModal from './AssignmentModal';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  companyId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const CompanyDetailPanel: React.FC<Props> = ({ companyId, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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
      console.error('Failed to fetch company details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!companyId) return;
    try {
      await approveCompany(companyId);
      onUpdate();
      fetchCompany();
    } catch (error) {
      console.error('Failed to approve company', error);
    }
  };

  const startEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const saveEdit = async () => {
    if (!companyId || !editingField) return;
    try {
      await updateCompany(companyId, { [editingField]: editValue });
      setEditingField(null);
      onUpdate();
      fetchCompany();
    } catch (error) {
      console.error('Failed to update company field', error);
    }
  };

  if (!companyId) return null;

  const canApprove = user?.roles.some(r => ['admin', 'approver'].includes(r.toLowerCase()));

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-[70] transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed inset-y-0 right-0 w-full md:w-[45%] bg-white shadow-2xl z-[80] transform transition-transform duration-300 flex flex-col border-l border-slate-200 translate-x-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
          </div>
        ) : company ? (
          <>
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CMP-{company.id.slice(0, 4)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${
                      company.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      company.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        company.status === 'pending' ? 'bg-amber-500' :
                        company.status === 'approved' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></span>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{company.name}</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {company.status === 'pending' && canApprove && (
                  <>
                    <button
                      onClick={handleApprove}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Approve
                    </button>
                    <button
                      onClick={() => setIsRejectModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">block</span>
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Assign
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar p-6 space-y-8">
              {company.status === 'rejected' && company.rejection_reason && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">error</span>
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{company.rejection_reason}</p>
                </div>
              )}

              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Company Details</h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <DetailItem label="Website" value={company.website} field="website" onEdit={startEdit} />
                  <DetailItem label="Segment" value={company.segment?.name} noEdit />
                  <DetailItem label="Industry" value={company.industry} field="industry" onEdit={startEdit} />
                  <DetailItem label="Sub-Industry" value={company.sub_industry} field="sub_industry" onEdit={startEdit} />
                  <DetailItem label="Revenue Range" value={company.revenue_range} field="revenue_range" onEdit={startEdit} />
                  <DetailItem label="Employee Size" value={company.employee_size_range} field="employee_size_range" onEdit={startEdit} />
                  <div className="col-span-2">
                    <DetailItem label="Description" value={company.description} field="description" onEdit={startEdit} isMultiline />
                  </div>
                </div>
              </section>

              {editingField && (
                <div className="fixed bottom-0 right-0 left-0 md:left-auto md:w-[45%] bg-blue-600 text-white p-4 flex items-center justify-between shadow-2xl z-[90]">
                  <div className="flex-1 mr-4">
                    <label className="block text-xs font-medium text-blue-100 mb-1 capitalize">{editingField.replace('_', ' ')}</label>
                    <input
                      autoFocus
                      className="w-full bg-blue-700 border-none rounded text-sm py-1 px-2 focus:ring-1 focus:ring-white"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                  </div>
                  <div className="text-xs text-blue-200">Saving...</div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      <CompanyRejectionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={async (reason) => {
          const { rejectCompany } = await import('../api/companies');
          await rejectCompany(companyId, reason);
          setIsRejectModalOpen(false);
          onUpdate();
          fetchCompany();
        }}
      />

      <AssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => { setIsAssignModalOpen(false); }}
        entityType="company"
        entityId={companyId}
        roleFilter="researcher"
      />
    </>
  );
};

const DetailItem = ({ label, value, field, onEdit, noEdit, isMultiline }: any) => (
  <div className={`group ${isMultiline ? '' : ''}`}>
    <label className="block text-xs font-medium text-slate-500 mb-1 group-hover:text-blue-600 transition-colors">{label}</label>
    <div
      className={`text-sm text-slate-900 ${noEdit ? '' : 'cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1 transition-colors'}`}
      onClick={() => !noEdit && onEdit(field, value)}
    >
      {value || <span className="text-slate-400 italic">None</span>}
    </div>
  </div>
);

export default CompanyDetailPanel;
