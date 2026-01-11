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
    const response = await api.post<any>('/auth/signup', data);
    console.log('Signup response:', response.data);
    // 백엔드가 { success: true, message: "...", data: AuthResponse } 형태로 응답
    return response.data.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<any>('/auth/login', data);
    console.log('Login response:', response.data);
    // 백엔드가 { success: true, message: "로그인 성공", data: AuthResponse } 형태로 응답
    return response.data.data;
  },

  health: async () => {
    const response = await api.get('/auth/health');
    return response.data;
  },
};
