import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import { Loader2, ThermometerSun, Trees, Home } from 'lucide-react'
import { getLayer } from './lib/ggClimate'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet 마커 아이콘 수정 (기본 아이콘 경로 문제 해결)
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 파란색 대피시설 마커 아이콘
const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// 히트맵 레이어 (건물 탄소배출 = 폭염 위험도) - 붉은색
function HeatmapLayer({ data }: { data: any }) {
  const map = useMap()

  useEffect(() => {
    if (!data || !data.features) return

    // 탄소 배출량 범위 계산
    const emissions = data.features
      .map((f: any) => f.properties?.cbn_ehqty || f.properties?.gas_cbn_ehqty || 0)
      .filter((e: number) => e > 0)
    const maxEmission = Math.max(...emissions, 1)

    // GeoJSON 레이어를 붉은색으로 스타일링 (배출량에 따라 강도 조절)
    const layer = L.geoJSON(data, {
      style: (feature) => {
        const emission = feature?.properties?.cbn_ehqty || feature?.properties?.gas_cbn_ehqty || 0
        const intensity = Math.min(emission / maxEmission, 1)
        return {
          fillColor: '#ff0000',
          fillOpacity: 0.3 + intensity * 0.4, // 0.3-0.7
          color: '#ff0000',
          weight: 1,
          opacity: 0.5
        }
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties
        const emission = props.cbn_ehqty || props.gas_cbn_ehqty || 0
        const building = props.bldg_nm || props.building_name || ''
        layer.bindPopup(`
          <b>🔥 폭염 위험 지역</b><br/>
          ${building ? `건물: ${building}<br/>` : ''}
          탄소배출: ${emission.toLocaleString()} tCO2eq
        `)
      }
    })

    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [data, map])

  return null
}

// 현존식생지도 레이어 - 초록색 (시원한 그늘 지역)
function VegetationLayer({ data }: { data: any }) {
  const map = useMap()

  useEffect(() => {
    if (!data || !data.features) return

    const layer = L.geoJSON(data, {
      style: () => ({
        fillColor: '#00ff00',
        fillOpacity: 0.4,
        color: '#00aa00',
        weight: 1,
        opacity: 0.6
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties
        const name = props.sclsf_nm || props.veg_nm || props.name || '녹지'
        const area = props.biotop_area || props.area || 0
        const sgg = props.sgg_nm || ''

        layer.bindPopup(`
          <b>🌳 시원한 그늘 지역</b><br/>
          ${name}<br/>
          ${sgg ? `위치: ${sgg}<br/>` : ''}
          ${area > 0 ? `면적: ${Math.round(area).toLocaleString()}㎡` : ''}
        `)
      }
    })

    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [data, map])

  return null
}

function App() {
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [vegetationData, setVegetationData] = useState<any>(null)
  const [shelters, setShelters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // 경기도 중심 좌표
  const center: [number, number] = [37.2636, 127.0286]

  useEffect(() => {
    async function fetchData() {
      try {
        setError('')

        // 여러 레이어 시도해보기
        const layerPromises = []

        // 1. 폭염 관련 데이터 시도 (건물 밀집도/탄소배출 = 열섬 효과)
        const heatLayers = [
          'bldg_gas_cbn_ehqty',    // 건물 가스 탄소 배출량 (폭염 위험 지역 대리)
          'bldg_hetng_cbn_ehqty',  // 건물 난방 탄소 배출량
          'TM_BLDG_INFO',          // 건물 정보
        ]

        // 2. 현존식생지도 시도 (나무/녹지 있는 시원한 곳)
        const vegLayers = [
          'park',                  // 공원
          'biotop_type_evl_5grd',  // 비오톱 유형 평가
          'tree_cvg',              // 나무 피복
          'green_area',            // 녹지 지역
        ]

        // 3. 대피시설 (무더위 쉼터)
        const shelterLayers = [
          'dsvctm_tmpr_hab_fclt',  // 무더위 쉼터 (공공 냉방 시설)
        ]

        // 각 카테고리에서 첫 번째로 성공하는 레이어 사용
        const tryLayers = async (layers: string[], maxFeatures = 200) => {
          for (const layer of layers) {
            try {
              const data = await getLayer(layer, maxFeatures)
              if (data && data.features && data.features.length > 0) {
                console.log(`✓ 레이어 ${layer} 성공: ${data.features.length}개 항목`)
                return data
              }
            } catch (e) {
              console.log(`✗ 레이어 ${layer} 실패, 다음 시도...`)
            }
          }
          return null
        }

        const [heatData, vegData, shelterData] = await Promise.all([
          tryLayers(heatLayers, 300),     // 폭염 위험 지역
          tryLayers(vegLayers, 500),      // 식생 지역 (더 많이)
          tryLayers(shelterLayers, 1000)  // 대피시설 (최대한 많이)
        ])

        setHeatmapData(heatData)
        setVegetationData(vegData)
        setShelters(shelterData?.features || [])

        if (!heatData && !vegData && !shelterData) {
          setError('데이터를 불러올 수 없습니다. 사용 가능한 레이어를 확인해주세요.')
        }

      } catch (e: any) {
        console.error('데이터 로딩 에러:', e)
        setError(e.message || '데이터 로딩 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="ml-3 text-xl">지도 데이터 로딩중...</span>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 text-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-red-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
          🌳 경기 그늘 로드 (Gyeonggi Shade Road)
        </h1>
        <p className="text-center text-gray-400 text-sm mt-1">"속도보다 생존입니다" - 이동노동자를 위한 폭염 회피 지도</p>
        <div className="flex justify-center gap-6 mt-3 text-sm">
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
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-yellow-900 text-yellow-200 p-3 text-center">
          ⚠️ {error}
        </div>
      )}

      {/* 지도 */}
      <div className="flex-1">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 폭염 체감 온도 히트맵 (붉은색) */}
          {heatmapData && <HeatmapLayer data={heatmapData} />}

          {/* 현존식생지도 (초록색) */}
          {vegetationData && <VegetationLayer data={vegetationData} />}

          {/* 대피시설 마커 (파란색) - 무더위 쉼터 */}
          {shelters.map((shelter, idx) => {
            const coords = shelter.geometry?.coordinates
            if (!coords) return null

            // dsvctm_tmpr_hab_fclt는 Point 타입이고 이미 WGS84 좌표계 사용
            let lat, lng
            if (shelter.geometry.type === 'Point') {
              [lng, lat] = coords
            } else if (Array.isArray(coords[0])) {
              // Polygon의 경우 중심점 계산
              const center = coords[0].reduce((acc: number[], coord: number[]) => {
                return [acc[0] + coord[0], acc[1] + coord[1]]
              }, [0, 0])
              lng = center[0] / coords[0].length
              lat = center[1] / coords[0].length

              // 좌표 변환이 필요한 경우 (EPSG:5186 -> EPSG:4326)
              if (lng > 1000 || lat > 1000) {
                lng = (lng - 200000) / 88000 + 127
                lat = (lat - 600000) / 111000 + 38
              }
            }

            if (!lat || !lng || lat < 30 || lat > 40 || lng < 120 || lng > 135) {
              return null
            }

            const props = shelter.properties || {}
            const name = props.fclt_nm || props.name || '무더위 쉼터'
            const address = props.lctn_lotno_addr || ''
            const capacity = props.actc_ppltn_cnt || ''

            return (
              <Marker
                key={idx}
                position={[lat, lng]}
                icon={shelterIcon}
              >
                <Popup>
                  <div className="font-bold text-blue-600">{name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {props.fclt_se_nm && <div>유형: {props.fclt_se_nm}</div>}
                    {capacity && <div>수용: {capacity}명</div>}
                    {address && <div className="mt-1">{address}</div>}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* 데이터 상태 표시 */}
      <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex justify-center gap-6">
        <span>폭염 데이터: {heatmapData ? '✓' : '✗'}</span>
        <span>식생 데이터: {vegetationData ? '✓' : '✗'}</span>
        <span>대피시설: {shelters.length}개</span>
      </div>
    </div>
  )
}

export default App
