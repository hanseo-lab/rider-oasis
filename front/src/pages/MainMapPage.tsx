import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import { Loader2, ThermometerSun, Trees, Home, Navigation } from 'lucide-react';
import { getLayer, getSheltersBySeasonMode } from '../lib/ggClimate';
import { userAPI } from '../api/user';
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

const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('AUTO'); // ✨ 계절 모드 상태

  const center: [number, number] = [37.2636, 127.0286];

  // ✨ 사용자 설정 로드
  useEffect(() => {
    async function loadUserSettings() {
      try {
        const userInfo = await userAPI.getMyInfo();
        setSeasonMode(userInfo.seasonMode);
      } catch (error) {
        console.error('사용자 설정 로딩 실패:', error);
        // 에러 발생 시 AUTO 모드 유지
      }
    }
    loadUserSettings();
  }, []);

  // ✨ 지도 데이터 로드 (seasonMode 의존성 추가)
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

        // ✨ 계절 모드에 따라 쉼터 데이터 조회
        const loadShelters = async () => {
          try {
            const shelterData = await getSheltersBySeasonMode(seasonMode, 1000);
            console.log(`✓ 쉼터 (${seasonMode} 모드): ${shelterData.features.length}개 항목`);
            return shelterData;
          } catch (e) {
            console.log('✗ 쉼터 데이터 로딩 실패');
            return null;
          }
        };

        const [heatData, vegData, shelterData] = await Promise.all([
          tryLayers(heatLayers, 300),
          tryLayers(vegLayers, 500),
          loadShelters(), // ✨ 계절별 쉼터 로드
        ]);

        setHeatmapData(heatData);
        setVegetationData(vegData);
        setShelters(shelterData?.features || []);

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
  }, [seasonMode]); // ✨ seasonMode 변경 시 데이터 재로드

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="ml-3 text-xl">지도 데이터 로딩중...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 인포 배너 */}
      <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-b border-green-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <ThermometerSun className="text-red-400" size={18} />
              <span className="text-gray-300">붉은색: 폭염 지역</span>
            </div>
            <div className="flex items-center gap-2">
              <Trees className="text-green-400" size={18} />
              <span className="text-gray-300">초록색: 나무 있는 곳</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="text-blue-400" size={18} />
              <span className="text-gray-300">파란 핀: 대피시설</span>
            </div>
          </div>

          <Link
            to="/route-search"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all font-semibold"
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
            // ✨ 계절 모드에 따라 쉼터 이름 변경
            const defaultName = seasonMode === 'WINTER' ? '한파 쉼터' : '무더위 쉼터';
            const name = props.fclt_nm || props.name || defaultName;
            const address = props.lctn_lotno_addr || '';
            const capacity = props.actc_ppltn_cnt || '';

            return (
              <Marker key={idx} position={[lat, lng]} icon={shelterIcon}>
                <Popup>
                  <div className="font-bold text-blue-600">
                    {seasonMode === 'WINTER' ? '❄️' : '☀️'} {name}
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
        </MapContainer>
      </div>

      <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex justify-center gap-6">
        <span>폭염 데이터: {heatmapData ? '✓' : '✗'}</span>
        <span>식생 데이터: {vegetationData ? '✓' : '✗'}</span>
        <span>
          {seasonMode === 'WINTER' ? '❄️ 한파' : seasonMode === 'SUMMER' ? '☀️ 무더위' : '🔄 자동'} 쉼터: {shelters.length}개
        </span>
        <span className="text-blue-400">
          계절 모드: {seasonMode === 'AUTO' ? '자동' : seasonMode === 'SUMMER' ? '여름' : '겨울'}
        </span>
      </div>
    </div>
  );
}
