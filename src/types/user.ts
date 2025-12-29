export type SeasonMode = 'AUTO' | 'SUMMER' | 'WINTER';

export interface UserSettings {
  preferShade: boolean;
  avoidHeat: boolean;
  showShelters: boolean;
  maxDetourPercent: number;  // 0-50
  seasonMode: SeasonMode;
  avoidBlackIce: boolean;
  nickname?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  nickname: string;
  role: string;
  preferShade: boolean;
  avoidHeat: boolean;
  showShelters: boolean;
  maxDetourPercent: number;
  seasonMode: SeasonMode;
  avoidBlackIce: boolean;
  createdAt: string;
}

export interface UserStats {
  totalRoutes: number;
  favoriteRoutes: number;
  totalDistance: number;
  avgShadeRatio: number;
  avgHeatExposure: number;
  totalRidingTime: number;
  heatAvoided: number;
  sheltersUsed: number;
  totalPosts: number;
  totalLikes: number;
  level: string;
  levelProgress: number;
}
