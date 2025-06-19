
import type { FertilizerDetails, FertilizerId } from '@/types';

// Base stats for Tier 10 fertilizer for scaling
const T10_HYPERHARVEST_STATS = { reduction: 0.55, price: 2000 }; // Adjusted T10 base stats

export const FERTILIZER_DATA: Record<FertilizerId, FertilizerDetails> = {
  // Tier 1
  t1_basicGrow: { id: 't1_basicGrow', name: 'Phân Bón Thường', icon: '🧪', description: 'Giảm 5% thời gian sinh trưởng còn lại.', unlockTier: 1, timeReductionPercent: 0.05, price: 10 },
  t1_quickSoil: { id: 't1_quickSoil', name: 'Đất Tơi Xốp', icon: '🌱', description: 'Giảm 8% thời gian sinh trưởng còn lại.', unlockTier: 1, timeReductionPercent: 0.08, price: 15 },
  t1_speedySprout: { id: 't1_speedySprout', name: 'Mầm Ươm Nhanh', icon: '✨', description: 'Giảm 12% thời gian sinh trưởng còn lại.', unlockTier: 1, timeReductionPercent: 0.12, price: 25 },
  // Tier 2
  t2_farmBoost: { id: 't2_farmBoost', name: 'Phân Chuồng Cao Cấp', icon: '💩', description: 'Giảm 10% thời gian sinh trưởng còn lại.', unlockTier: 2, timeReductionPercent: 0.10, price: 22 },
  t2_richEarth: { id: 't2_richEarth', name: 'Đất Phù Sa', icon: '🏞️', description: 'Giảm 13% thời gian sinh trưởng còn lại.', unlockTier: 2, timeReductionPercent: 0.13, price: 33 },
  t2_harvestHelp: { id: 't2_harvestHelp', name: 'Trợ Giúp Mùa Màng', icon: '🌿', description: 'Giảm 17% thời gian sinh trưởng còn lại.', unlockTier: 2, timeReductionPercent: 0.17, price: 45 },
  // Tier 3
  t3_powerGro: { id: 't3_powerGro', name: 'Phân Siêu Lớn', icon: '💪', description: 'Giảm 15% thời gian sinh trưởng còn lại.', unlockTier: 3, timeReductionPercent: 0.15, price: 55 },
  t3_wonderSoil: { id: 't3_wonderSoil', name: 'Đất Diệu Kỳ', icon: '🌟', description: 'Giảm 18% thời gian sinh trưởng còn lại.', unlockTier: 3, timeReductionPercent: 0.18, price: 70 },
  t3_bloomBlast: { id: 't3_bloomBlast', name: 'Nở Hoa Thần Tốc', icon: '🌸', description: 'Giảm 22% thời gian sinh trưởng còn lại.', unlockTier: 3, timeReductionPercent: 0.22, price: 90 },
  // Tier 4
  t4_superFert: { id: 't4_superFert', name: 'Siêu Phân Bón', icon: '⚡', description: 'Giảm 20% thời gian sinh trưởng còn lại.', unlockTier: 4, timeReductionPercent: 0.20, price: 110 },
  t4_magicMulch: { id: 't4_magicMulch', name: 'Lớp Phủ Ma Thuật', icon: '🪄', description: 'Giảm 23% thời gian sinh trưởng còn lại.', unlockTier: 4, timeReductionPercent: 0.23, price: 135 },
  t4_rapidRoot: { id: 't4_rapidRoot', name: 'Rễ Phát Triển Nhanh', icon: '🌲', description: 'Giảm 27% thời gian sinh trưởng còn lại.', unlockTier: 4, timeReductionPercent: 0.27, price: 165 },
  // Tier 5
  t5_ultraNutrient: { id: 't5_ultraNutrient', name: 'Dinh Dưỡng Tối Ưu', icon: '🧬', description: 'Giảm 25% thời gian sinh trưởng còn lại.', unlockTier: 5, timeReductionPercent: 0.25, price: 200 },
  t5_mysticEarth: { id: 't5_mysticEarth', name: 'Đất Huyền Bí', icon: '🔮', description: 'Giảm 28% thời gian sinh trưởng còn lại.', unlockTier: 5, timeReductionPercent: 0.28, price: 240 },
  t5_instaBloom: { id: 't5_instaBloom', name: 'Kích Nở Tức Thì', icon: '💥', description: 'Giảm 32% thời gian sinh trưởng còn lại.', unlockTier: 5, timeReductionPercent: 0.32, price: 290 },
  // Tier 6
  t6_gigaGro: { id: 't6_gigaGro', name: 'Phân Giga Lớn', icon: '🏋️', description: 'Giảm 30% thời gian sinh trưởng còn lại.', unlockTier: 6, timeReductionPercent: 0.30, price: 330 },
  t6_ancientSoil: { id: 't6_ancientSoil', name: 'Đất Cổ Đại', icon: '🗿', description: 'Giảm 33% thời gian sinh trưởng còn lại.', unlockTier: 6, timeReductionPercent: 0.33, price: 380 },
  t6_timeWarpTonic: { id: 't6_timeWarpTonic', name: 'Thuốc Bẻ Cong Thời Gian', icon: '⏳', description: 'Giảm 37% thời gian sinh trưởng còn lại.', unlockTier: 6, timeReductionPercent: 0.37, price: 450 },
  // Tier 7
  t7_megaFertilizer: { id: 't7_megaFertilizer', name: 'Phân Bón Mega', icon: '💣', description: 'Giảm 35% thời gian sinh trưởng còn lại.', unlockTier: 7, timeReductionPercent: 0.35, price: 520 },
  t7_sacredGround: { id: 't7_sacredGround', name: 'Đất Thánh', icon: '🙏', description: 'Giảm 38% thời gian sinh trưởng còn lại.', unlockTier: 7, timeReductionPercent: 0.38, price: 600 },
  t7_chronosPowder: { id: 't7_chronosPowder', name: 'Bột Thời Gian Chronos', icon: '🕰️', description: 'Giảm 42% thời gian sinh trưởng còn lại.', unlockTier: 7, timeReductionPercent: 0.42, price: 700 },
  // Tier 8
  t8_cosmicCompost: { id: 't8_cosmicCompost', name: 'Phân Vũ Trụ', icon: '🌌', description: 'Giảm 40% thời gian sinh trưởng còn lại.', unlockTier: 8, timeReductionPercent: 0.40, price: 800 },
  t8_genesisSoil: { id: 't8_genesisSoil', name: 'Đất Sáng Thế', icon: '🌍', description: 'Giảm 43% thời gian sinh trưởng còn lại.', unlockTier: 8, timeReductionPercent: 0.43, price: 900 },
  t8_temporalFert: { id: 't8_temporalFert', name: 'Phân Dịch Chuyển Thời Gian', icon: '🌀', description: 'Giảm 47% thời gian sinh trưởng còn lại.', unlockTier: 8, timeReductionPercent: 0.47, price: 1050 },
  // Tier 9
  t9_divineElixir: { id: 't9_divineElixir', name: 'Tiên Dược Thần Thánh', icon: '🌠', description: 'Giảm 45% thời gian sinh trưởng còn lại.', unlockTier: 9, timeReductionPercent: 0.45, price: 1200 },
  t9_edenEssence: { id: 't9_edenEssence', name: 'Tinh Chất Vườn Địa Đàng', icon: '🏞️', description: 'Giảm 48% thời gian sinh trưởng còn lại.', unlockTier: 9, timeReductionPercent: 0.48, price: 1350 },
  t9_infinityBloom: { id: 't9_infinityBloom', name: 'Nở Rộ Vĩnh Cửu', icon: '♾️', description: 'Giảm 52% thời gian sinh trưởng còn lại.', unlockTier: 9, timeReductionPercent: 0.52, price: 1550 },
  // Tier 10
  t10_omnipotentOoze: { id: 't10_omnipotentOoze', name: 'Dịch Dưỡng Toàn Năng', icon: '💧', description: 'Giảm 50% thời gian sinh trưởng còn lại.', unlockTier: 10, timeReductionPercent: 0.50, price: 1700 },
  t10_celestialClay: { id: 't10_celestialClay', name: 'Đất Sét Thiên Giới', icon: '☁️', description: 'Giảm 55% thời gian sinh trưởng còn lại.', unlockTier: 10, timeReductionPercent: 0.55, price: 1900 },
  t10_hyperHarvest: { id: 't10_hyperHarvest', name: 'Siêu Thu Hoạch', icon: '🚀', description: 'Giảm 60% thời gian sinh trưởng còn lại.', unlockTier: 10, timeReductionPercent: T10_HYPERHARVEST_STATS.reduction, price: T10_HYPERHARVEST_STATS.price },

  // --- Fertilizers for Tiers 11-15 (Additive scaling on reduction, multiplicative on price) ---
  t11_starDust: { id: 't11_starDust', name: 'Bụi Sao', icon: '✨', description: 'Giảm thời gian đáng kể, sản phẩm của các vì sao.', unlockTier: 11, timeReductionPercent: T10_HYPERHARVEST_STATS.reduction + 0.02, price: Math.floor(T10_HYPERHARVEST_STATS.price * 1.2) },
  t12_moonEssence: { id: 't12_moonEssence', name: 'Tinh Chất Nguyệt Ảnh', icon: '🌙', description: 'Giảm thời gian mạnh mẽ, chứa đựng năng lượng mặt trăng.', unlockTier: 12, timeReductionPercent: T10_HYPERHARVEST_STATS.reduction + 0.04, price: Math.floor(T10_HYPERHARVEST_STATS.price * 1.45) },
  t13_galaxyBloom: { id: 't13_galaxyBloom', name: 'Phấn Ngân Hà', icon: '🌌', description: 'Thúc đẩy cây trồng vượt trội, từ những dải ngân hà xa xôi.', unlockTier: 13, timeReductionPercent: T10_HYPERHARVEST_STATS.reduction + 0.06, price: Math.floor(T10_HYPERHARVEST_STATS.price * 1.7) },
  t14_nebulaRich: { id: 't14_nebulaRich', name: 'Dưỡng Chất Tinh Vân', icon: '🌠', description: 'Cho cây phát triển thần kỳ, từ những đám mây tinh vân.', unlockTier: 14, timeReductionPercent: T10_HYPERHARVEST_STATS.reduction + 0.08, price: Math.floor(T10_HYPERHARVEST_STATS.price * 2.0) },
  t15_quantumGrow: { id: 't15_quantumGrow', name: 'Tăng Trưởng Lượng Tử', icon: '⚛️', description: 'Bứt phá giới hạn thời gian, thách thức mọi định luật vật lý.', unlockTier: 15, timeReductionPercent: T10_HYPERHARVEST_STATS.reduction + 0.10, price: Math.floor(T10_HYPERHARVEST_STATS.price * 2.3) },
};

export const ALL_FERTILIZER_IDS = Object.keys(FERTILIZER_DATA) as FertilizerId[];
