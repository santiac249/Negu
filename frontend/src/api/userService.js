import axiosClient from './axiosClient';

export const getRoles = async () => {
  const response = await axiosClient.get('/roles');
  return response.data;
};