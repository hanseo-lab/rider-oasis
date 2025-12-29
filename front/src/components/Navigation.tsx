import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../api/user';
import { Map, Navigation as NavIcon, LogOut, User, Sun, Snowflake, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SeasonMode } from '../types/user';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('AUTO');

  useEffect(() => {
    loadSeasonMode();
  }, []);

  const loadSeasonMode = async () => {
    try {
      const userInfo = await userAPI.getMyInfo();
      setSeasonMode(userInfo.seasonMode);
    } catch (error) {
      console.error('계절 모드 로딩 실패:', error);
    }
  };

  const handleSeasonToggle = async () => {
    const modes: SeasonMode[] = ['AUTO', 'SUMMER', 'WINTER'];
    const currentIndex = modes.indexOf(seasonMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    try {
      await userAPI.updateSettings({ seasonMode: nextMode });
      setSeasonMode(nextMode);
    } catch (error) {
      console.error('계절 모드 변경 실패:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '지도', icon: Map },
    { path: '/route-search', label: '경로 탐색', icon: NavIcon },
    { path: '/my-page', label: '마이페이지', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 상단 네비게이션 바 */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 & 메뉴 */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                  경기 안심 로드
                </span>
              </Link>

              <div className="flex gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                        ${isActive
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 사용자 정보 & 계절 모드 & 로그아웃 */}
            <div className="flex items-center gap-4">
              {/* 계절 모드 토글 */}
              <button
                onClick={handleSeasonToggle}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all border-2
                  ${seasonMode === 'SUMMER' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                    seasonMode === 'WINTER' ? 'bg-blue-500/20 border-blue-500 text-blue-400' :
                    'bg-gray-700 border-gray-600 text-gray-300'}
                `}
              >
                {seasonMode === 'SUMMER' && <Sun className="w-4 h-4" />}
                {seasonMode === 'WINTER' && <Snowflake className="w-4 h-4" />}
                {seasonMode === 'AUTO' && <Sun className="w-4 h-4 opacity-50" />}
                <span className="text-sm font-medium">
                  {seasonMode === 'AUTO' && '자동'}
                  {seasonMode === 'SUMMER' && '여름'}
                  {seasonMode === 'WINTER' && '겨울'}
                </span>
              </button>

              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 페이지 컨텐츠 */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
