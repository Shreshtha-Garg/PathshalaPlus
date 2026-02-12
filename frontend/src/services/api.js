import axios from 'axios';

const API_URL = 'http://169.254.177.109:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;