import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCompany, getCompany, updateCompany } from '../../api/companies';
import { listSegments } from '../../api/segments';
import { CompanyCreate, Segment } from '../../types/models';

const CompanyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<CompanyCreate>>({
    name: '',
    website: '',
    phone: '',
    description: '',
    linkedin_url: '',
    industry: '',
    sub_industry: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_country: '',
    address_zip: '',
    founded_year: undefined,
    revenue_range: '',
    employee_size_range: '',
    segment_id: ''
  });

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const data = await listSegments('active');
        setSegments(data);
      } catch (error) {
        console.error('Failed to fetch segments', error);
      }
    };

    const fetchCompany = async () => {
      if (!isEdit) return;
      try {
        const data = await getCompany(id!);
        setFormData({
          name: data.name,
          website: data.website || '',
          phone: data.phone || '',
          description: data.description || '',
          linkedin_url: data.linkedin_url || '',
          industry: data.industry || '',
          sub_industry: data.sub_industry || '',
          address_street: data.address_street || '',
          address_city: data.address_city || '',
          address_state: data.address_state || '',
          address_country: data.address_country || '',
          address_zip: data.address_zip || '',
          founded_year: data.founded_year,
          revenue_range: data.revenue_range || '',
          employee_size_range: data.employee_size_range || '',
          segment_id: data.segment_id
        });
      } catch (error) {
        console.error('Failed to fetch company', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSegments();
    fetchCompany();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'founded_year' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateCompany(id!, formData as any);
      } else {
        await createCompany(formData as CompanyCreate);
      }
      navigate('/companies');
    } catch (error) {
      console.error('Failed to save company', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/companies" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors group">
          <span className="material-symbols-outlined text-base mr-1 group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Companies
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-white">
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Company' : 'Add New Company'}</h1>
          <p className="mt-2 text-sm text-slate-500">Manually enter details to track a new organization in your CRM.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                Core Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">Basic identification information.</p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-slate-700">Company Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-slate-700">Website URL</label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">https://</span>
                  <input
                    name="website"
                    type="text"
                    value={formData.website?.replace(/^https?:\/\//, '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.example.com"
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700">Industry</label>
                <input
                  name="industry"
                  type="text"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software"
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700">Sub-Industry</label>
                <input
                  name="sub_industry"
                  type="text"
                  value={formData.sub_industry}
                  onChange={handleChange}
                  placeholder="e.g. SaaS"
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-slate-700">Segment <span className="text-red-500">*</span></label>
                <select
                  name="segment_id"
                  required
                  value={formData.segment_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                >
                  <option value="">Select a segment...</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
