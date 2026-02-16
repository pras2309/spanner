import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listSegments } from '../../api/segments';
import { Segment } from '../../types/models';
import SegmentDetailPanel from '../../components/SegmentDetailPanel';
import { useAuth } from '../../contexts/AuthContext';

const SegmentList: React.FC = () => {
  const { user } = useAuth();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const data = await listSegments(showArchived ? 'archived' : 'active', search);
      setSegments(data);
    } catch (error) {
      console.error('Failed to fetch segments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, [showArchived, search]);

  const canCreate = user?.roles.some(r => ['admin', 'segment_owner'].includes(r.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none flex items-center justify-between mb-8 -mt-8 -mx-8 bg-white border-b border-slate-200 px-8 py-4">
        <h1 className="text-xl font-semibold text-slate-900">Segments Overview</h1>
        <div className="flex items-center gap-3">
          {canCreate && (
            <Link to="/segments/new" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Segment
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">search</span>
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
              placeholder="Search segments..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer" htmlFor="show-archived">
              <input
                className="sr-only peer"
                id="show-archived"
                type="checkbox"
                checked={showArchived}
                onChange={() => setShowArchived(!showArchived)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
              <span className="ml-2 text-sm font-medium text-slate-700">Show Archived</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">{segments.length}</span> results</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Segment Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Offerings</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Created At</th>
                <th className="relative px-6 py-3" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
                </tr>
              ) : segments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No segments found</td>
                </tr>
              ) : segments.map((segment) => (
                <tr
                  key={segment.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedSegmentId(segment.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{segment.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs" title={segment.description}>{segment.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {segment.offerings.slice(0, 3).map((offering) => (
                        <span key={offering.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {offering.name}
                        </span>
                      ))}
                      {segment.offerings.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                          +{segment.offerings.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      segment.status === 'active'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-slate-50 text-slate-700 border border-slate-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${segment.status === 'active' ? 'bg-green-700' : 'bg-slate-700'}`}></span>
                      {segment.status.charAt(0).toUpperCase() + segment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(segment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <SegmentDetailPanel
        segmentId={selectedSegmentId}
        onClose={() => setSelectedSegmentId(null)}
        onUpdate={fetchSegments}
      />
    </div>
  );
};

export default SegmentList;
