/// <reference types="vite/client" />
import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';

// ✅ 환경 변수(VITE_API_BASE_URL)가 있으면 그걸 쓰고, 없으면 로컬(localhost)을 씁니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다. 기본 값(localhost)을 사용합니다.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT 토큰 자동 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // 401 에러(인증 실패) 처리
    if (error.response?.status === 401) {
      // 공개 페이지 목록 (로그인 없이 접근 가능)
      // 정확한 매칭 및 하위 경로 처리를 위해 로직 개선
      const publicPaths = ['/', '/route-search', '/community', '/login', '/signup'];
      const currentPath = window.location.pathname;

      const isPublicPath = publicPaths.some(path =>
        currentPath === path || (path !== '/' && currentPath.startsWith(path + '/'))
      );

      // Store 상태 초기화 (로그아웃 처리) - UI 동기화를 위해 필수
      useAuthStore.getState().logout();

      // 공개 페이지가 아니고, 로그인/회원가입 페이지가 아닐 때만 리다이렉트
      if (!isPublicPath) {
        window.location.href = '/login';
      }
      // 공개 페이지에서는 토큰만 제거하고(위의 logout()에서 처리됨) 리다이렉트 하지 않음
    }
    return Promise.reject(error);
  }
);

export default api;