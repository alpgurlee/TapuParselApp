import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, Parcel, ApiResponse } from '../types';

const API_URL = 'http://localhost:5000/api';

// Axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', credentials);
      localStorage.setItem('token', data.token);
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Parcel services
export const parcelService = {
  getParcels: async (): Promise<ApiResponse<Parcel[]>> => {
    try {
      const { data } = await api.get<Parcel[]>('/parcels');
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch parcels' 
      };
    }
  },

  getParcel: async (id: string): Promise<ApiResponse<Parcel>> => {
    try {
      const { data } = await api.get<Parcel>(`/parcels/${id}`);
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch parcel' 
      };
    }
  },

  addParcel: async (parcelData: Omit<Parcel, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Parcel>> => {
    try {
      const { data } = await api.post<Parcel>('/parcels', parcelData);
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add parcel' 
      };
    }
  },

  addNote: async (parcelId: string, note: string): Promise<ApiResponse<Parcel>> => {
    try {
      const { data } = await api.post<Parcel>(`/parcels/${parcelId}/notes`, { content: note });
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add note' 
      };
    }
  }
};
