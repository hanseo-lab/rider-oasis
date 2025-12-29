import { useState } from 'react';
import { MapPin, Search, Navigation, TrendingUp, Trees, Clock, Thermometer } from 'lucide-react';
import { routesAPI } from '../api/routes';
import type { RouteResponse } from '../types/route';
import RouteComparison from '../components/RouteComparison';
import RouteMap from '../components/RouteMap';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export default function RouteSearchPage() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');

  const [shortestRoute, setShortestRoute] = useState<RouteResponse | null>(null);
  const [shadeRoute, setShadeRoute] = useState<RouteResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'search' | 'compare'>('search');

  // 간단한 주소 검색 (Nominatim API 사용)
  const searchAddress = async (query: string, isStart: boolean) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query + ' 경기도'
        )}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location: Location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name,
        };

        if (isStart) {
          setStartLocation(location);
        } else {
          setEndLocation(location);
        }
      } else {
        alert('주소를 찾을 수 없습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('주소 검색 실패:', err);
      alert('주소 검색 중 오류가 발생했습니다.');
    }
  };

  // 지도 클릭으로 위치 설정
  const handleMapClick = (lat: number, lng: number, isStart: boolean) => {
    const location: Location = {
      lat,
      lng,
      address: `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`,
    };

    if (isStart) {
      setStartLocation(location);
    } else {
      setEndLocation(location);
    }
  };

  // 경로 탐색 실행
  const handleSearchRoutes = async () => {
    if (!startLocation || !endLocation) {
      alert('출발지와 도착지를 모두 설정해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 최단 경로 요청
      const shortestPromise = routesAPI.createRoute({
        routeName: `최단 경로: ${startLocation.address} → ${endLocation.address}`,
        startLat: startLocation.lat,
        startLng: startLocation.lng,
        startAddress: startLocation.address,
        endLat: endLocation.lat,
        endLng: endLocation.lng,
        endAddress: endLocation.address,
        routeType: 'SHORTEST',
      });

      // 그늘 최적화 경로 요청
      const shadePromise = routesAPI.createRoute({
        routeName: `그늘 경로: ${startLocation.address} → ${endLocation.address}`,
        startLat: startLocation.lat,
        startLng: startLocation.lng,
        startAddress: startLocation.address,
        endLat: endLocation.lat,
        endLng: endLocation.lng,
        endAddress: endLocation.address,
        routeType: 'SHADE_OPTIMIZED',
      });

      const [shortest, shade] = await Promise.all([shortestPromise, shadePromise]);

      setShortestRoute(shortest);
      setShadeRoute(shade);
      setSelectedRoute(shade); // 기본으로 그늘 경로 선택
      setStep('compare');
    } catch (err: any) {
      setError(err.response?.data?.message || '경로 탐색 실패');
      console.error('경로 탐색 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            경로 탐색
          </h1>
          {step === 'compare' && (
            <button
              onClick={() => {
                setStep('search');
                setShortestRoute(null);
                setShadeRoute(null);
                setSelectedRoute(null);
              }}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              새 경로 검색
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {step === 'search' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 왼쪽: 검색 폼 */}
            <div className="space-y-6">
              {/* 출발지 */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">출발지</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={startSearch}
                      onChange={(e) => setStartSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchAddress(startSearch, true)}
                      placeholder="주소 검색 (예: 수원역)"
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => searchAddress(startSearch, true)}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>

                  {startLocation && (
                    <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                      <p className="font-semibold text-green-400 mb-1">선택된 위치:</p>
                      <p className="truncate">{startLocation.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 도착지 */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">도착지</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={endSearch}
                      onChange={(e) => setEndSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchAddress(endSearch, false)}
                      placeholder="주소 검색 (예: 성남시청)"
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => searchAddress(endSearch, false)}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>

                  {endLocation && (
                    <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                      <p className="font-semibold text-blue-400 mb-1">선택된 위치:</p>
                      <p className="truncate">{endLocation.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 경로 탐색 버튼 */}
              <button
                onClick={handleSearchRoutes}
                disabled={!startLocation || !endLocation || loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>처리 중...</>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    경로 탐색 시작
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* 오른쪽: 지도 미리보기 */}
            <div className="bg-gray-800 rounded-xl p-4 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">지도에서 선택</h3>
              <div className="bg-gray-700 rounded-lg h-[500px] flex items-center justify-center text-gray-400">
                <p>지도 클릭으로 위치 설정 (구현 예정)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 경로 비교 */}
            {shortestRoute && shadeRoute && (
              <RouteComparison
                shortestRoute={shortestRoute}
                shadeRoute={shadeRoute}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
              />
            )}

            {/* 지도 표시 */}
            {selectedRoute && (
              <RouteMap route={selectedRoute} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
