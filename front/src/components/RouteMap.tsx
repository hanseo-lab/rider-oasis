import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteResponse } from '../types/route';
import type { SeasonMode } from '../types/user';

// 마커 아이콘 설정
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function FitBounds({ route }: { route: RouteResponse }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([
      [route.startLat, route.startLng],
      [route.endLat, route.endLng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [route, map]);

  return null;
}

interface RouteMapProps {
  route: RouteResponse;
  seasonMode: SeasonMode;
}

export default function RouteMap({ route, seasonMode }: RouteMapProps) {
  const isWinter = seasonMode === 'WINTER';
  // GeoJSON 파싱
  const pathCoordinates = (() => {
    try {
      const geoJson = JSON.parse(route.pathGeoJson);
      return geoJson.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
    } catch (e) {
      console.error('GeoJSON 파싱 실패:', e);
      return [[route.startLat, route.startLng], [route.endLat, route.endLng]];
    }
  })();

  const center: [number, number] = [
    (route.startLat + route.endLat) / 2,
    (route.startLng + route.endLng) / 2
  ];

  // 겨울: SHADE_OPTIMIZED는 주황색(안전 경로), 여름: 초록색(그늘 경로)
  const lineColor = route.routeType === 'SHADE_OPTIMIZED'
    ? (isWinter ? '#f97316' : '#22c55e')
    : '#3b82f6';

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">선택된 경로</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">출발지</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">도착지</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded" style={{ backgroundColor: lineColor }}></div>
            <span className="text-gray-300">경로</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden h-[600px]">
        <MapContainer
          center={center}
          zoom={13}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 출발지 마커 */}
          <Marker position={[route.startLat, route.startLng]} icon={startIcon}>
            <Popup>
              <div className="font-bold text-green-600">출발지</div>
              <div className="text-xs mt-1">{route.startAddress || '위치 정보 없음'}</div>
            </Popup>
          </Marker>

          {/* 도착지 마커 */}
          <Marker position={[route.endLat, route.endLng]} icon={endIcon}>
            <Popup>
              <div className="font-bold text-red-600">도착지</div>
              <div className="text-xs mt-1">{route.endAddress || '위치 정보 없음'}</div>
            </Popup>
          </Marker>

          {/* 경로 선 */}
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: lineColor,
              weight: 5,
              opacity: 0.8,
            }}
          />

          <FitBounds route={route} />
        </MapContainer>
      </div>

      {/* 경로 정보 요약 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-700 rounded-lg">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">거리</p>
          <p className="text-white font-bold">{route.distance.toFixed(2)} km</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">예상 시간</p>
          <p className="text-white font-bold">{route.estimatedTime}분</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">{isWinter ? '결빙 위험도' : '그늘 비율'}</p>
          <p className={`${isWinter ? 'text-orange-400' : 'text-green-400'} font-bold`}>
            {(route.shadeRatio * 100).toFixed(0)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">{isWinter ? '양지 비율' : '위험 노출'}</p>
          <p className={`${isWinter ? 'text-amber-400' : 'text-red-400'} font-bold`}>
            {(route.heatExposure * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
