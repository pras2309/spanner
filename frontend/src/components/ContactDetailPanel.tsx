import React, { useState, useEffect } from 'react';
import { getContact, updateContact, bulkApproveContacts, assignSDR, scheduleMeeting } from '../api/contacts';
import { Contact, User } from '../types/models';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  contactId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const ContactDetailPanel: React.FC<Props> = ({ contactId, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sdrUsers, setSdrUsers] = useState<User[]>([]);

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
      console.error('Failed to fetch contact details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSdrs = async () => {
    try {
      const response = await client.get<User[]>('/api/users');
      setSdrUsers(response.data.filter(u => u.roles.some(r => r.toLowerCase() === 'sdr')));
    } catch (error) {
      console.error('Failed to fetch SDRs', error);
    }
  };

  useEffect(() => {
    fetchSdrs();
  }, []);

  const handleApprove = async () => {
    if (!contactId) return;
    try {
      await bulkApproveContacts([contactId]);
      onUpdate();
      fetchContact();
    } catch (error) {
      console.error('Failed to approve contact', error);
    }
  };

  const handleAssignSdr = async (sdrId: string) => {
    if (!contactId) return;
    try {
      await assignSDR(contactId, sdrId);
      onUpdate();
      fetchContact();
    } catch (error) {
      console.error('Failed to assign SDR', error);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!contactId) return;
    try {
      await scheduleMeeting(contactId);
      onUpdate();
      fetchContact();
    } catch (error) {
      console.error('Failed to schedule meeting', error);
    }
  };

  const saveEdit = async () => {
    if (!contactId || !editingField) return;
    try {
      await updateContact(contactId, { [editingField]: editValue });
      setEditingField(null);
      onUpdate();
      fetchContact();
    } catch (error) {
      console.error('Failed to update contact field', error);
    }
  };

  if (!contactId) return null;

  const steps = ['uploaded', 'approved', 'assigned_to_sdr', 'meeting_scheduled'];
  const currentStepIdx = contact ? steps.indexOf(contact.status) : -1;

  const canApprove = user?.roles.some(r => ['admin', 'approver'].includes(r.toLowerCase()));
  const canAssign = user?.roles.some(r => ['admin', 'approver', 'researcher'].includes(r.toLowerCase()));

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
        ) : contact ? (
          <>
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">{contact.company_name}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{contact.first_name} {contact.last_name}</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between px-2 mb-2">
                  {steps.map((step, idx) => (
                    <div key={step} className={`h-1.5 flex-1 mx-0.5 rounded-full ${idx <= currentStepIdx ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 px-1">
                  <span>Uploaded</span>
                  <span>Approved</span>
                  <span>Assigned</span>
                  <span>Meeting</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {contact.status === 'uploaded' && canApprove && (
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Approve
                  </button>
                )}
                {contact.status === 'approved' && canAssign && (
                  <div className="flex-1 relative group">
                    <select
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors appearance-none text-center cursor-pointer"
                      onChange={(e) => handleAssignSdr(e.target.value)}
                      value=""
                    >
                      <option value="" disabled>Assign to SDR</option>
                      {sdrUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-2 text-white pointer-events-none">expand_more</span>
                  </div>
                )}
                {contact.status === 'assigned_to_sdr' && (
                  <button
                    onClick={handleScheduleMeeting}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    Schedule Meeting
                  </button>
                )}
                <button className="p-2 border border-slate-300 rounded-md text-slate-500 hover:bg-slate-50">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar p-6 space-y-8">
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Details</h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <DetailItem label="Email" value={contact.email} field="email" onEdit={(f: any, v: any) => { setEditingField(f); setEditValue(v); }} />
                  <DetailItem label="Mobile Phone" value={contact.mobile_phone} field="mobile_phone" onEdit={(f: any, v: any) => { setEditingField(f); setEditValue(v); }} />
                  <DetailItem label="Job Title" value={contact.job_title} field="job_title" onEdit={(f: any, v: any) => { setEditingField(f); setEditValue(v); }} />
                  <DetailItem label="Management Level" value={contact.management_level} field="management_level" onEdit={(f: any, v: any) => { setEditingField(f); setEditValue(v); }} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Activity History</h3>
                <div className="relative pl-4 border-l border-slate-200 space-y-6">
                   <div className="text-xs text-slate-500 italic">Timeline events would appear here based on audit logs.</div>
                </div>
              </section>
            </div>

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
          </>
        ) : null}
      </div>
    </>
  );
};

const DetailItem = ({ label, value, field, onEdit, noEdit }: any) => (
  <div className="group">
    <label className="block text-xs font-medium text-slate-500 mb-1 group-hover:text-blue-600 transition-colors">{label}</label>
    <div
      className={`text-sm text-slate-900 ${noEdit ? '' : 'cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1 transition-colors'}`}
      onClick={() => !noEdit && onEdit(field, value)}
    >
      {value || <span className="text-slate-400 italic">None</span>}
    </div>
  </div>
);

export default ContactDetailPanel;
