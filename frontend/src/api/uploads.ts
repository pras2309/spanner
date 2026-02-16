import client from './client';
import { UploadBatch, UploadError } from '../types/models';

export const uploadCompanyCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post<UploadBatch>('/api/uploads/companies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const uploadContactCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post<UploadBatch>('/api/uploads/contacts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const listBatches = async () => {
  const response = await client.get<UploadBatch[]>('/api/uploads/batches');
  return response.data;
};

export const getBatch = async (id: string) => {
  const response = await client.get<UploadBatch>(`/api/uploads/batches/${id}`);
  return response.data;
};

export const getBatchErrors = async (id: string) => {
  const response = await client.get<UploadError[]>(`/api/uploads/batches/${id}/errors`);
  return response.data;
};
