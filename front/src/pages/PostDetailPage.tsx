import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityAPI, type CommunityPostResponse } from '../api/community';
import { useAuthStore } from '../store/authStore';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    Eye,
    ThumbsUp,
    MessageSquare,
    Send,
    Trash2,
    PenSquare,
    AlertTriangle,
    Lightbulb,
    HelpCircle,
    Newspaper,
    Loader2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Leaflet 아이콘 설정
const markerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function PostDetailPage() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [post, setPost] = useState<CommunityPostResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (postId) {
            loadPost(Number(postId));
        }
    }, [postId]);

    const loadPost = async (id: number) => {
        try {
            setLoading(true);
            const data = await communityAPI.getPostById(id);
            setPost(data);
        } catch (err) {
            console.error('게시글 로딩 실패:', err);
            setError('게시글을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;
        try {
            await communityAPI.likePost(post.id);
            // 좋아요 후 데이터 갱신
            loadPost(post.id);
        } catch (err) {
            console.error('좋아요 실패:', err);
            alert('좋아요 처리에 실패했습니다.');
        }
    };

    const handleDelete = async () => {
        if (!post) return;
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

        try {
            await communityAPI.deletePost(post.id);
            navigate('/community');
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('게시글 삭제에 실패했습니다.');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !commentContent.trim()) return;

        try {
            setSubmittingComment(true);
            await communityAPI.addComment(post.id, { content: commentContent });
            setCommentContent('');
            loadPost(post.id); // 댓글 목록 갱신을 위해 재조회
        } catch (err) {
            console.error('댓글 작성 실패:', err);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ROUTE_TIP': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
            case 'SHELTER_INFO': return <MapPin className="w-5 h-5 text-green-400" />;
            case 'WEATHER_ALERT': return <AlertTriangle className="w-5 h-5 text-red-400" />;
            case 'QUESTION': return <HelpCircle className="w-5 h-5 text-blue-400" />;
            default: return <Newspaper className="w-5 h-5 text-gray-400" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'GENERAL': '일반',
            'ROUTE_TIP': '꿀팁',
            'SHELTER_INFO': '쉼터정보',
            'WEATHER_ALERT': '위험제보',
            'QUESTION': '질문',
        };
        return labels[category] || '기타';
    };

    // Tailwind 스타일 정의
    const styles = {
        container: "min-h-screen bg-gray-900 pb-20",
        header: "bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10",
        headerInner: "max-w-4xl mx-auto flex items-center justify-between", // Adjusted to match original
        backButton: "flex items-center gap-2 text-gray-300 hover:text-white transition-colors", // Adjusted to match original
        deleteButton: "flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/20", // Adjusted to match original
        contentArea: "max-w-4xl mx-auto px-4 py-8 space-y-6", // Renamed from 'content' to avoid conflict and match original usage
        postArticle: "bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700", // Renamed from 'postCard'
        postCategoryBadge: "flex items-center gap-2 mb-4", // Wrapper for category badge and date
        categoryBadgeInner: "bg-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 text-white",
        postDate: "text-gray-500 text-sm",
        postTitle: "text-2xl md:text-3xl font-bold text-white mb-6 leading-tight",
        postMetaWrapper: "flex items-center justify-between border-b border-gray-700 pb-6 mb-6",
        authorInfo: "flex items-center gap-3",
        avatar: "w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold",
        authorName: "text-white font-medium",
        postStats: "text-xs text-gray-400 flex items-center gap-2",
        likeButton: "flex items-col md:flex-row items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-purple-900/30 text-purple-400 rounded-xl transition-all border border-gray-600 hover:border-purple-500",
        postContent: "prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed", // Renamed from 'postBody'
        mapWrapper: "mt-8 bg-gray-900 rounded-xl overflow-hidden border border-gray-700", // mapContainer style
        mapHeader: "p-3 bg-gray-800 border-b border-gray-700 flex items-center gap-2 text-sm text-green-400",
        mapContainer: "h-64 relative z-0",
        commentsSection: "bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700", // Renamed from 'commentsSection'
        commentsTitle: "flex items-center gap-2 mb-6", // Wrapper for comments title
        commentsTitleText: "text-xl font-bold text-white",
        commentForm: "mb-8 flex gap-2",
        commentInput: "flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50",
        commentSubmitBtn: "bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        commentList: "space-y-4",
        commentItem: "bg-gray-700/30 rounded-xl p-4 border border-gray-700",
        commentItemHeader: "flex items-center justify-between mb-2",
        commentAuthorInfo: "flex items-center gap-2",
        commentAuthorName: "font-semibold text-gray-200",
        commentAuthorBadge: "text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full",
        commentDate: "text-xs text-gray-500",
        commentBody: "text-gray-300 text-sm",
        emptyComments: "text-center text-gray-500 py-4",
        loading: "min-h-screen bg-gray-900 flex items-center justify-center text-white",
        error: "min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4",
        errorIcon: "w-12 h-12 text-red-500 mb-4",
        errorTitle: "text-xl font-bold mb-2",
        errorDesc: "text-gray-400 mb-6",
        backToListBtn: "px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600",
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className={styles.error}>
                <AlertTriangle className={styles.errorIcon} />
                <h2 className={styles.errorTitle}>오류 발생</h2>
                <p className={styles.errorDesc}>{error || '게시글을 찾을 수 없습니다.'}</p>
                <button
                    onClick={() => navigate('/community')}
                    className={styles.backToListBtn}
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    const isAuthor = user?.username === post.authorUsername;

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <button
                        onClick={() => navigate('/community')}
                        className={styles.backButton}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>목록으로</span>
                    </button>

                    {isAuthor && (
                        <button
                            onClick={handleDelete}
                            className={styles.deleteButton}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>삭제</span>
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.contentArea}>
                {/* 게시글 본문 */}
                <article className={styles.postArticle}>
                    <div className={styles.postCategoryBadge}>
                        <span className={styles.categoryBadgeInner}>
                            {getCategoryIcon(post.category)}
                            {getCategoryLabel(post.category)}
                        </span>
                        <span className={styles.postDate}>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className={styles.postTitle}>
                        {post.title}
                    </h1>

                    <div className={styles.postMetaWrapper}>
                        <div className={styles.authorInfo}>
                            <div className={styles.avatar}>
                                {post.authorNickname?.[0] || post.authorUsername[0]}
                            </div>
                            <div>
                                <div className={styles.authorName}>
                                    {post.authorNickname || post.authorUsername}
                                </div>
                                <div className={styles.postStats}>
                                    <span>조회 {post.viewCount}</span>
                                    <span>•</span>
                                    <span>좋아요 {post.likeCount}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLike}
                            className={styles.likeButton}
                        >
                            <ThumbsUp className="w-5 h-5" />
                            <span className="font-semibold">좋아요</span>
                        </button>
                    </div>

                    <div className={styles.postContent}>
                        {post.content}
                    </div>

                    {/* 지도 (위치 정보가 있는 경우) */}
                    {post.locationLat && post.locationLng && (
                        <div className={styles.mapWrapper}>
                            <div className={styles.mapHeader}>
                                <MapPin className="w-4 h-4" />
                                <span>{post.locationName || '위치 정보'}</span>
                            </div>
                            <div className={styles.mapContainer}>
                                <MapContainer
                                    center={[post.locationLat, post.locationLng]}
                                    zoom={15}
                                    className="h-full w-full" // This specific className is for Leaflet's internal sizing, often kept as is.
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <Marker
                                        position={[post.locationLat, post.locationLng]}
                                        icon={markerIcon}
                                    >
                                        <Popup>{post.locationName}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </article>

                {/* 댓글 섹션 */}
                <section className={styles.commentsSection}>
                    <div className={styles.commentsTitle}>
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <h2 className={styles.commentsTitleText}>
                            댓글 {post.comments?.length || post.commentCount}
                        </h2>
                    </div>

                    {/* 댓글 작성 폼 */}
                    <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                        <input
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder={user ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
                            disabled={!user || submittingComment}
                            className={styles.commentInput}
                        />
                        <button
                            type="submit"
                            disabled={!user || !commentContent.trim() || submittingComment}
                            className={styles.commentSubmitBtn}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>

                    {/* 댓글 목록 */}
                    <div className={styles.commentList}>
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className={styles.commentItem}>
                                    <div className={styles.commentItemHeader}>
                                        <div className={styles.commentAuthorInfo}>
                                            <span className={styles.commentAuthorName}>
                                                {comment.authorNickname || comment.authorUsername}
                                            </span>
                                            {post.authorUsername === comment.authorUsername && (
                                                <span className={styles.commentAuthorBadge}>
                                                    작성자
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.commentDate}>
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={styles.commentBody}>{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className={styles.emptyComments}>
                                첫 번째 댓글을 남겨보세요!
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

