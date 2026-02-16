import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBatchErrors, getBatch } from '../../api/uploads';
import { UploadError, UploadBatch } from '../../types/models';

const ErrorCorrection: React.FC = () => {
  const { id } = useParams();
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [batch, setBatch] = useState<UploadBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchData, errorData] = await Promise.all([
          getBatch(id!),
          getBatchErrors(id!)
        ]);
        setBatch(batchData);
        setErrors(errorData);
      } catch (error) {
        console.error('Failed to fetch errors', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading error report...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/uploads/batches/${id}`} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 transition-colors group">
            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Summary
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Error Report</h1>
          <p className="text-sm text-slate-500 mt-1">Found {errors.length} validation errors in {batch?.file_name}.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">download</span>
            Download Report
          </button>
          <Link to="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">upload_file</span>
            Re-upload Corrected CSV
          </Link>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Row #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Column</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Error Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {errors.map((error) => (
              <tr key={error.id} className="hover:bg-red-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                  {error.row_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {error.column_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 italic">
                  "{error.value || 'EMPTY'}"
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-base">error_outline</span>
                    {error.error_message}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorCorrection;
