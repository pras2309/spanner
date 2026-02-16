import React, { useState, useEffect } from 'react';
import { listCollaterals, deleteCollateral } from '../../api/collaterals';
import { Collateral } from '../../types/models';

const CollateralList: React.FC = () => {
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollaterals = async () => {
    setLoading(true);
    try {
      const data = await listCollaterals();
      setCollaterals(data);
    } catch (error) {
      console.error('Failed to fetch collaterals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaterals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteCollateral(id);
      fetchCollaterals();
    } catch (error) {
      console.error('Failed to delete collateral', error);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center -mt-8 -mx-8 bg-white border-b border-slate-200 px-8 py-4 mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Marketing Collateral</h1>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          Add Collateral
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Scope</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created At</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : collaterals.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No collateral found</td></tr>
            ) : collaterals.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{c.title}</span>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{c.url}</a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {c.scope_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollateralList;
