import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'https://predart003-001-site1.anytempurl.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check if the token exists in localStorage and set it in the request headers
const token = localStorage.getItem('authToken');
if (token) {
  console.log('Token found in localStorage:', token);
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
} else {
  console.log('No token found in localStorage');
}

export default api;
