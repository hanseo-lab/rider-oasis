import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Lock, User, Sun, Snowflake, MapPin, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* 홈으로 가기 버튼 */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">홈으로</span>
      </Link>

      {/* 사계절 공존 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-green-500 to-blue-500 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400 via-blue-600 to-purple-700 opacity-20"></div>
      <div className="absolute inset-0 bg-gray-900 opacity-70"></div>

      {/* 장식 요소 - 빛 번짐 효과 */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>

      {/* 로그인 카드 */}
      <div className="relative max-w-md w-full bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/50">
        {/* 브랜드 아이덴티티 */}
        <div className="text-center mb-8">
          {/* 사계절 로고 */}
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              {/* 여름 아이콘 */}
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Sun className="w-7 h-7 text-white" />
              </div>
              {/* 겨울 아이콘 (오른쪽 겹침) */}
              <div className="absolute -right-8 top-0 w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800">
                <Snowflake className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* 서비스명 */}
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
              경기 안심 로드
            </span>
          </h1>

          {/* 영문명 */}
          <p className="text-gray-400 text-sm font-semibold mb-2">Gyeonggi Safety Road</p>

          {/* 슬로건 */}
          <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
            <Sun className="w-4 h-4 text-orange-400" />
            <span>폭염엔 시원한 길</span>
            <span className="text-gray-600">•</span>
            <Snowflake className="w-4 h-4 text-blue-400" />
            <span>한파엔 안전한 길</span>
          </div>

          {/* 부제 */}
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-full">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-xs">사계절 안전 경로 안내 서비스</span>
          </div>
        </div>

        {/* 로그인 폼 */}
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
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:via-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="text-center text-gray-400 text-sm">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
              회원가입
            </Link>
          </div>
        </form>

        {/* 계절 표시 인디케이터 */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>여름 모드</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
              <span>겨울 모드</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-xs">
        <p>© 2025 Gyeonggi Safety Road. 경기도 기후 데이터 기반 안전 경로 서비스</p>
      </div>
    </div>
  );
}
