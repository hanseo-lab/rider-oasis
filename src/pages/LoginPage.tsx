import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Bike, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      login(response.token, {
        userId: response.userId,
        username: response.username,
        email: response.email,
        role: response.role,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-4">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">경기 그늘 로드</h1>
          <p className="text-gray-400 text-sm">이동노동자를 위한 폭염 회피 지도</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              사용자명
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="사용자명 입력"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="비밀번호 입력"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="text-center text-gray-400 text-sm">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-green-400 hover:text-green-300 font-semibold">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
