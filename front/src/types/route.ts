export interface RouteRequest {
  routeName: string;
  startLat: number;
  startLng: number;
  startAddress?: string;
  endLat: number;
  endLng: number;
  endAddress?: string;
  routeType: 'SHORTEST' | 'SHADE_OPTIMIZED' | 'SHELTER_OPTIMIZED';
}

export interface RouteResponse {
  id: number;
  routeName: string;
  startLat: number;
  startLng: number;
  startAddress?: string;
  endLat: number;
  endLng: number;
  endAddress?: string;
  pathGeoJson: string;
  distance: number;
  estimatedTime: number;
  shadeRatio: number;
  heatExposure: number;
  shelterCount: number;
  routeType: 'SHORTEST' | 'SHADE_OPTIMIZED' | 'SHELTER_OPTIMIZED';
  isFavorite: boolean;
  createdAt: string;
}
