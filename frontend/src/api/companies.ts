import client from './client';
import { Company, CompanyCreate, CompanyUpdate } from '../types/models';

export const listCompanies = async (params?: any) => {
  const response = await client.get<Company[]>('/api/companies', { params });
  return response.data;
};

export const createCompany = async (data: CompanyCreate) => {
  const response = await client.post<Company>('/api/companies', data);
  return response.data;
};

export const getCompany = async (id: string) => {
  const response = await client.get<Company>(`/api/companies/${id}`);
  return response.data;
};

export const updateCompany = async (id: string, data: CompanyUpdate) => {
  const response = await client.patch<Company>(`/api/companies/${id}`, data);
  return response.data;
};

export const approveCompany = async (id: string) => {
  const response = await client.post<Company>(`/api/companies/${id}/approve`);
  return response.data;
};

export const rejectCompany = async (id: string, rejection_reason: string) => {
  const response = await client.post<Company>(`/api/companies/${id}/reject`, { rejection_reason });
  return response.data;
};

export const getApprovalQueueCompanies = async (params?: any) => {
  const response = await client.get<Company[]>('/api/approval-queue/companies', { params });
  return response.data;
};
