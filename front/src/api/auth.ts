import api from './axios';

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export const authAPI = {
  signup: async (data: SignupRequest) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/signup', data);
    return response.data.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  health: async () => {
    const response = await api.get('/auth/health');
    return response.data;
  },
};
