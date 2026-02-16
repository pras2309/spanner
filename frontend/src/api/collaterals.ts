import client from './client';
import { Collateral, CollateralCreate } from '../types/models';

export const listCollaterals = async (scope_type?: string, scope_id?: string) => {
  const response = await client.get<Collateral[]>('/api/collaterals', { params: { scope_type, scope_id } });
  return response.data;
};

export const createCollateral = async (data: CollateralCreate) => {
  const response = await client.post<Collateral>('/api/collaterals', data);
  return response.data;
};

export const deleteCollateral = async (id: string) => {
  const response = await client.delete(`/api/collaterals/${id}`);
  return response.data;
};
