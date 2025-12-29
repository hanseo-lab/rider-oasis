import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Loader2, ThermometerSun, Trees, Home, Navigation, Snowflake, AlertTriangle, MessageSquare } from 'lucide-react';
import { getLayer, getShelters } from '../lib/ggClimate';
import { userAPI } from '../api/user';
import { communityAPI, type CommunityPostResponse } from '../api/community';
import type { SeasonMode } from '../types/user';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Leaflet 마커 아이콘 수정
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 여름 쉼터: 파란색 마커
const summerShelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 겨울 쉼터: 주황색 마커
const winterShelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 커뮤니티 게시글: 보라색 마커
const communityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function HeatmapLayer({ data }: { data: any }) {
  const map = useMap();

  useEffect(() => {
    if (!data || !data.features) return;

    const emissions = data.features
      .map((f: any) => f.properties?.cbn_ehqty || f.properties?.gas_cbn_ehqty || 0)
      .filter((e: number) => e > 0);
    const maxEmission = Math.max(...emissions, 1);

    const layer = L.geoJSON(data, {
      style: (feature) => {
        const emission = feature?.properties?.cbn_ehqty || feature?.properties?.gas_cbn_ehqty || 0;
        const intensity = Math.min(emission / maxEmission, 1);
        return {
          fillColor: '#ff0000',
          fillOpacity: 0.3 + intensity * 0.4,
          color: '#ff0000',
          weight: 1,
          opacity: 0.5,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const emission = props.cbn_ehqty || props.gas_cbn_ehqty || 0;
        const building = props.bldg_nm || props.building_name || '';
        layer.bindPopup(`
          <b>🔥 폭염 위험 지역</b><br/>
          ${building ? `건물: ${building}<br/>` : ''}
          탄소배출: ${emission.toLocaleString()} tCO2eq
        `);
      },
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [data, map]);

  return null;
}

function VegetationLayer({ data }: { data: any }) {
  const map = useMap();

  useEffect(() => {
    if (!data || !data.features) return;

    const layer = L.geoJSON(data, {
      style: () => ({
        fillColor: '#00ff00',
        fillOpacity: 0.4,
        color: '#00aa00',
        weight: 1,
        opacity: 0.6,
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const name = props.sclsf_nm || props.veg_nm || props.name || '녹지';
        const area = props.biotop_area || props.area || 0;
        const sgg = props.sgg_nm || '';

        layer.bindPopup(`
          <b>🌳 시원한 그늘 지역</b><br/>
          ${name}<br/>
          ${sgg ? `위치: ${sgg}<br/>` : ''}
          ${area > 0 ? `면적: ${Math.round(area).toLocaleString()}㎡` : ''}
        `);
      },
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [data, map]);

  return null;
}

export default function MainMapPage() {
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [vegetationData, setVegetationData] = useState<any>(null);
  const [shelters, setShelters] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('AUTO');

  const center: [number, number] = [37.2636, 127.0286];

  // 사용자 설정 로드
  useEffect(() => {
    async function loadUserSettings() {
      try {
        const userInfo = await userAPI.getMyInfo();
        let actualMode = userInfo.seasonMode;

        // AUTO 모드인 경우 현재 월 기준으로 판단
        if (actualMode === 'AUTO') {
          const month = new Date().getMonth() + 1;
          actualMode = (month >= 11 || month <= 3) ? 'WINTER' : 'SUMMER';
        }

        setSeasonMode(actualMode as SeasonMode);
      } catch (error) {
        console.error('사용자 설정 로딩 실패:', error);
        // 에러 발생 시 현재 월 기준으로 자동 판단
        const month = new Date().getMonth() + 1;
        setSeasonMode((month >= 11 || month <= 3) ? 'WINTER' : 'SUMMER');
      }
    }
    loadUserSettings();
  }, []);

  // 지도 데이터 로드 (seasonMode 의존성)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        const heatLayers = ['bldg_gas_cbn_ehqty', 'bldg_hetng_cbn_ehqty', 'TM_BLDG_INFO'];
        const vegLayers = ['park', 'biotop_type_evl_5grd', 'tree_cvg', 'green_area'];

        const tryLayers = async (layers: string[], maxFeatures = 200) => {
          for (const layer of layers) {
            try {
              const data = await getLayer(layer, maxFeatures);
              if (data && data.features && data.features.length > 0) {
                console.log(`✓ 레이어 ${layer} 성공: ${data.features.length}개 항목`);
                return data;
              }
            } catch (e) {
              console.log(`✗ 레이어 ${layer} 실패, 다음 시도...`);
            }
          }
          return null;
        };

        // 계절 모드에 따라 쉼터 데이터 조회
        const loadShelters = async () => {
          try {
            const shelterData = await getShelters(1000, seasonMode);
            console.log(`✓ 쉼터 (${seasonMode} 모드): ${shelterData.features.length}개 항목`);
            return shelterData;
          } catch (e) {
            console.log('✗ 쉼터 데이터 로딩 실패');
            return null;
          }
        };

        // 커뮤니티 게시글 로드 (위치 정보가 있는 것만)
        const loadCommunityPosts = async () => {
          try {
            const postsData = await communityAPI.getAllPosts(0, 100);
            // 위치 정보가 있는 게시글만 필터링
            const postsWithLocation = postsData.content.filter(
              (post) => post.locationLat && post.locationLng
            );
            console.log(`✓ 커뮤니티 게시글 (위치 포함): ${postsWithLocation.length}개`);
            return postsWithLocation;
          } catch (e) {
            console.log('✗ 커뮤니티 게시글 로딩 실패');
            return [];
          }
        };

        const [heatData, vegData, shelterData, postsData] = await Promise.all([
          tryLayers(heatLayers, 300),
          tryLayers(vegLayers, 500),
          loadShelters(),
          loadCommunityPosts(),
        ]);

        setHeatmapData(heatData);
        setVegetationData(vegData);
        setShelters(shelterData?.features || []);
        setCommunityPosts(postsData);

        if (!heatData && !vegData && !shelterData) {
          setError('데이터를 불러올 수 없습니다.');
        }
      } catch (e: any) {
        console.error('데이터 로딩 에러:', e);
        setError(e.message || '데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [seasonMode]); // seasonMode 변경 시 데이터 재로드

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="ml-3 text-xl">지도 데이터 로딩중...</span>
      </div>
    );
  }

  // 계절별 마커 아이콘 선택
  const shelterIcon = seasonMode === 'WINTER' ? winterShelterIcon : summerShelterIcon;

  // 계절별 UI 설정
  const seasonConfig = {
    SUMMER: {
      icon: ThermometerSun,
      color: 'text-orange-400',
      bgColor: 'from-orange-900/50 to-red-900/50',
      borderColor: 'border-orange-500/30',
      heatLabel: '폭염 지역',
      vegLabel: '시원한 그늘',
      shelterLabel: '무더위 쉼터',
      shelterEmoji: '💧',
      shelterColor: 'text-blue-400',
    },
    WINTER: {
      icon: Snowflake,
      color: 'text-blue-300',
      bgColor: 'from-blue-900/50 to-cyan-900/50',
      borderColor: 'border-blue-500/30',
      heatLabel: '급경사/위험',
      vegLabel: '그늘(결빙주의)',
      shelterLabel: '한파 쉼터',
      shelterEmoji: '♨️',
      shelterColor: 'text-orange-400',
    },
  };

  const config = seasonConfig[seasonMode as 'SUMMER' | 'WINTER'] || seasonConfig.SUMMER;
  const SeasonIcon = config.icon;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 상단 배너 - 계절별 안내 */}
      <div className={`bg-gradient-to-r ${config.bgColor} border-b ${config.borderColor} p-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={18} />
              <span className="text-gray-300">붉은색: {config.heatLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trees className={seasonMode === 'WINTER' ? 'text-blue-300' : 'text-green-400'} size={18} />
              <span className="text-gray-300">초록색: {config.vegLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className={config.shelterColor} size={18} />
              <span className="text-gray-300">
                {seasonMode === 'WINTER' ? '주황' : '파란'} 핀: {config.shelterLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="text-purple-400" size={18} />
              <span className="text-gray-300">보라 핀: 커뮤니티 제보</span>
            </div>
          </div>

          <Link
            to="/route-search"
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${
              seasonMode === 'WINTER'
                ? 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                : 'from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
            } text-white rounded-lg transition-all font-semibold`}
          >
            <Navigation className="w-4 h-4" />
            경로 탐색 시작
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-900 text-yellow-200 p-3 text-center">⚠️ {error}</div>
      )}

      <div className="flex-1">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {heatmapData && <HeatmapLayer data={heatmapData} />}
          {vegetationData && <VegetationLayer data={vegetationData} />}

          {shelters.map((shelter, idx) => {
            const coords = shelter.geometry?.coordinates;
            if (!coords) return null;

            let lat, lng;
            if (shelter.geometry.type === 'Point') {
              [lng, lat] = coords;
            } else if (Array.isArray(coords[0])) {
              const center = coords[0].reduce(
                (acc: number[], coord: number[]) => [acc[0] + coord[0], acc[1] + coord[1]],
                [0, 0]
              );
              lng = center[0] / coords[0].length;
              lat = center[1] / coords[0].length;

              if (lng > 1000 || lat > 1000) {
                lng = (lng - 200000) / 88000 + 127;
                lat = (lat - 600000) / 111000 + 38;
              }
            }

            if (!lat || !lng || lat < 30 || lat > 40 || lng < 120 || lng > 135) {
              return null;
            }

            const props = shelter.properties || {};
            const name = props.fclt_nm || props.name || config.shelterLabel;
            const address = props.lctn_lotno_addr || '';
            const capacity = props.actc_ppltn_cnt || '';

            return (
              <Marker key={idx} position={[lat, lng]} icon={shelterIcon}>
                <Popup>
                  <div className="font-bold" style={{ color: seasonMode === 'WINTER' ? '#fb923c' : '#3b82f6' }}>
                    {config.shelterEmoji} {name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {props.fclt_se_nm && <div>유형: {props.fclt_se_nm}</div>}
                    {capacity && <div>수용: {capacity}명</div>}
                    {address && <div className="mt-1">{address}</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 커뮤니티 게시글 마커 */}
          {communityPosts.map((post) => {
            if (!post.locationLat || !post.locationLng) return null;

            return (
              <Marker
                key={`community-${post.id}`}
                position={[post.locationLat, post.locationLng]}
                icon={communityIcon}
              >
                <Popup>
                  <div className="font-bold text-purple-600 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {post.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <div className="mb-1">
                      <span className="font-semibold">작성자:</span> {post.authorNickname || post.authorUsername}
                    </div>
                    <div className="mb-2 line-clamp-2">{post.content}</div>
                    {post.locationName && (
                      <div className="text-green-600 mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.locationName}
                      </div>
                    )}
                    <Link
                      to={`/community/posts/${post.id}`}
                      className="text-purple-600 hover:text-purple-700 font-semibold underline block mt-2"
                    >
                      상세보기 →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex justify-center gap-6">
        <span>폭염 데이터: {heatmapData ? '✓' : '✗'}</span>
        <span>식생 데이터: {vegetationData ? '✓' : '✗'}</span>
        <span>
          {config.shelterEmoji} {config.shelterLabel}: {shelters.length}개
        </span>
        <span className="text-purple-400">
          <MessageSquare className="inline w-3 h-3 mr-1" />
          커뮤니티 제보: {communityPosts.length}개
        </span>
        <span className={config.color}>
          <SeasonIcon className="inline w-3 h-3 mr-1" />
          계절 모드: {seasonMode === 'SUMMER' ? '여름' : '겨울'}
        </span>
      </div>
    </div>
  );
}
