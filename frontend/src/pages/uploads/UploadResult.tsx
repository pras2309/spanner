import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBatch } from '../../api/uploads';
import { UploadBatch } from '../../types/models';

const UploadResult: React.FC = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState<UploadBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const data = await getBatch(id!);
        setBatch(data);
      } catch (error) {
        console.error('Failed to fetch batch summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading result...</div>;
  if (!batch) return <div className="p-8 text-center">Batch not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Result</h1>
        <p className="text-sm text-slate-500 mt-1">Summary of your recent import.</p>
      </header>

      <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${batch.invalid_rows === 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <span className="material-symbols-outlined text-4xl">
                {batch.invalid_rows === 0 ? 'check_circle' : 'warning'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {batch.invalid_rows === 0 ? 'Upload Successful' : 'Upload Completed with Errors'}
              </h2>
              <p className="text-sm text-slate-500">{batch.file_name} • {new Date(batch.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rows</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{batch.total_rows}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Valid Rows</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{batch.valid_rows}</p>
              <p className="text-xs text-green-600 mt-1">Successfully imported</p>
            </div>
            <div className={`${batch.invalid_rows > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} p-4 rounded-lg border`}>
              <p className={`text-xs font-semibold ${batch.invalid_rows > 0 ? 'text-red-600' : 'text-slate-500'} uppercase tracking-wider`}>Invalid Rows</p>
              <p className={`text-2xl font-bold ${batch.invalid_rows > 0 ? 'text-red-700' : 'text-slate-900'} mt-1`}>{batch.invalid_rows}</p>
              {batch.invalid_rows > 0 && <p className="text-xs text-red-600 mt-1">Requires correction</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex gap-4">
              <Link
                to="/upload"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                Upload Another File
              </Link>
              {batch.invalid_rows > 0 && (
                <Link
                  to={`/uploads/batches/${batch.id}/errors`}
                  className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">error</span>
                  View Errors
                </Link>
              )}
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResult;
