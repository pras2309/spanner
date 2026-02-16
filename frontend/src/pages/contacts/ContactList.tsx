import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listContacts } from '../../api/contacts';
import { Contact } from '../../types/models';
import ContactSummaryPopup from '../../components/ContactSummaryPopup';
import { useAuth } from '../../contexts/AuthContext';

const ContactList: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await listContacts({ search });
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const canCreate = user?.roles.some(r => ['admin', 'researcher'].includes(r.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between flex-shrink-0 -mt-8 -mx-8 mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Contacts</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined !text-lg">download</span>
            Export CSV
          </button>
          {canCreate && (
            <Link to="/contacts/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-lg">add</span>
              Create Contact
            </Link>
          )}
        </div>
      </header>

      <div className="px-8 py-4 bg-white border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between -mx-8 -mt-8 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <span className="material-symbols-outlined !text-lg">search</span>
            </span>
            <input
              className="w-full py-2 pl-10 pr-3 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              placeholder="Search contacts..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned SDR</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No contacts found</td></tr>
              ) : contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</span>
                      <span className="text-xs text-gray-500">{contact.job_title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                        {contact.company_name?.[0] || 'C'}
                      </div>
                      <span className="text-sm text-gray-900">{contact.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      contact.status === 'uploaded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      contact.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      contact.status === 'assigned_to_sdr' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {contact.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.assigned_sdr ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">
                          {contact.assigned_sdr.name[0]}
                        </div>
                        <span>{contact.assigned_sdr.name}</span>
                      </div>
                    ) : (
                      <span className="italic text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ContactSummaryPopup
        contactId={selectedContactId}
        onClose={() => setSelectedContactId(null)}
        onUpdate={fetchContacts}
      />
    </div>
  );
};

export default ContactList;
