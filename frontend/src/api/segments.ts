import client from './client';
import { Segment, SegmentCreate, SegmentUpdate } from '../types/models';

export const listSegments = async (status: string = 'active', search?: string) => {
  const params: any = { status };
  if (search) params.search = search;
  const response = await client.get<Segment[]>('/api/segments', { params });
  return response.data;
};

export const getSegment = async (id: string) => {
  const response = await client.get<Segment>(`/api/segments/${id}`);
  return response.data;
};

export const createSegment = async (data: SegmentCreate) => {
  const response = await client.post<Segment>('/api/segments', data);
  return response.data;
};

export const updateSegment = async (id: string, data: SegmentUpdate) => {
  const response = await client.patch<Segment>(`/api/segments/${id}`, data);
  return response.data;
};

export const archiveSegment = async (id: string) => {
  const response = await client.post<Segment>(`/api/segments/${id}/archive`);
  return response.data;
};

export const activateSegment = async (id: string) => {
  const response = await client.post<Segment>(`/api/segments/${id}/activate`);
  return response.data;
};
