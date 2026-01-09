import type { RouteResponse } from '../types/route';
import type { SeasonMode } from '../types/user';
import { TrendingUp, Trees, Clock, Thermometer, MapPin, Check, AlertTriangle, Sun } from 'lucide-react';

interface RouteComparisonProps {
  shortestRoute: RouteResponse;
  shadeRoute: RouteResponse;
  selectedRoute: RouteResponse | null;
  onSelectRoute: (route: RouteResponse) => void;
  seasonMode: SeasonMode;
}

export default function RouteComparison({
  shortestRoute,
  shadeRoute,
  selectedRoute,
  onSelectRoute,
  seasonMode,
}: RouteComparisonProps) {
  const isWinter = seasonMode === 'WINTER';
  const RouteCard = ({ route, title, color, icon: Icon }: {
    route: RouteResponse;
    title: string;
    color: string;
    icon: any;
  }) => {
    const isSelected = selectedRoute?.id === route.id;
    const distanceDiff = route.distance - shortestRoute.distance;
    const timeDiff = route.estimatedTime - shortestRoute.estimatedTime;

    return (
      <div
        onClick={() => onSelectRoute(route)}
        className={`
          relative bg-gray-800 rounded-xl p-6 cursor-pointer transition-all
          ${isSelected ? `ring-4 ring-${color}-500 shadow-2xl` : 'hover:shadow-xl'}
        `}
      >
        {/* 선택 표시 */}
        {isSelected && (
          <div className={`absolute top-4 right-4 w-8 h-8 bg-${color}-500 rounded-full flex items-center justify-center`}>
            <Check className="w-5 h-5 text-white" />
          </div>
        )}

        {/* 제목 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 bg-${color}-500 rounded-full flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{route.routeType}</p>
          </div>
        </div>

        {/* 통계 */}
        <div className="space-y-3">
          {/* 거리 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">거리</span>
            </div>
            <div className="text-right">
              <span className="text-white font-bold">{route.distance.toFixed(2)} km</span>
              {route.id !== shortestRoute.id && distanceDiff > 0 && (
                <span className="text-xs text-orange-400 ml-2">
                  (+{distanceDiff.toFixed(2)} km)
                </span>
              )}
            </div>
          </div>

          {/* 예상 시간 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">예상 시간</span>
            </div>
            <div className="text-right">
              <span className="text-white font-bold">{route.estimatedTime}분</span>
              {route.id !== shortestRoute.id && timeDiff > 0 && (
                <span className="text-xs text-orange-400 ml-2">
                  (+{timeDiff}분)
                </span>
              )}
            </div>
          </div>

          {/* 그늘 비율 / 결빙 위험도 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              {isWinter ? <AlertTriangle className="w-4 h-4" /> : <Trees className="w-4 h-4" />}
              <span className="text-sm">{isWinter ? '결빙 위험도' : '그늘 비율'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isWinter ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${route.shadeRatio * 100}%` }}
                />
              </div>
              <span className="text-white font-bold text-sm">
                {(route.shadeRatio * 100).toFixed(0)}%
                {isWinter && route.shadeRatio > 0.5 && ' ⚠️'}
              </span>
            </div>
          </div>

          {/* 위험 노출도 / 양지 비율 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              {isWinter ? <Sun className="w-4 h-4" /> : <Thermometer className="w-4 h-4" />}
              <span className="text-sm">{isWinter ? '양지 비율' : '위험 노출'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isWinter ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${route.heatExposure * 100}%` }}
                />
              </div>
              <span className="text-white font-bold text-sm">
                {(route.heatExposure * 100).toFixed(0)}%
                {isWinter && route.heatExposure > 0.5 && ' ✅'}
              </span>
            </div>
          </div>

          {/* 대피시설 수 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">대피시설</span>
            </div>
            <span className="text-white font-bold">{route.shelterCount}개</span>
          </div>
        </div>

        {/* 추천 배지 */}
        {route.routeType === 'SHADE_OPTIMIZED' && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${isWinter ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'} rounded-full text-xs font-semibold`}>
              {isWinter ? <AlertTriangle className="w-3 h-3" /> : <Trees className="w-3 h-3" />}
              {isWinter ? '빙판 회피 추천 경로' : '위험 회피 추천 경로'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">경로 비교</h2>
        <p className="text-gray-400 text-sm">
          {isWinter
            ? '원하는 경로를 선택하세요. 안전 경로는 약간 멀지만 빙판 위험이 적습니다.'
            : '원하는 경로를 선택하세요. 안전 경로는 약간 멀지만 위험 노출이 적습니다.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <RouteCard
          route={shortestRoute}
          title="최단 경로"
          color="blue"
          icon={TrendingUp}
        />
        <RouteCard
          route={shadeRoute}
          title={isWinter ? '안전 경로' : '그늘 경로'}
          color={isWinter ? 'orange' : 'green'}
          icon={isWinter ? AlertTriangle : Trees}
        />
      </div>

      {/* 비교 요약 */}
      <div className={`bg-gradient-to-r ${isWinter ? 'from-orange-900/30 to-amber-900/30 border-orange-500/30' : 'from-green-900/30 to-blue-900/30 border-green-500/30'} border rounded-xl p-6`}>
        <h3 className="text-lg font-bold text-white mb-3">경로 차이</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">거리 차이</p>
            <p className="text-white font-bold">
              {Math.abs(shadeRoute.distance - shortestRoute.distance).toFixed(2)} km
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">시간 차이</p>
            <p className="text-white font-bold">
              {Math.abs(shadeRoute.estimatedTime - shortestRoute.estimatedTime)}분
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">{isWinter ? '결빙 위험 감소' : '그늘 증가'}</p>
            <p className={`${isWinter ? 'text-orange-400' : 'text-green-400'} font-bold`}>
              {isWinter ? '-' : '+'}
              {Math.abs((shadeRoute.shadeRatio - shortestRoute.shadeRatio) * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">{isWinter ? '양지 증가' : '위험 감소'}</p>
            <p className={`${isWinter ? 'text-amber-400' : 'text-blue-400'} font-bold`}>
              {isWinter ? '+' : '-'}
              {Math.abs((shortestRoute.heatExposure - shadeRoute.heatExposure) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
