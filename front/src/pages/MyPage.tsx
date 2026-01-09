import { useState, useEffect } from 'react';
import { userAPI } from '../api/user';
import type { UserInfo, UserStats } from '../types/user';
import type { RouteResponse } from '../types/route';
import {
  User, Settings, TrendingUp, MapPin, Trees,
  ThermometerSun, Award, Star, Heart, MessageSquare,
  Snowflake, Sun
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [favoriteRoutes, setFavoriteRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 설정 상태
  const [maxDetourPercent, setMaxDetourPercent] = useState(20);
  const [preferShade, setPreferShade] = useState(true);
  const [avoidHeat, setAvoidHeat] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [avoidBlackIce, setAvoidBlackIce] = useState(true);
  const [seasonMode, setSeasonMode] = useState<'AUTO' | 'SUMMER' | 'WINTER'>('AUTO');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [info, statsData, routes] = await Promise.all([
        userAPI.getMyInfo(),
        userAPI.getMyStats(),
        userAPI.getFavoriteRoutes(),
      ]);

      setUserInfo(info);
      setStats(statsData);
      setFavoriteRoutes(routes);

      // 설정 값 초기화
      setMaxDetourPercent(info.maxDetourPercent);
      setPreferShade(info.preferShade);
      setAvoidHeat(info.avoidHeat);
      setShowShelters(info.showShelters);
      setAvoidBlackIce(info.avoidBlackIce);
      setSeasonMode(info.seasonMode);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updatedInfo = await userAPI.updateSettings({
        maxDetourPercent,
        preferShade,
        avoidHeat,
        showShelters,
        avoidBlackIce,
        seasonMode,
      });
      setUserInfo(updatedInfo);
      alert('설정이 저장되었습니다!');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return 'text-orange-600';
      case 'Silver': return 'text-gray-400';
      case 'Gold': return 'text-yellow-400';
      case 'Platinum': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'Bronze': return 'bg-orange-500/20 border-orange-500';
      case 'Silver': return 'bg-gray-400/20 border-gray-400';
      case 'Gold': return 'bg-yellow-400/20 border-yellow-400';
      case 'Platinum': return 'bg-cyan-400/20 border-cyan-400';
      default: return 'bg-gray-400/20 border-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-10">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-b border-green-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{userInfo?.nickname || userInfo?.username}</h1>
              <p className="text-gray-400 text-sm">{userInfo?.email}</p>
            </div>
            {stats && (
              <div className={`ml-auto px-4 py-2 border-2 rounded-lg ${getLevelBg(stats.level)}`}>
                <div className="flex items-center gap-2">
                  <Award className={`w-5 h-5 ${getLevelColor(stats.level)}`} />
                  <span className={`font-bold ${getLevelColor(stats.level)}`}>{stats.level}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 통계 대시보드 */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              icon={<MapPin className="w-6 h-6" />}
              label="총 경로"
              value={stats.totalRoutes}
              color="blue"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              label="즐겨찾기"
              value={stats.favoriteRoutes}
              color="yellow"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="누적 거리"
              value={`${stats.totalDistance.toFixed(1)} km`}
              color="green"
            />
            <StatCard
              icon={<Trees className="w-6 h-6" />}
              label="평균 그늘"
              value={`${stats.avgShadeRatio.toFixed(0)}%`}
              color="emerald"
            />
          </div>
        )}

        {/* Gamification 통계 */}
        {stats && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              라이더 성과
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${seasonMode === 'WINTER' ? 'text-orange-400' : 'text-red-400'}`}>
                  {stats.heatAvoided.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {seasonMode === 'WINTER' ? '회피한 결빙/위험 구간' : '회피한 위험 구간'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{stats.sheltersUsed}</div>
                <div className="text-sm text-gray-400 mt-1">이용한 쉼터</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">{stats.totalRidingTime} 분</div>
                <div className="text-sm text-gray-400 mt-1">총 주행 시간</div>
              </div>
            </div>

            {/* 레벨 진행도 */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">다음 레벨까지</span>
                <span className="text-sm font-bold text-white">{stats.levelProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all"
                  style={{ width: `${stats.levelProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 주행 환경 설정 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-400" />
            주행 환경 설정
          </h2>

          {/* 우회 비율 슬라이더 */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-3">
              얼마나 더 돌아가도 괜찮나요?
              <span className="ml-2 text-green-400 font-bold">{maxDetourPercent}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={maxDetourPercent}
              onChange={(e) => setMaxDetourPercent(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (최단 경로)</span>
              <span>50% (안전 우선)</span>
            </div>
          </div>

          {/* 계절 모드 선택 */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-3">계절 모드</label>
            <div className="grid grid-cols-3 gap-3">
              {(['AUTO', 'SUMMER', 'WINTER'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSeasonMode(mode)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${seasonMode === mode
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 border-green-400 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    {mode === 'SUMMER' && <Sun className="w-6 h-6" />}
                    {mode === 'WINTER' && <Snowflake className="w-6 h-6" />}
                    {mode === 'AUTO' && <Settings className="w-6 h-6" />}
                    <span className="text-sm font-semibold">
                      {mode === 'AUTO' ? '자동' : mode === 'SUMMER' ? '여름' : '겨울'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {seasonMode === 'WINTER' && '⚠️ 겨울 모드: 그늘 구간 = 블랙아이스 위험지대로 판단합니다'}
              {seasonMode === 'SUMMER' && '☀️ 여름 모드: 그늘 경로를 우선적으로 추천합니다'}
              {seasonMode === 'AUTO' && '🤖 자동 모드: 현재 월을 기준으로 계절을 자동 판단합니다'}
            </p>
          </div>

          {/* 선호 옵션 토글 */}
          <div className="space-y-4">
            <ToggleSwitch
              label="그늘 경로 선호"
              checked={preferShade}
              onChange={setPreferShade}
              icon={<Trees className="w-5 h-5" />}
              disabled={seasonMode === 'WINTER'}
            />
            <ToggleSwitch
              label="위험 지역 회피"
              checked={avoidHeat}
              onChange={setAvoidHeat}
              icon={<ThermometerSun className="w-5 h-5" />}
              disabled={seasonMode === 'WINTER'}
            />
            <ToggleSwitch
              label="쉼터 위치 표시"
              checked={showShelters}
              onChange={setShowShelters}
              icon={<MapPin className="w-5 h-5" />}
            />
            {seasonMode === 'WINTER' && (
              <ToggleSwitch
                label="블랙아이스 구간 회피"
                checked={avoidBlackIce}
                onChange={setAvoidBlackIce}
                icon={<Snowflake className="w-5 h-5" />}
              />
            )}
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all"
          >
            설정 저장
          </button>
        </div>

        {/* 즐겨찾는 경로 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            즐겨찾는 경로
          </h2>
          {favoriteRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>즐겨찾기한 경로가 없습니다</p>
              <Link to="/route-search" className="text-green-400 hover:underline mt-2 inline-block">
                경로 탐색하러 가기 →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {favoriteRoutes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </div>

        {/* 커뮤니티 활동 */}
        {stats && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              내 활동
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{stats.totalPosts}</div>
                <div className="text-sm text-gray-400 mt-1">작성한 글</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-pink-400">{stats.totalLikes}</div>
                <div className="text-sm text-gray-400 mt-1">받은 좋아요</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }[color];

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

// 토글 스위치 컴포넌트
function ToggleSwitch({ label, checked, onChange, icon, disabled }: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-700 rounded-lg ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="text-gray-300">{icon}</div>
        <span className="text-gray-200">{label}</span>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative w-14 h-7 rounded-full transition-colors
          ${checked ? 'bg-green-500' : 'bg-gray-600'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`
          absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform
          ${checked ? 'transform translate-x-7' : ''}
        `} />
      </button>
    </div>
  );
}

// 경로 카드 컴포넌트
function RouteCard({ route }: { route: RouteResponse }) {
  return (
    <Link to={`/routes/${route.id}`} className="block">
      <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-all border border-gray-600 hover:border-green-500">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-white text-sm">{route.routeName}</h3>
          <div className={`
            px-2 py-1 rounded text-xs font-semibold
            ${route.routeType === 'SHADE_OPTIMIZED' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}
          `}>
            {route.routeType === 'SHADE_OPTIMIZED' ? '그늘 경로' : '최단 경로'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">거리:</span>
            <span className="ml-1 text-white font-semibold">{route.distance.toFixed(1)} km</span>
          </div>
          <div>
            <span className="text-gray-400">시간:</span>
            <span className="ml-1 text-white font-semibold">{route.estimatedTime} 분</span>
          </div>
          <div>
            <span className="text-gray-400">그늘:</span>
            <span className="ml-1 text-green-400 font-semibold">{(route.shadeRatio * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-gray-400">위험:</span>
            <span className="ml-1 text-red-400 font-semibold">{(route.heatExposure * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
