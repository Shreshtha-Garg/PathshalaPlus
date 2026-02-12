import axios from 'axios';

const API_URL = 'http://192.168.137.1:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;