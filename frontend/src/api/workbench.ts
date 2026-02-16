import client from './client';
import { Segment, UploadBatch } from '../types/models';

export const getMySegments = async () => {
  const response = await client.get<Segment[]>('/api/workbench/segments');
  return response.data;
};

export const getMyUploads = async () => {
  const response = await client.get<UploadBatch[]>('/api/workbench/my-uploads');
  return response.data;
};
