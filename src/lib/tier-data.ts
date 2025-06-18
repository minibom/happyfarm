
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
  // Existing Tiers 1-10
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

  // New Tiers 11-20
  { name: "Bậc Thầy Nông Trại I",   icon: "💠", colorClass: "bg-sky-500 hover:bg-sky-600 text-sky-50",     levelStart: 101, xpBoostPercent: 0.22, sellPriceBoostPercent: 0.11, growthTimeReductionPercent: 0.11 },
  { name: "Bậc Thầy Nông Trại II",  icon: "⚜️", colorClass: "bg-cyan-500 hover:bg-cyan-600 text-cyan-50",    levelStart: 111, xpBoostPercent: 0.24, sellPriceBoostPercent: 0.12, growthTimeReductionPercent: 0.12 },
  { name: "Bậc Thầy Nông Trại III", icon: "🔱", colorClass: "bg-emerald-500 hover:bg-emerald-600 text-emerald-50", levelStart: 121, xpBoostPercent: 0.26, sellPriceBoostPercent: 0.13, growthTimeReductionPercent: 0.13 },
  { name: "Bậc Thầy Nông Trại IV",  icon: "💎", colorClass: "bg-fuchsia-500 hover:bg-fuchsia-600 text-fuchsia-50", levelStart: 131, xpBoostPercent: 0.28, sellPriceBoostPercent: 0.14, growthTimeReductionPercent: 0.14 },
  { name: "Bậc Thầy Nông Trại V",   icon: "🌠", colorClass: "bg-rose-500 hover:bg-rose-600 text-rose-50",     levelStart: 141, xpBoostPercent: 0.30, sellPriceBoostPercent: 0.15, growthTimeReductionPercent: 0.15 },
  { name: "Bậc Thầy Nông Trại VI",  icon: "🌌", colorClass: "bg-green-600 hover:bg-green-700 text-green-50",  levelStart: 151, xpBoostPercent: 0.32, sellPriceBoostPercent: 0.16, growthTimeReductionPercent: 0.16 },
  { name: "Bậc Thầy Nông Trại VII", icon: "🪐", colorClass: "bg-lime-600 hover:bg-lime-700 text-lime-900",   levelStart: 161, xpBoostPercent: 0.34, sellPriceBoostPercent: 0.17, growthTimeReductionPercent: 0.17 },
  { name: "Bậc Thầy Nông Trại VIII",icon: "🌍", colorClass: "bg-teal-600 hover:bg-teal-700 text-teal-50",    levelStart: 171, xpBoostPercent: 0.36, sellPriceBoostPercent: 0.18, growthTimeReductionPercent: 0.18 },
  { name: "Bậc Thầy Nông Trại IX",  icon: "🌑", colorClass: "bg-yellow-500 hover:bg-yellow-600 text-yellow-900", levelStart: 181, xpBoostPercent: 0.38, sellPriceBoostPercent: 0.19, growthTimeReductionPercent: 0.19 },
  { name: "Bậc Thầy Nông Trại X",   icon: "🌕", colorClass: "bg-amber-500 hover:bg-amber-600 text-amber-900",  levelStart: 191, xpBoostPercent: 0.40, sellPriceBoostPercent: 0.20, growthTimeReductionPercent: 0.20 },
  // Pattern continues for Tiers 21-100. For example:
  // { name: "Đại Nông Sư I", icon: "💡", colorClass: "bg-orange-600 text-orange-50", levelStart: 201, xpBoostPercent: 0.42, sellPriceBoostPercent: 0.21, growthTimeReductionPercent: 0.21 },
  // ... up to Tier 100 / level 1000
];

export const getPlayerTierInfo = (level: number): TierInfo => {
  let tierIndex = TIER_DATA.findIndex(tier => level < tier.levelStart);
  if (tierIndex === -1) { // Level is beyond the start of the last defined tier
    tierIndex = TIER_DATA.length -1;
  } else if (tierIndex > 0) {
    tierIndex -=1; // Use the tier whose range the level falls into
  } else {
     tierIndex = 0; // Default to first tier if level is very low or first tier starts at 1
  }
  
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
