import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Map, Navigation as NavIcon, LogOut, User } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '지도', icon: Map },
    { path: '/route-search', label: '경로 탐색', icon: NavIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 상단 네비게이션 바 */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 & 메뉴 */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                경기 그늘 로드
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

            {/* 사용자 정보 & 로그아웃 */}
            <div className="flex items-center gap-4">
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
