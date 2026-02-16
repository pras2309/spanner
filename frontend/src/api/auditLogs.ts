import client from './client';
import { AuditLog } from '../types/models';

export const getAuditLogs = async (limit: number = 50) => {
  const response = await client.get<AuditLog[]>('/api/audit-logs', { params: { limit } });
  return response.data;
};

export const getEntityTimeline = async (type: string, id: string) => {
  const response = await client.get<AuditLog[]>(`/api/audit-logs/entity/${type}/${id}`);
  return response.data;
};
