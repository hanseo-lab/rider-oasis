import api from './axios';
import type { RouteRequest, RouteResponse } from '../types/route';

export type { RouteRequest, RouteResponse };

export const routesAPI = {
  createRoute: async (data: RouteRequest): Promise<RouteResponse> => {
    const response = await api.post<{ success: boolean; data: RouteResponse }>('/routes', data);
    return response.data.data;
  },

  getMyRoutes: async (): Promise<RouteResponse[]> => {
    const response = await api.get<{ success: boolean; data: RouteResponse[] }>('/routes');
    return response.data.data;
  },

  getRouteById: async (id: number): Promise<RouteResponse> => {
    const response = await api.get<{ success: boolean; data: RouteResponse }>(`/routes/${id}`);
    return response.data.data;
  },

  deleteRoute: async (id: number): Promise<void> => {
    await api.delete(`/routes/${id}`);
  },

  toggleFavorite: async (id: number): Promise<RouteResponse> => {
    const response = await api.patch<{ success: boolean; data: RouteResponse }>(`/routes/${id}/favorite`);
    return response.data.data;
  },
};
