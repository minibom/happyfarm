
import type { TierInfo } from '@/types';

// Tier definitions and related logic
export interface TierDetail {
  name: string;
  icon: string;
  colorClass: string; // Tailwind CSS classes for background and text
  levelStart: number;
  xpBoostPercent: number; // e.g., 0.05 for 5%
  sellPriceBoostPercent: number;
  growthTimeReductionPercent: number;
}

export const TIER_DATA: TierDetail[] = [
  // Tier 1-5: Early Game Progression
  { name: "Nông Dân Tập Sự",        icon: "🌱", colorClass: "bg-green-100 text-green-800 border-green-300",   levelStart: 1,  xpBoostPercent: 0,    sellPriceBoostPercent: 0,    growthTimeReductionPercent: 0 },
  { name: "Chủ Vườn Chăm Chỉ",      icon: "🧑‍🌾", colorClass: "bg-lime-100 text-lime-800 border-lime-300",    levelStart: 11, xpBoostPercent: 0.02, sellPriceBoostPercent: 0.01, growthTimeReductionPercent: 0.01 },
  { name: "Nhà Trồng Trọt Khéo Léo", icon: "🌿", colorClass: "bg-teal-100 text-teal-800 border-teal-300",    levelStart: 21, xpBoostPercent: 0.04, sellPriceBoostPercent: 0.02, growthTimeReductionPercent: 0.02 },
  { name: "Chuyên Gia Mùa Vụ",      icon: "🌾", colorClass: "bg-yellow-100 text-yellow-800 border-yellow-300", levelStart: 31, xpBoostPercent: 0.06, sellPriceBoostPercent: 0.03, growthTimeReductionPercent: 0.03 },
  { name: "Bậc Thầy Nông Sản",      icon: "🏆", colorClass: "bg-amber-100 text-amber-800 border-amber-300",  levelStart: 41, xpBoostPercent: 0.08, sellPriceBoostPercent: 0.04, growthTimeReductionPercent: 0.04 },
  // Tier 6-10: Mid Game Advancement
  { name: "Lão Nông Uyên Bác",      icon: "🦉", colorClass: "bg-orange-100 text-orange-800 border-orange-300", levelStart: 51, xpBoostPercent: 0.10, sellPriceBoostPercent: 0.05, growthTimeReductionPercent: 0.05 },
  { name: "Phú Nông Giàu Có",        icon: "💰", colorClass: "bg-red-100 text-red-800 border-red-300",       levelStart: 61, xpBoostPercent: 0.12, sellPriceBoostPercent: 0.06, growthTimeReductionPercent: 0.06 },
  { name: "Hoàng Gia Nông Nghiệp",   icon: "👑", colorClass: "bg-purple-100 text-purple-800 border-purple-300", levelStart: 71, xpBoostPercent: 0.15, sellPriceBoostPercent: 0.07, growthTimeReductionPercent: 0.07 },
  { name: "Thần Nông Tái Thế",      icon: "✨", colorClass: "bg-pink-100 text-pink-800 border-pink-300",     levelStart: 81, xpBoostPercent: 0.18, sellPriceBoostPercent: 0.08, growthTimeReductionPercent: 0.08 },
  { name: "Huyền Thoại Đất Đai",    icon: "🌟", colorClass: "bg-indigo-100 text-indigo-800 border-indigo-300", levelStart: 91, xpBoostPercent: 0.20, sellPriceBoostPercent: 0.10, growthTimeReductionPercent: 0.10 },
  // Tier 11-15: Late Game Mastery
  { name: "Nông Trại Tinh Tú",       icon: "💠", colorClass: "bg-sky-200 text-sky-900 border-sky-400",     levelStart: 101, xpBoostPercent: 0.22, sellPriceBoostPercent: 0.11, growthTimeReductionPercent: 0.11 },
  { name: "Vườn Địa Đàng",          icon: "⚜️", colorClass: "bg-cyan-200 text-cyan-900 border-cyan-400",    levelStart: 111, xpBoostPercent: 0.24, sellPriceBoostPercent: 0.12, growthTimeReductionPercent: 0.12 },
  { name: "Canh Tác Vũ Trụ",        icon: "🔱", colorClass: "bg-emerald-200 text-emerald-900 border-emerald-400", levelStart: 121, xpBoostPercent: 0.26, sellPriceBoostPercent: 0.13, growthTimeReductionPercent: 0.13 },
  { name: "Thần Nông Giáng Thế",    icon: "💎", colorClass: "bg-fuchsia-200 text-fuchsia-900 border-fuchsia-400", levelStart: 131, xpBoostPercent: 0.28, sellPriceBoostPercent: 0.14, growthTimeReductionPercent: 0.14 },
  { name: "Chúa Tể Đất Đai",       icon: "🌠", colorClass: "bg-rose-200 text-rose-900 border-rose-400",     levelStart: 141, xpBoostPercent: 0.30, sellPriceBoostPercent: 0.15, growthTimeReductionPercent: 0.15 },
  // Tier 16-20: Endgame Prestige
  { name: "Nông Nghiệp Tinh Hà",    icon: "🌌", colorClass: "bg-green-300 text-green-900 border-green-500",  levelStart: 151, xpBoostPercent: 0.32, sellPriceBoostPercent: 0.16, growthTimeReductionPercent: 0.16 },
  { name: "Người Gieo Mầm Vũ Trụ",  icon: "🪐", colorClass: "bg-lime-300 text-lime-900 border-lime-500",   levelStart: 161, xpBoostPercent: 0.34, sellPriceBoostPercent: 0.17, growthTimeReductionPercent: 0.17 },
  { name: "Huyền Thoại Nông Trang", icon: "🌍", colorClass: "bg-teal-300 text-teal-900 border-teal-500",    levelStart: 171, xpBoostPercent: 0.36, sellPriceBoostPercent: 0.18, growthTimeReductionPercent: 0.18 },
  { name: "Đỉnh Cao Canh Tác",      icon: "🌑", colorClass: "bg-yellow-300 text-yellow-900 border-yellow-500", levelStart: 181, xpBoostPercent: 0.38, sellPriceBoostPercent: 0.19, growthTimeReductionPercent: 0.19 },
  { name: "Đế Vương Nông Nghiệp",   icon: "🌕", colorClass: "bg-amber-300 text-amber-900 border-amber-500",  levelStart: 191, xpBoostPercent: 0.40, sellPriceBoostPercent: 0.20, growthTimeReductionPercent: 0.20 },
];

export const getPlayerTierInfo = (level: number): TierInfo => {
  let tierIndex = TIER_DATA.findIndex(tier => level < tier.levelStart && tier.levelStart > 1); // Ensure levelStart > 1 for findIndex logic
  
  if (level === 1 && TIER_DATA[0].levelStart === 1) {
    tierIndex = 0;
  } else if (tierIndex === -1) { // Level is beyond the start of the last defined tier or equals it
    tierIndex = TIER_DATA.length -1;
  } else if (tierIndex > 0) {
    tierIndex -=1; // Use the tier whose range the level falls into
  } else {
     tierIndex = 0; // Default to first tier if level is very low (should be caught by levelStart > 1 condition)
  }
  
  const currentTierData = TIER_DATA[tierIndex];
  const nextTierData = tierIndex + 1 < TIER_DATA.length ? TIER_DATA[tierIndex + 1] : undefined;

  return {
    tier: tierIndex + 1,
    tierName: currentTierData.name,
    icon: currentTierData.icon,
    colorClass: currentTierData.colorClass, // This is used by Badge directly
    nextTierLevel: nextTierData?.levelStart,
    xpBoostPercent: currentTierData.xpBoostPercent,
    sellPriceBoostPercent: currentTierData.sellPriceBoostPercent,
    growthTimeReductionPercent: currentTierData.growthTimeReductionPercent,
  };
};
