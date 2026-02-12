import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. READ FROM ENVIRONMENT VARIABLE
// If the variable is missing, it falls back to a localhost string (safety)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'; 
console.log('API Base URL:', process.env.EXPO_PUBLIC_API_URL ? 'Using environment variable' : 'Using fallback URL');
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// 2. REQUEST INTERCEPTOR (Attaches Token)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR (Handles Session Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.clear();
    }
    return Promise.reject(error);
  }
);

export default api;