import axios from 'axios';


const api = axios.create({
  baseURL: 'https://apidev.precare.in/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});


const token = localStorage.getItem('authToken');
if (token) {
  console.log('Token found in localStorage:', token);
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
} else {
  console.log('No token found in localStorage');
}

export default api;
