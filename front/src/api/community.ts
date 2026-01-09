import api from './axios';


export interface CommunityPostRequest {
  title: string;
  content: string;
  category: 'GENERAL' | 'ROUTE_TIP' | 'SHELTER_INFO' | 'WEATHER_ALERT' | 'QUESTION';
  locationLat?: number;
  locationLng?: number;
  locationName?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  authorUsername: string;
  authorNickname: string;
  createdAt: string;
}

export interface CommunityPostResponse {
  id: number;
  title: string;
  content: string;
  category: string;
  authorUsername: string;
  authorNickname: string;
  locationLat?: number;
  locationLng?: number;
  locationName?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  comments?: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const communityAPI = {
  // 게시글 목록 조회
  getAllPosts: async (page: number = 0, size: number = 20): Promise<PageResponse<CommunityPostResponse>> => {
    const response = await api.get('/community/posts', {
      params: { page, size },
    });
    return response.data.data;
  },

  // 카테고리별 게시글 조회
  getPostsByCategory: async (
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<CommunityPostResponse>> => {
    const response = await api.get(`/community/posts/category/${category}`, {
      params: { page, size },
    });
    return response.data.data;
  },

  // 게시글 상세 조회
  getPostById: async (id: number): Promise<CommunityPostResponse> => {
    const response = await api.get(`/community/posts/${id}`);
    return response.data.data;
  },

  // 게시글 작성
  createPost: async (data: CommunityPostRequest): Promise<CommunityPostResponse> => {
    const response = await api.post('/community/posts', data);
    return response.data.data;
  },

  // 게시글 수정
  updatePost: async (id: number, data: CommunityPostRequest): Promise<CommunityPostResponse> => {
    const response = await api.put(`/community/posts/${id}`, data);
    return response.data.data;
  },

  // 게시글 삭제
  deletePost: async (id: number): Promise<void> => {
    await api.delete(`/community/posts/${id}`);
  },

  // 좋아요
  likePost: async (id: number): Promise<void> => {
    await api.post(`/community/posts/${id}/like`);
  },

  // 댓글 작성
  addComment: async (postId: number, data: CommentRequest): Promise<void> => {
    await api.post(`/community/posts/${postId}/comments`, data);
  },

  // 게시글 검색
  searchPosts: async (
    keyword: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<CommunityPostResponse>> => {
    const response = await api.get('/community/posts/search', {
      params: { keyword, page, size },
    });
    return response.data.data;
  },
};
