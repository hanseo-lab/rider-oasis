import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI, type CommunityPostRequest } from '../api/community';
import {
  MapPin,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Newspaper,
  Locate,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

type CategoryType = 'GENERAL' | 'ROUTE_TIP' | 'SHELTER_INFO' | 'WEATHER_ALERT' | 'QUESTION';

export default function PostCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('GENERAL');
  const [locationLat, setLocationLat] = useState<number>();
  const [locationLng, setLocationLng] = useState<number>();
  const [locationName, setLocationName] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'GENERAL' as CategoryType, label: '일반', icon: Newspaper, color: 'gray' },
    { value: 'ROUTE_TIP' as CategoryType, label: '꿀팁', icon: Lightbulb, color: 'yellow' },
    { value: 'QUESTION' as CategoryType, label: '질문', icon: HelpCircle, color: 'blue' },
    { value: 'WEATHER_ALERT' as CategoryType, label: '위험제보', icon: AlertTriangle, color: 'red' },
    { value: 'SHELTER_INFO' as CategoryType, label: '쉼터정보', icon: MapPin, color: 'green' },
  ];

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocationLat(lat);
        setLocationLng(lng);

        // Nominatim API로 주소 가져오기
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          setLocationName(data.display_name || `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`);
        } catch (error) {
          console.error('주소 변환 실패:', error);
          setLocationName(`위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        setLoadingLocation(false);
      }
    );
  };

  // 위치 정보 제거
  const removeLocation = () => {
    setLocationLat(undefined);
    setLocationLng(undefined);
    setLocationName('');
  };

  // 게시글 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const postData: CommunityPostRequest = {
        title: title.trim(),
        content: content.trim(),
        category,
      };

      // 위치 정보가 있으면 추가
      if (locationLat && locationLng) {
        postData.locationLat = locationLat;
        postData.locationLng = locationLng;
        postData.locationName = locationName;
      }

      const response = await communityAPI.createPost(postData);

      // 작성 완료 후 상세 페이지로 이동
      navigate(`/community/posts/${response.id}`);
    } catch (err: any) {
      console.error('게시글 작성 실패:', err);
      setError(err.response?.data?.message || '게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-10">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-500/30 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로 가기</span>
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            글쓰기
          </h1>
          <p className="text-gray-400 text-sm mt-1">라이더들과 정보를 공유하세요</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카테고리 선택 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-white font-semibold mb-4">카테고리</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;

                const colors = {
                  gray: isSelected ? 'bg-gray-500 border-gray-400' : 'bg-gray-700 border-gray-600',
                  yellow: isSelected ? 'bg-yellow-500 border-yellow-400' : 'bg-yellow-500/20 border-yellow-500',
                  blue: isSelected ? 'bg-blue-500 border-blue-400' : 'bg-blue-500/20 border-blue-500',
                  red: isSelected ? 'bg-red-500 border-red-400' : 'bg-red-500/20 border-red-500',
                  green: isSelected ? 'bg-green-500 border-green-400' : 'bg-green-500/20 border-green-500',
                };

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                      ${colors[cat.color as keyof typeof colors]}
                      ${isSelected ? 'text-white shadow-lg' : 'text-gray-300 hover:bg-opacity-30'}
                    `}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-white font-semibold mb-3">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-500 mt-2">{title.length}/200</div>
          </div>

          {/* 내용 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-white font-semibold mb-3">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={12}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-2">{content.length}자</div>
          </div>

          {/* 위치 첨부 */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-white font-semibold">위치 정보 (선택)</label>
              {!locationLat && (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>위치 가져오는 중...</span>
                    </>
                  ) : (
                    <>
                      <Locate className="w-4 h-4" />
                      <span>현재 위치 가져오기</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {locationLat && locationLng ? (
              <div className="bg-gray-700 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">위치 정보 첨부됨</span>
                    </div>
                    <p className="text-gray-300 text-sm">{locationName}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      위도: {locationLat.toFixed(6)}, 경도: {locationLng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeLocation}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    제거
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                위치 정보를 첨부하면 지도에 마커로 표시됩니다. (위험 제보, 쉼터 정보 등에 유용)
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? '작성 중...' : '게시글 작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
