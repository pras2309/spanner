import client from './client';
import { Assignment, AssignmentCreate } from '../types/models';

export const createAssignment = async (data: AssignmentCreate) => {
  const response = await client.post<Assignment>('/api/assignments', data);
  return response.data;
};

export const listAssignments = async (params?: { entity_type?: string, entity_id?: string, assigned_to?: string }) => {
  const response = await client.get<Assignment[]>('/api/assignments', { params });
  return response.data;
};

export const deleteAssignment = async (id: string) => {
  const response = await client.delete(`/api/assignments/${id}`);
  return response.data;
};
