/**
 * 계절 판단 유틸리티
 * 현재 월을 기준으로 여름/겨울을 판단합니다.
 */

export type SeasonMode = 'SUMMER' | 'WINTER' | 'AUTO';

/**
 * 현재 월을 기준으로 계절 모드를 반환합니다.
 * @returns 'SUMMER' (6-9월) 또는 'WINTER' (10-5월)
 */
export function getCurrentSeason(): 'SUMMER' | 'WINTER' {
    const month = new Date().getMonth() + 1; // 1-12
    return (month >= 6 && month <= 9) ? 'SUMMER' : 'WINTER';
}

/**
 * SeasonMode를 실제 계절로 변환합니다.
 * AUTO 모드인 경우 현재 월을 기준으로 판단합니다.
 * @param mode SeasonMode ('AUTO', 'SUMMER', 'WINTER')
 * @returns 'SUMMER' 또는 'WINTER'
 */
export function resolveSeasonMode(mode: SeasonMode): 'SUMMER' | 'WINTER' {
    if (mode === 'AUTO') {
        return getCurrentSeason();
    }
    return mode;
}

/**
 * 계절별 아이콘 이모지를 반환합니다.
 */
export function getSeasonEmoji(season: 'SUMMER' | 'WINTER'): string {
    return season === 'SUMMER' ? '☀️' : '❄️';
}

/**
 * 계절별 색상 클래스를 반환합니다.
 */
export function getSeasonColorClass(season: 'SUMMER' | 'WINTER'): string {
    return season === 'SUMMER' ? 'text-orange-400' : 'text-blue-300';
}
