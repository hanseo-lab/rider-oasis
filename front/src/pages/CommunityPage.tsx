import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI, type CommunityPostResponse } from '../api/community';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Search,
  PenSquare,
  MapPin,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Newspaper,
  ChevronRight,
} from 'lucide-react';

type CategoryType = 'ALL' | 'ROUTE_TIP' | 'SHELTER_INFO' | 'WEATHER_ALERT' | 'QUESTION' | 'GENERAL';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPostResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const categories = [
    { value: 'ALL' as CategoryType, label: '전체', icon: Newspaper, color: 'gray' },
    { value: 'ROUTE_TIP' as CategoryType, label: '꿀팁', icon: Lightbulb, color: 'yellow' },
    { value: 'QUESTION' as CategoryType, label: '질문', icon: HelpCircle, color: 'blue' },
    { value: 'WEATHER_ALERT' as CategoryType, label: '위험제보', icon: AlertTriangle, color: 'red' },
    { value: 'SHELTER_INFO' as CategoryType, label: '쉼터정보', icon: MapPin, color: 'green' },
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      if (selectedCategory === 'ALL') {
        response = await communityAPI.getAllPosts(page, 20);
      } else {
        response = await communityAPI.getPostsByCategory(selectedCategory, page, 20);
      }

      setPosts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await communityAPI.searchPosts(searchKeyword, 0, 20);
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setPage(0);
    } catch (error) {
      console.error('검색 실패:', error);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    if (!cat) return null;

    const Icon = cat.icon;
    const colors = {
      gray: 'bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500',
      yellow: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-400 dark:border-yellow-500',
      blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-500',
      red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-400 dark:border-red-500',
      green: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-400 dark:border-green-500',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${colors[cat.color as keyof typeof colors]}`}>
        <Icon className="w-3 h-3" />
        {cat.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  // Tailwind 스타일 정의
  const styles = {
    container: "min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300",
    header: "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-purple-500/30 p-6 transition-colors duration-300",
    headerInner: "max-w-7xl mx-auto flex items-center justify-between",
    headerTitleContainer: "",
    headerTitle: "text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent",
    headerSubtitle: "text-gray-500 dark:text-gray-400 text-sm mt-1",
    writeButton: "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 transition-all font-semibold shadow-lg",

    mainContentArea: "max-w-7xl mx-auto px-4 py-6",

    searchSection: "mb-6",
    searchBar: "flex gap-2",
    searchInputWrapper: "flex-1 relative",
    searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400",
    searchInput: "w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors",
    searchButton: "px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold",

    categoryTabs: "flex gap-2 mb-6 overflow-x-auto pb-2",
    categoryButton: (isSelected: boolean) => `
      flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
      ${isSelected
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white shadow-lg'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }
    `,

    loadingState: "text-center py-20",
    loadingSpinner: "inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin",
    loadingText: "text-gray-500 dark:text-gray-400 mt-4",

    noPostsState: "text-center py-20",
    noPostsIcon: "w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4",
    noPostsText: "text-gray-500 dark:text-gray-400",

    postGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    postCard: "block bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg dark:hover:bg-gray-750 transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 h-full",
    postCardHeader: "flex items-start justify-between gap-4",
    postCardContent: "flex-1 min-w-0",
    postCardTitle: "text-lg font-bold text-gray-900 dark:text-white mb-2 truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors",
    postCardPreview: "text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2",
    postCardLocation: "flex items-center gap-1 text-green-600 dark:text-green-400 text-xs mb-3",
    postCardMeta: "flex items-center gap-4 text-xs text-gray-500",
    postCardAuthor: "font-medium text-gray-700 dark:text-gray-400",
    postCardMetaItem: "flex items-center gap-1",
    postCardArrow: "w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0",

    paginationContainer: "flex justify-center gap-2 mt-8",
    paginationButton: "px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    paginationPageGroup: "flex items-center gap-2",
    paginationNumButton: (isActive: boolean) => `
      w-10 h-10 rounded-lg font-semibold transition-colors flex items-center justify-center
      ${isActive
        ? 'bg-purple-600 dark:bg-purple-500 text-white'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }
    `,
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className={styles.headerTitle}>
                커뮤니티
              </h1>
              <p className={styles.headerSubtitle}>라이더들과 정보를 공유하세요</p>
            </div>

            <Link
              to="/community/create"
              className={styles.writeButton}
            >
              <PenSquare className="w-5 h-5" />
              글쓰기
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.mainContentArea}>
        {/* 검색창 */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="게시글 검색..."
                className={styles.searchInput}
              />
            </div>
            <button
              onClick={handleSearch}
              className={styles.searchButton}
            >
              검색
            </button>
          </div>
        </div>

        {/* 에러 배너 */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 카테고리 탭 */}
        <div className={styles.categoryTabs}>
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.value;

            return (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setPage(0);
                }}
                className={styles.categoryButton(isSelected)}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>게시글을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.noPostsState}>
            <MessageSquare className={styles.noPostsIcon} />
            <p className={styles.noPostsText}>게시글이 없습니다.</p>
          </div>
        ) : (
          <div className={styles.postGrid}>
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/community/posts/${post.id}`}
                className={styles.postCard}
              >
                <div className={styles.postCardHeader}>
                  <div className={styles.postCardContent}>
                    {/* 카테고리 배지 */}
                    <div className="mb-2">{getCategoryBadge(post.category)}</div>

                    {/* 제목 */}
                    <h3 className={styles.postCardTitle}>
                      {post.title}
                    </h3>

                    {/* 내용 미리보기 */}
                    <p className={styles.postCardPreview}>{post.content}</p>

                    {/* 위치 정보 */}
                    {post.locationName && (
                      <div className={styles.postCardLocation}>
                        <MapPin className="w-3 h-3" />
                        <span>{post.locationName}</span>
                      </div>
                    )}

                    {/* 메타 정보 */}
                    <div className={styles.postCardMeta}>
                      <span className={styles.postCardAuthor}>{post.authorNickname || post.authorUsername}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <div className={styles.postCardMetaItem}>
                        <Eye className="w-3 h-3" />
                        {post.viewCount}
                      </div>
                      <div className={styles.postCardMetaItem}>
                        <ThumbsUp className="w-3 h-3" />
                        {post.likeCount}
                      </div>
                      <div className={styles.postCardMetaItem}>
                        <MessageSquare className="w-3 h-3" />
                        {post.commentCount}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={styles.postCardArrow} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={styles.paginationButton}
            >
              이전
            </button>

            <div className={styles.paginationPageGroup}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page < 3 ? i : page - 2 + i;
                if (pageNum >= totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={styles.paginationNumButton(page === pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={styles.paginationButton}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
