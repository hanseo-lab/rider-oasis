import axios from 'axios';

// ✅ 환경 변수(VITE_API_BASE_URL)가 있으면 그걸 쓰고, 없으면 로컬(localhost)을 씁니다.
// 이렇게 하면 내 컴퓨터에서도 되고, 배포 사이트에서도 됩니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러(인증 실패)가 떴을 때, 로그인 페이지가 아닐 때만 리다이렉트 (무한 루프 방지)
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;