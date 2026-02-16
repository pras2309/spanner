import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CompanyRejectionModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <span className="material-symbols-outlined">block</span>
            <h2 className="text-lg font-semibold">Reject Company</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <p className="text-sm text-amber-700">
              <strong>Warning:</strong> This action is permanent. The company cannot be re-submitted for approval once rejected.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              className="w-full rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500 text-sm"
              placeholder="Explain why this company is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
            onClick={() => onConfirm(reason)}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyRejectionModal;
