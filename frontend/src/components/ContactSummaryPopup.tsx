import React, { useState, useEffect } from 'react';
import { getContact } from '../api/contacts';
import { Contact } from '../types/models';
import ContactDetailPanel from './ContactDetailPanel';

interface Props {
  contactId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const ContactSummaryPopup: React.FC<Props> = ({ contactId, onClose, onUpdate }) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const fetchContact = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const data = await getContact(contactId);
      setContact(data);
    } catch (error) {
      console.error('Failed to fetch contact summary', error);
    } finally {
      setLoading(false);
    }
  };

  if (!contactId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
            </div>
          ) : contact ? (
            <>
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{contact.first_name} {contact.last_name}</h2>
                  <p className="text-sm text-slate-500">{contact.job_title} @ {contact.company_name}</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
                    <p className="text-sm text-slate-900 mt-1 font-medium">{contact.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 border ${
                      contact.status === 'uploaded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      contact.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      contact.status === 'assigned_to_sdr' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {contact.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Company Status</label>
                    <p className="text-sm text-slate-700 mt-1">Approved</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned SDR</label>
                    <p className="text-sm text-slate-700 mt-1">{contact.assigned_sdr?.name || 'Unassigned'}</p>
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
      <ContactDetailPanel
        contactId={isDetailOpen ? contactId : null}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={() => { onUpdate(); fetchContact(); }}
      />
    </>
  );
};

export default ContactSummaryPopup;
