import axios from 'axios';
import { API_URL } from './config.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  auth: {
    username: '11187259',
    password: '60-dayfreetrial'
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;