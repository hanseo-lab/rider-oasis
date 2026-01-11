import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../api/user';
import { Map, Navigation as NavIcon, LogOut, User, Sun, Snowflake, ShieldCheck, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SeasonMode } from '../types/user';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('AUTO');

  useEffect(() => {
    // 로그인한 사용자만 계절 모드 로드
    if (isAuthenticated) {
      loadSeasonMode();
    } else {
      // 로그인하지 않은 경우 현재 월 기준으로 자동 판단
      const month = new Date().getMonth() + 1;
      setSeasonMode((month >= 11 || month <= 3) ? 'WINTER' : 'SUMMER');
    }
  }, [isAuthenticated]);

  const loadSeasonMode = async () => {
    if (!isAuthenticated) return;

    try {
      const userInfo = await userAPI.getMyInfo();
      setSeasonMode(userInfo.seasonMode);
    } catch (error) {
      console.error('계절 모드 로딩 실패:', error);
      // 에러 발생 시 현재 월 기준으로 자동 판단
      const month = new Date().getMonth() + 1;
      setSeasonMode((month >= 11 || month <= 3) ? 'WINTER' : 'SUMMER');
    }
  };

  const handleSeasonToggle = async () => {
    if (!isAuthenticated) {
      // 로그인하지 않은 경우 로그인 페이지로 이동
      navigate('/login');
      return;
    }

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
    { path: '/community', label: '커뮤니티', icon: MessageSquare },
    ...(isAuthenticated ? [{ path: '/my-page', label: '마이페이지', icon: User }] : []),
  ];

  // 계절 모드별 버튼 클래스 생성
  const getSeasonToggleClass = () => {
    const baseClass = "flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border-2 cursor-pointer active:scale-95 hover:scale-105 transform";

    if (seasonMode === 'SUMMER') {
      return `${baseClass} bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-500 text-orange-400 hover:from-orange-500/40 hover:to-red-500/40 hover:shadow-lg hover:shadow-orange-500/20`;
    } else if (seasonMode === 'WINTER') {
      return `${baseClass} bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-500 text-blue-400 hover:from-blue-500/40 hover:to-cyan-500/40 hover:shadow-lg hover:shadow-blue-500/20`;
    } else {
      return `${baseClass} bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-16 md:pb-0">
      {/* 상단 네비게이션 바 */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
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

              {/* 데스크탑 메뉴 (MD 이상에서만 보임) */}
              <div className="hidden md:flex gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 사용자 정보 & 계절 모드 & 로그아웃 */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* 계절 모드 토글 (모바일에서는 아이콘만, 데스크탑에선 텍스트 포함) */}
              <button
                onClick={handleSeasonToggle}
                className={getSeasonToggleClass()}
                aria-label="계절 모드 변경"
              >
                {seasonMode === 'SUMMER' && <Sun className="w-4 h-4" />}
                {seasonMode === 'WINTER' && <Snowflake className="w-4 h-4" />}
                {seasonMode === 'AUTO' && <Sun className="w-4 h-4 opacity-50" />}
                <span className="hidden md:inline text-sm font-medium">
                  {seasonMode === 'AUTO' && '자동'}
                  {seasonMode === 'SUMMER' && '여름'}
                  {seasonMode === 'WINTER' && '겨울'}
                </span>
              </button>

              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.username}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    aria-label="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">로그아웃</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 페이지 컨텐츠 */}
      <main>
        <Outlet />
      </main>

      {/* 모바일 하단 네비게이션 (MD 미만에서만 보임) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
