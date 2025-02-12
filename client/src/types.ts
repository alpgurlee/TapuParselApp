// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

// Auth response types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Parcel types
export interface Parcel {
  _id: string;
  userId: string;
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
  notes: Note[];
  coordinates: Coordinate[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  content: string;
  position: {
    lat: number;
    lng: number;
  };
  locationInfo: {
    il: string;
    ilce: string;
    mahalle: string;
    ada: string;
    parsel: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}
