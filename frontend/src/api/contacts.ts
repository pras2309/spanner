import client from './client';
import { Contact, ContactCreate, ContactUpdate } from '../types/models';

export const listContacts = async (params?: any) => {
  const response = await client.get<Contact[]>('/api/contacts', { params });
  return response.data;
};

export const createContact = async (data: ContactCreate) => {
  const response = await client.post<Contact>('/api/contacts', data);
  return response.data;
};

export const getContact = async (id: string) => {
  const response = await client.get<Contact>(`/api/contacts/${id}`);
  return response.data;
};

export const updateContact = async (id: string, data: ContactUpdate) => {
  const response = await client.patch<Contact>(`/api/contacts/${id}`, data);
  return response.data;
};

export const bulkApproveContacts = async (contact_ids: string[]) => {
  const response = await client.post('/api/contacts/approve', { contact_ids });
  return response.data;
};

export const assignSDR = async (id: string, sdr_id: string) => {
  const response = await client.post<Contact>(`/api/contacts/${id}/assign`, { sdr_id });
  return response.data;
};

export const scheduleMeeting = async (id: string) => {
  const response = await client.post<Contact>(`/api/contacts/${id}/schedule-meeting`);
  return response.data;
};

export const getApprovalQueueContacts = async (params?: any) => {
  const response = await client.get<Contact[]>('/api/approval-queue/contacts', { params });
  return response.data;
};
