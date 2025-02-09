// User types
export interface User {
  id: string;
  username: string;
  email: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

// Parcel types
export interface ParcelProperties {
  ParselNo: string;
  Alan: string;
  Mevkii: string;
  Nitelik: string;
  Ada: string;
  Il: string;
  Ilce: string;
  Pafta: string;
  Mahalle: string;
}

export interface ParcelGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Parcel {
  _id: string;
  userId: string;
  type: 'Feature';
  geometry: ParcelGeometry;
  properties: ParcelProperties;
  notes: Array<{
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
