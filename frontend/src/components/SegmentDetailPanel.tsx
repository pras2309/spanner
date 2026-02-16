import React, { useState, useEffect } from 'react';
import { getSegment, archiveSegment, activateSegment } from '../api/segments';
import { listAssignments, deleteAssignment } from '../api/assignments';
import { Segment, Assignment } from '../types/models';
import AssignmentModal from './AssignmentModal';

interface Props {
  segmentId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const SegmentDetailPanel: React.FC<Props> = ({ segmentId, onClose, onUpdate }) => {
  const [segment, setSegment] = useState<Segment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<'researcher' | 'sdr'>('researcher');

  useEffect(() => {
    if (segmentId) {
      fetchData();
    }
  }, [segmentId]);

  const fetchData = async () => {
    if (!segmentId) return;
    setLoading(true);
    try {
      const [segData, assignData] = await Promise.all([
        getSegment(segmentId),
        listAssignments({ entity_type: 'segment', entity_id: segmentId })
      ]);
      setSegment(segData);
      setAssignments(assignData);
    } catch (error) {
      console.error('Failed to fetch segment details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!segment) return;
    try {
      if (segment.status === 'active') {
        await archiveSegment(segment.id);
      } else {
        await activateSegment(segment.id);
      }
      fetchData();
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    try {
      await deleteAssignment(id);
      fetchData();
    } catch (error) {
      console.error('Failed to remove assignment', error);
    }
  };

  if (!segmentId) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-40 transition-opacity ${segmentId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div className={`fixed inset-y-0 right-0 w-full md:w-[42%] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-slate-200 ${segmentId ? 'translate-x-0' : 'translate-x-full'}`}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
          </div>
        ) : segment ? (
          <>
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Segment</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${
                      segment.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${segment.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                      {segment.status.charAt(0).toUpperCase() + segment.status.slice(1)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{segment.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleStatus}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">{segment.status === 'active' ? 'archive' : 'unarchive'}</span>
                  {segment.status === 'active' ? 'Archive' : 'Activate'}
                </button>
                <button
                  onClick={() => { setAssignRole('researcher'); setIsAssignModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Assign
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              <div className="px-6 py-6 space-y-8">
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                      <p className="text-sm text-slate-700 leading-relaxed">{segment.description || 'No description provided.'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Offerings</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {segment.offerings.map(o => (
                          <span key={o.id} className="text-sm text-blue-700 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                            {o.name}
                          </span>
                        ))}
                        {segment.offerings.length === 0 && <span className="text-sm text-slate-400 italic">No offerings linked.</span>}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Assigned Researchers</h3>
                  </div>
                  <div className="space-y-3">
                    {assignments.filter(a => a.assigned_to.roles.includes('researcher')).map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 group">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {a.assigned_to.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{a.assigned_to.name}</p>
                          <p className="text-xs text-slate-500 truncate">{a.assigned_to.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveAssignment(a.id)}
                          className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    ))}
                    {assignments.filter(a => a.assigned_to.roles.includes('researcher')).length === 0 && (
                      <p className="text-sm text-slate-400 italic text-center py-2">No researchers assigned.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <AssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => { setIsAssignModalOpen(false); fetchData(); }}
        entityType="segment"
        entityId={segmentId || ''}
        roleFilter={assignRole}
      />
    </>
  );
};

export default SegmentDetailPanel;
