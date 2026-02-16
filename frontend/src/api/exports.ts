import client from './client';

export const exportCompaniesCSV = async () => {
  const response = await client.get('/api/exports/companies', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'companies_export.csv');
  document.body.appendChild(link);
  link.click();
};

export const exportContactsCSV = async () => {
  const response = await client.get('/api/exports/contacts', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'contacts_export.csv');
  document.body.appendChild(link);
  link.click();
};
