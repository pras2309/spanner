import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSegment } from '../../api/segments';
import { listCompanies } from '../../api/companies';
import { Segment, Company } from '../../types/models';

const SegmentDrilldown: React.FC = () => {
  const { id } = useParams();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [segData, compData] = await Promise.all([
          getSegment(id!),
          listCompanies({ segment_id: id, status: 'approved' })
        ]);
        setSegment(segData);
        setCompanies(compData);
      } catch (error) {
        console.error('Failed to fetch segment drilldown', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading segment details...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-6">
        <Link to="/workbench" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 group transition-colors">
          <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Workbench
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{segment?.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{segment?.description}</p>
      </header>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Approved Companies</h2>
          <Link to="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Upload More</Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created At</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{c.industry}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/contacts/new?company_id=${c.id}`} className="text-blue-600 hover:text-blue-900">Add Contact</Link>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No approved companies in this segment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SegmentDrilldown;
