// 사용 가능한 레이어 목록 확인 스크립트
const API_KEY = "4c58df36-82b2-40b2-b360-6450cca44b1e";
const BASE_URL = "https://climate.gg.go.kr/ols/api/geoserver/wfs";

async function getLayerList() {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    service: "WFS",
    version: "1.1.0",
    request: "GetCapabilities",
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const text = await response.text();

  // XML에서 레이어명 추출
  const matches = text.match(/<Name>([^<]+)<\/Name>/g) || [];
  const layers = matches
    .map((m) => m.replace(/<\/?Name>/g, ""))
    .filter((name) => !name.includes(":") && name !== "WFS");

  console.log(`\n총 ${layers.length}개 레이어 발견:\n`);

  // 폭염 관련 레이어 찾기
  const heatRelated = layers.filter(l =>
    l.toLowerCase().includes('heat') ||
    l.toLowerCase().includes('temp') ||
    l.toLowerCase().includes('hot') ||
    l.toLowerCase().includes('extreme') ||
    l.toLowerCase().includes('weather')
  );
  console.log('\n🔥 폭염/온도 관련 레이어:');
  heatRelated.forEach(l => console.log('  -', l));

  // 식생 관련 레이어 찾기
  const vegRelated = layers.filter(l =>
    l.toLowerCase().includes('veg') ||
    l.toLowerCase().includes('forest') ||
    l.toLowerCase().includes('tree') ||
    l.toLowerCase().includes('green') ||
    l.toLowerCase().includes('biotop') ||
    l.toLowerCase().includes('park')
  );
  console.log('\n🌳 식생/녹지 관련 레이어:');
  vegRelated.forEach(l => console.log('  -', l));

  // 대피시설 관련 레이어 찾기
  const shelterRelated = layers.filter(l =>
    l.toLowerCase().includes('shelter') ||
    l.toLowerCase().includes('rest') ||
    l.toLowerCase().includes('cool') ||
    l.toLowerCase().includes('emergency') ||
    l.toLowerCase().includes('facility') ||
    l.toLowerCase().includes('public')
  );
  console.log('\n🏠 대피시설 관련 레이어:');
  shelterRelated.forEach(l => console.log('  -', l));

  // 전체 레이어 목록 (처음 50개만)
  console.log('\n📋 전체 레이어 목록 (처음 50개):');
  layers.slice(0, 50).forEach((l, i) => console.log(`  ${i + 1}. ${l}`));

  if (layers.length > 50) {
    console.log(`  ... 외 ${layers.length - 50}개 더`);
  }
}

getLayerList().catch(console.error);
