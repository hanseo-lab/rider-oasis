import api from './axios';
import type { UserInfo, UserSettings, UserStats } from '../types/user';
import type { RouteResponse } from '../types/route';

export const userAPI = {
  getMyInfo: async (): Promise<UserInfo> => {
    const response = await api.get<{ success: boolean; data: UserInfo }>('/user/me');
    return response.data.data;
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<UserInfo> => {
    const response = await api.put<{ success: boolean; data: UserInfo }>('/user/settings', settings);
    return response.data.data;
  },

  getMyStats: async (): Promise<UserStats> => {
    const response = await api.get<{ success: boolean; data: UserStats }>('/user/stats');
    return response.data.data;
  },

  getFavoriteRoutes: async (): Promise<RouteResponse[]> => {
    const response = await api.get<{ success: boolean; data: RouteResponse[] }>('/user/favorite-routes');
    return response.data.data;
  },
};
