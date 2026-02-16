import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMySegments, getMyUploads } from '../../api/workbench';
import { Segment, UploadBatch } from '../../types/models';

const ResearcherWorkbench: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [uploads, setUploads] = useState<UploadBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [segData, uploadData] = await Promise.all([
          getMySegments(),
          getMyUploads()
        ]);
        setSegments(segData);
        setUploads(uploadData);
      } catch (error) {
        console.error('Failed to fetch workbench data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Researcher Workbench</h1>
        <p className="text-slate-500 mt-1">Manage your assigned segments and data imports.</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">folder_shared</span>
            My Assigned Segments
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((s) => (
            <Link
              key={s.id}
              to={`/workbench/segments/${s.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 transition-colors group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-slate-900 text-lg group-hover:text-blue-600">{s.name}</div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-400">arrow_forward</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {s.offerings.slice(0, 2).map(o => (
                  <span key={o.id} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">{o.name}</span>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between text-sm text-slate-500">
                <span>View Details</span>
                <span className="font-medium text-slate-700">Created {new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
          {segments.length === 0 && !loading && (
            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
              No segments assigned to you.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
            My Recent Uploads
          </h2>
          <Link to="/upload" className="text-blue-600 hover:underline text-sm font-medium">New Import</Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rows</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {uploads.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.file_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.total_rows}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ResearcherWorkbench;
