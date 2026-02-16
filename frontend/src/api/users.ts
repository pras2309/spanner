import client from './client';
import { User, UserCreate, UserUpdate } from '../types/models';

export const listUsers = async (search?: string) => {
  const response = await client.get<User[]>('/api/users', { params: { search } });
  return response.data;
};

export const createUser = async (data: UserCreate) => {
  const response = await client.post<User>('/api/users', data);
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await client.get<User>(`/api/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: UserUpdate) => {
  const response = await client.patch<User>(`/api/users/${id}`, data);
  return response.data;
};
