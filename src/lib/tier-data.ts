
import type { TierInfo } from '@/types';

// Tier definitions and related logic
export interface TierDetail {
  name: string;
  icon: string;
  colorClass: string;
  levelStart: number;
  xpBoostPercent: number;
  sellPriceBoostPercent: number;
  growthTimeReductionPercent: number;
}

export const TIER_DATA: TierDetail[] = [
  { name: "Nông Dân Tập Sự",        icon: "🌱", colorClass: "bg-green-500 hover:bg-green-600 text-green-50", levelStart: 1, xpBoostPercent: 0, sellPriceBoostPercent: 0, growthTimeReductionPercent: 0 },
  { name: "Chủ Vườn Chăm Chỉ",      icon: "🧑‍🌾", colorClass: "bg-lime-500 hover:bg-lime-600 text-lime-900", levelStart: 11, xpBoostPercent: 0.02, sellPriceBoostPercent: 0.01, growthTimeReductionPercent: 0.01 },
  { name: "Nhà Trồng Trọt Khéo Léo", icon: "🌿", colorClass: "bg-teal-500 hover:bg-teal-600 text-teal-50", levelStart: 21, xpBoostPercent: 0.04, sellPriceBoostPercent: 0.02, growthTimeReductionPercent: 0.02 },
  { name: "Chuyên Gia Mùa Vụ",      icon: "🌾", colorClass: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900", levelStart: 31, xpBoostPercent: 0.06, sellPriceBoostPercent: 0.03, growthTimeReductionPercent: 0.03 },
  { name: "Bậc Thầy Nông Sản",      icon: "🏆", colorClass: "bg-amber-400 hover:bg-amber-500 text-amber-900", levelStart: 41, xpBoostPercent: 0.08, sellPriceBoostPercent: 0.04, growthTimeReductionPercent: 0.04 },
  { name: "Lão Nông Uyên Bác",      icon: "🦉", colorClass: "bg-orange-500 hover:bg-orange-600 text-orange-50", levelStart: 51, xpBoostPercent: 0.10, sellPriceBoostPercent: 0.05, growthTimeReductionPercent: 0.05 },
  { name: "Phú Nông Giàu Có",        icon: "💰", colorClass: "bg-red-500 hover:bg-red-600 text-red-50", levelStart: 61, xpBoostPercent: 0.12, sellPriceBoostPercent: 0.06, growthTimeReductionPercent: 0.06 },
  { name: "Hoàng Gia Nông Nghiệp",   icon: "👑", colorClass: "bg-purple-500 hover:bg-purple-600 text-purple-50", levelStart: 71, xpBoostPercent: 0.15, sellPriceBoostPercent: 0.07, growthTimeReductionPercent: 0.07 },
  { name: "Thần Nông Tái Thế",      icon: "✨", colorClass: "bg-pink-500 hover:bg-pink-600 text-pink-50", levelStart: 81, xpBoostPercent: 0.18, sellPriceBoostPercent: 0.08, growthTimeReductionPercent: 0.08 },
  { name: "Huyền Thoại Đất Đai",    icon: "🌟", colorClass: "bg-indigo-500 hover:bg-indigo-600 text-indigo-50", levelStart: 91, xpBoostPercent: 0.20, sellPriceBoostPercent: 0.10, growthTimeReductionPercent: 0.10 },
];

export const getPlayerTierInfo = (level: number): TierInfo => {
  const tierIndex = Math.min(Math.floor((level - 1) / 10), TIER_DATA.length - 1);
  const currentTierData = TIER_DATA[tierIndex];
  const nextTierData = tierIndex + 1 < TIER_DATA.length ? TIER_DATA[tierIndex + 1] : undefined;

  return {
    tier: tierIndex + 1,
    tierName: currentTierData.name,
    icon: currentTierData.icon,
    colorClass: currentTierData.colorClass,
    nextTierLevel: nextTierData?.levelStart,
    xpBoostPercent: currentTierData.xpBoostPercent,
    sellPriceBoostPercent: currentTierData.sellPriceBoostPercent,
    growthTimeReductionPercent: currentTierData.growthTimeReductionPercent,
  };
};
