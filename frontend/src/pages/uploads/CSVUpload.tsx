import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadCompanyCSV, uploadContactCSV } from '../../api/uploads';

const CSVUpload: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'company' | 'contact'>('company');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(45);
    try {
      const batch = activeTab === 'company'
        ? await uploadCompanyCSV(file)
        : await uploadContactCSV(file);
      navigate(`/uploads/batches/${batch.id}`);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">CSV Import</h1>
        <p className="text-sm text-slate-500 mt-1">Bulk import data into Spanner CRM.</p>
      </header>

      <div className="border-b border-slate-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('company')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'company' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[1.2em]">domain</span>
            Company CSV
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'contact' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[1.2em]">person</span>
            Contact CSV
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Upload {activeTab === 'company' ? 'Companies' : 'Contacts'}</h2>
              <p className="mt-1 text-sm text-slate-500">Import bulk data using our CSV template.</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-base">download</span>
              Download Template
            </button>
          </div>

          <div
            className="mt-2 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-all cursor-pointer group"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="space-y-2 text-center">
              <div className="mx-auto h-12 w-12 text-slate-400 group-hover:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-5xl">upload_file</span>
              </div>
              <div className="flex text-sm text-slate-600 justify-center">
                <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                  {file ? file.name : 'Upload a file'}
                </span>
                {!file && <p className="pl-1">or drag and drop</p>}
              </div>
              <p className="text-xs text-slate-500">CSV up to 10MB</p>
            </div>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm font-medium text-slate-900 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-slate-50 rounded-md border border-slate-100 p-5">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-slate-500 text-base">info</span>
              File Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Required Columns</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  {activeTab === 'company' ? (
                    <>
                      <li>Company Name <span className="text-red-500">*</span></li>
                      <li>Segment Name <span className="text-red-500">*</span></li>
                    </>
                  ) : (
                    <>
                      <li>First Name <span className="text-red-500">*</span></li>
                      <li>Last Name <span className="text-red-500">*</span></li>
                      <li>Company Name <span className="text-red-500">*</span></li>
                      <li>Email <span className="text-red-500">*</span></li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Format Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  <li>File format must be .csv</li>
                  <li>Encoding should be UTF-8</li>
                  <li>No duplicate names within segment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            onClick={() => setFile(null)}
          >
            Cancel
          </button>
          <button
            disabled={!file || uploading}
            onClick={handleUpload}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            Process File
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;
