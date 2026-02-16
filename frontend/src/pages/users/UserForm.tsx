import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createUser, getUser, updateUser } from '../../api/users';
import { UserCreate } from '../../types/models';

const UserForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_ids: [] as number[],
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const data = await getUser(id!);
          setFormData({
            name: data.name,
            email: data.email,
            password: '',
            role_ids: [], // Backend would need to provide IDs
            is_active: data.is_active
          });
        } catch (error) {
          console.error('Failed to fetch user', error);
        }
      };
      fetchUser();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(id!, { name: formData.name, is_active: formData.is_active });
      } else {
        await createUser(formData as any);
      }
      navigate('/users');
    } catch (error) {
      console.error('Failed to save user', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link to="/users" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to User Management
        </Link>
      </div>

      <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit User' : 'Create New User'}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                required
                className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                required
                type="email"
                disabled={isEdit}
                className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 disabled:bg-slate-50"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  required
                  type="password"
                  className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
               <input
                 type="checkbox"
                 id="is_active"
                 checked={formData.is_active}
                 onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                 className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
               />
               <label htmlFor="is_active" className="text-sm text-slate-700">User is active</label>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
