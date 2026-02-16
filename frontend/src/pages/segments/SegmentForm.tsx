import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createSegment, getSegment, updateSegment } from '../../api/segments';
import { SegmentCreate } from '../../types/models';

const SegmentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [offeringInput, setOfferingInput] = useState('');
  const [newOfferings, setNewOfferings] = useState<{name: string, description?: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchSegment = async () => {
        try {
          const data = await getSegment(id!);
          setName(data.name);
          setDescription(data.description || '');
          setNewOfferings(data.offerings.map(o => ({ name: o.name, description: o.description })));
        } catch (error) {
          console.error('Failed to fetch segment', error);
        }
      };
      fetchSegment();
    }
  }, [id, isEdit]);

  const handleAddOffering = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && offeringInput.trim()) {
      e.preventDefault();
      if (!newOfferings.find(o => o.name === offeringInput.trim())) {
        setNewOfferings([...newOfferings, { name: offeringInput.trim() }]);
      }
      setOfferingInput('');
    }
  };

  const removeOffering = (offeringName: string) => {
    setNewOfferings(newOfferings.filter(o => o.name !== offeringName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: SegmentCreate = {
        name,
        description,
        new_offerings: newOfferings
      };

      if (isEdit) {
        await updateSegment(id!, payload);
      } else {
        await createSegment(payload);
      }
      navigate('/segments');
    } catch (error) {
      console.error('Failed to save segment', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/segments" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors group">
          <span className="material-symbols-outlined text-base mr-1 group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Segments
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-white">
          <h1 className="text-2xl font-semibold text-slate-900">{isEdit ? 'Edit Segment' : 'Create New Segment'}</h1>
          <p className="mt-1 text-sm text-slate-500">Define a new audience segment for your ABM campaigns.</p>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          <div className="px-8 py-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="segment-name">
                  Segment Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 transition-colors"
                  id="segment-name"
                  placeholder="e.g., Q3 Enterprise Tech Targets"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border-slate-300 bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 transition-colors resize-y"
                  id="description"
                  placeholder="Briefly describe the target criteria, goals, or persona for this segment..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <p className="mt-1.5 text-xs text-slate-500">Internal notes to help your team understand this segment's purpose.</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-6 bg-slate-50/50">
            <div>
              <h3 className="text-base font-medium text-slate-900">Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Associate products and set visibility.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Associated Offerings
              </label>
              <div className="w-full min-h-[46px] rounded-lg border border-slate-300 bg-white shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-1.5 flex flex-wrap gap-2 items-center">
                {newOfferings.map((offering) => (
                  <span key={offering.name} className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium">
                    {offering.name}
                    <button
                      type="button"
                      className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                      onClick={() => removeOffering(offering.name)}
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] border-none bg-transparent p-1 text-sm focus:ring-0 text-slate-900 placeholder:text-slate-400"
                  placeholder="Type and press Enter to add offerings..."
                  type="text"
                  value={offeringInput}
                  onChange={(e) => setOfferingInput(e.target.value)}
                  onKeyDown={handleAddOffering}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Press Enter to add new offerings or search for existing ones.</p>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 flex items-center justify-end gap-3 rounded-b-xl">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
              onClick={() => navigate('/segments')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-lg shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg mr-2">save</span>
              {loading ? 'Saving...' : 'Save Segment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SegmentForm;
