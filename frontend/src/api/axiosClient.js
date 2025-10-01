// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Cambia si tu backend está en otro puerto
});

export default axiosClient;