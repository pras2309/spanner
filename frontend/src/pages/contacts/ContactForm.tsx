import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createContact, getContact, updateContact } from '../../api/contacts';
import { listCompanies } from '../../api/companies';
import { ContactCreate, Company } from '../../types/models';

const ContactForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<ContactCreate>>({
    first_name: '',
    last_name: '',
    email: '',
    company_id: '',
    job_title: '',
    mobile_phone: '',
    direct_phone: '',
    linkedin_url: '',
    linkedin_summary: '',
    lead_source: '',
    management_level: ''
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await listCompanies({ status: 'approved' });
        setCompanies(data);
      } catch (error) {
        console.error('Failed to fetch companies', error);
      }
    };

    const fetchContact = async () => {
      if (!isEdit) return;
      try {
        const data = await getContact(id!);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          company_id: data.company_id,
          job_title: data.job_title || '',
          mobile_phone: data.mobile_phone || '',
          direct_phone: data.direct_phone || '',
          linkedin_url: data.linkedin_url || '',
          linkedin_summary: data.linkedin_summary || '',
          lead_source: data.lead_source || '',
          management_level: data.management_level || ''
        });
      } catch (error) {
        console.error('Failed to fetch contact', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCompanies();
    fetchContact();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateContact(id!, formData as any);
      } else {
        await createContact(formData as ContactCreate);
      }
      navigate('/contacts');
    } catch (error) {
      console.error('Failed to save contact', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-4">
        <nav className="flex items-center text-sm font-medium text-slate-500 mb-4">
          <Link to="/contacts" className="hover:text-blue-600 transition-colors flex items-center">
            <span className="material-symbols-outlined text-base mr-1">arrow_back</span>
            Contacts
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-800">{isEdit ? 'Edit Contact' : 'Add New'}</span>
        </nav>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Contact' : 'Add New Contact'}</h1>
            <p className="mt-1 text-sm text-slate-500">Enter the details below to manually create or update a contact record.</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
              <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></label>
                <input name="first_name" required value={formData.first_name} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
                <input name="last_name" required value={formData.last_name} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5" />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
              <h2 className="text-lg font-semibold text-slate-900">Professional Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Company <span className="text-red-500">*</span></label>
                <select name="company_id" required value={formData.company_id} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5">
                  <option value="">Select a company...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Job Title</label>
                <input name="job_title" value={formData.job_title} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
                <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5" />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/contacts')} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
