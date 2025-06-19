
import type { Mission, MissionReward } from '@/types';

const GOLD = (amount: number): MissionReward => ({ type: 'gold', amount });
const XP = (amount: number): MissionReward => ({ type: 'xp', amount });
const ITEM = (itemId: MissionReward['itemId'], quantity: number): MissionReward => ({ type: 'item', itemId, quantity });

export const MAIN_MISSIONS_DATA: Mission[] = [
  // Level 1-5 Introduction
  { id: 'main_harvest_tomato_10', title: 'Nông Dân Tập Sự', description: 'Thu hoạch 10 Cà Chua đầu tiên.', category: 'main', type: 'harvest_crop', targetItemId: 'tomato', targetQuantity: 10, requiredLevelUnlock: 1, rewards: [GOLD(50), XP(20)] },
  { id: 'main_plant_carrot_5', title: 'Gieo Mầm Hy Vọng', description: 'Trồng 5 hạt Cà Rốt.', category: 'main', type: 'plant_seed', targetItemId: 'carrotSeed', targetQuantity: 5, requiredLevelUnlock: 1, rewards: [GOLD(30), XP(15), ITEM('tomatoSeed', 2)] },
  { id: 'main_reach_level_2', title: 'Bước Đầu Khởi Nghiệp', description: 'Đạt cấp độ 2.', category: 'main', type: 'reach_level', targetQuantity: 2, requiredLevelUnlock: 1, rewards: [GOLD(100), ITEM('t1_basicGrow', 1)] },
  { id: 'main_sell_corn_5', title: 'Giao Thương Đầu Tiên', description: 'Bán 5 bắp Ngô tại chợ.', category: 'main', type: 'sell_item', targetItemId: 'corn', targetQuantity: 5, requiredLevelUnlock: 2, rewards: [GOLD(75), XP(30)] },
  { id: 'main_unlock_plots_2', title: 'Mở Mang Bờ Cõi', description: 'Mở khóa thêm 2 ô đất (ngoài các ô ban đầu).', category: 'main', type: 'unlock_plots', targetQuantity: 2, requiredLevelUnlock: 3, rewards: [GOLD(150), ITEM('strawberrySeed', 5)] },

  // Level 6-10
  { id: 'main_harvest_strawberry_20', title: 'Vườn Dâu Trĩu Quả', description: 'Thu hoạch 20 Dâu Tây.', category: 'main', type: 'harvest_crop', targetItemId: 'strawberry', targetQuantity: 20, requiredLevelUnlock: 5, rewards: [GOLD(120), XP(50)] },
  { id: 'main_use_fertilizer_t1_basicGrow_3', title: 'Chăm Sóc Đất Đai', description: 'Sử dụng Phân Bón Thường 3 lần.', category: 'main', type: 'use_fertilizer', targetItemId: 't1_basicGrow', targetQuantity: 3, requiredLevelUnlock: 6, rewards: [GOLD(80), ITEM('t1_quickSoil', 2)] },
  { id: 'main_reach_level_10', title: 'Chủ Vườn Tiềm Năng', description: 'Đạt cấp độ 10.', category: 'main', type: 'reach_level', targetQuantity: 10, requiredLevelUnlock: 8, rewards: [GOLD(300), XP(100), ITEM('blueberrySeed', 3)] },
  { id: 'main_buy_potatoSeed_10', title: 'Đầu Tư Hạt Giống', description: 'Mua 10 hạt Khoai Tây.', category: 'main', type: 'buy_item', targetItemId: 'potatoSeed', targetQuantity: 10, requiredLevelUnlock: 7, rewards: [XP(40)] },
  { id: 'main_earn_gold_1000', title: 'Tích Lũy Của Cải', description: 'Kiếm được tổng cộng 1000 vàng.', category: 'main', type: 'earn_gold', targetQuantity: 1000, requiredLevelUnlock: 9, rewards: [GOLD(200), ITEM('t2_farmBoost', 1)] },
  
  // ... Add 40 more main missions, increasing complexity and rewards with level
  // Example structure for higher level missions:
  { id: 'main_harvest_blueberry_50', title: 'Chuyên Gia Việt Quất', description: 'Thu hoạch 50 Việt Quất.', category: 'main', type: 'harvest_crop', targetItemId: 'blueberry', targetQuantity: 50, requiredLevelUnlock: 11, rewards: [GOLD(250), XP(120), ITEM('onionSeed', 5)] },
  { id: 'main_reach_level_20', title: 'Nhà Nông Lão Luyện', description: 'Đạt cấp độ 20.', category: 'main', type: 'reach_level', targetQuantity: 20, requiredLevelUnlock: 18, rewards: [GOLD(1000), XP(500), ITEM('t3_powerGro', 2)] },
  { id: 'main_sell_lemon_30', title: 'Thương Nhân Chanh Vàng', description: 'Bán 30 quả Chanh Vàng.', category: 'main', type: 'sell_item', targetItemId: 'lemon', targetQuantity: 30, requiredLevelUnlock: 22, rewards: [GOLD(600), XP(250)] },
  { id: 'main_unlock_plots_total_15', title: 'Bá Chủ Đất Đai', description: 'Mở khóa tổng cộng 15 ô đất.', category: 'main', type: 'unlock_plots', targetQuantity: 15, requiredLevelUnlock: 25, rewards: [GOLD(800), ITEM('mangoSeed', 3)] },
  { id: 'main_harvest_mango_10', title: 'Vườn Xoài Trái Mùa', description: 'Thu hoạch 10 quả Xoài.', category: 'main', type: 'harvest_crop', targetItemId: 'mango', targetQuantity: 10, requiredLevelUnlock: 30, rewards: [GOLD(1200), XP(400)] },
  // Placeholder for more main missions
  ...Array.from({ length: 45 - 5 }, (_, i) => ({
    id: `main_placeholder_${i + 5}`,
    title: `Nhiệm Vụ Chính ${i + 6}`,
    description: `Mô tả cho nhiệm vụ chính thứ ${i + 6}.`,
    category: 'main' as const,
    type: 'reach_level' as const,
    targetQuantity: 25 + i * 2, // Example progression
    requiredLevelUnlock: 10 + i * 2,
    rewards: [GOLD(200 + i * 50), XP(100 + i * 20)],
  })),
];

export const DAILY_MISSION_TEMPLATES_DATA: Mission[] = [
  { id: 'daily_harvest_any_20', title: 'Thu Hoạch Nhanh', description: 'Thu hoạch 20 cây trồng bất kỳ.', category: 'daily', type: 'harvest_crop', targetQuantity: 20, rewards: [GOLD(50), XP(20)], icon: '🌾' },
  { id: 'daily_plant_any_10', title: 'Gieo Mầm Xanh', description: 'Trồng 10 hạt giống bất kỳ.', category: 'daily', type: 'plant_seed', targetQuantity: 10, rewards: [GOLD(40), XP(15)], icon: '🌱' },
  { id: 'daily_sell_any_100g', title: 'Buôn Bán Nhỏ', description: 'Bán nông sản và kiếm được 100 vàng.', category: 'daily', type: 'earn_gold', targetQuantity: 100, rewards: [ITEM('tomatoSeed', 3), XP(10)], icon: '💰' },
  { id: 'daily_use_fertilizer_any_2', title: 'Bón Phân Cho Cây', description: 'Sử dụng 2 lần phân bón bất kỳ.', category: 'daily', type: 'use_fertilizer', targetQuantity: 2, rewards: [GOLD(30), ITEM('t1_basicGrow', 1)], icon: '🧪' },
  { id: 'daily_harvest_specific_tomato_5', title: 'Ngày Cà Chua', description: 'Thu hoạch 5 Cà Chua.', category: 'daily', type: 'harvest_crop', targetItemId: 'tomato', targetQuantity: 5, rewards: [GOLD(60), XP(25)], icon: '🍅' },
  { id: 'daily_buy_seeds_3_types', title: 'Đa Dạng Hóa', description: 'Mua ít nhất 3 loại hạt giống khác nhau (mỗi loại ít nhất 1).', category: 'daily', type: 'buy_item', targetQuantity: 3, rewards: [XP(50)], icon: '🛍️' }, // This type might need specific logic for "types"
  { id: 'daily_reach_xp_50', title: 'Chăm Chỉ Mỗi Ngày', description: 'Kiếm thêm 50 XP.', category: 'daily', type: 'earn_gold', targetQuantity: 50, rewards: [GOLD(70)], icon: '⭐' }, // Reusing earn_gold for XP gain for simplicity, could be 'earn_xp'
  { id: 'daily_plant_tier1_5', title: 'Vun Trồng Cơ Bản', description: 'Trồng 5 hạt giống bậc 1.', category: 'daily', type: 'plant_seed', targetQuantity: 5, rewards: [ITEM('carrotSeed', 2)], icon: '🥕' }, // Requires logic to check seed tier
  { id: 'daily_sell_corn_10', title: 'Chợ Ngô Nhộn Nhịp', description: 'Bán 10 bắp Ngô.', category: 'daily', type: 'sell_item', targetItemId: 'corn', targetQuantity: 10, rewards: [GOLD(80)], icon: '🌽' },
  { id: 'daily_login_streak_dummy', title: 'Điểm Danh Chuyên Cần', description: 'Đăng nhập vào game (Phần thưởng này tượng trưng cho việc hoàn thành 1 NV ngày).', category: 'daily', type: 'reach_level', targetQuantity: 1, rewards: [GOLD(20)], icon: '📅' }, // Dummy for completing a daily task
];

export const WEEKLY_MISSION_TEMPLATES_DATA: Mission[] = [
  { id: 'weekly_harvest_any_100', title: 'Nông Sản Tuần Hoàn', description: 'Thu hoạch 100 cây trồng bất kỳ trong tuần.', category: 'weekly', type: 'harvest_crop', targetQuantity: 100, rewards: [GOLD(300), XP(100), ITEM('t1_quickSoil', 2)], icon: '🧺' },
  { id: 'weekly_earn_gold_1000', title: 'Thương Nhân Tuần', description: 'Kiếm được 1000 vàng từ việc bán nông sản trong tuần.', category: 'weekly', type: 'earn_gold', targetQuantity: 1000, rewards: [GOLD(200), ITEM('t2_farmBoost', 1)], icon: '🏆' },
  { id: 'weekly_plant_tier2_20', title: 'Mở Rộng Canh Tác', description: 'Trồng 20 hạt giống bậc 2 trở lên trong tuần.', category: 'weekly', type: 'plant_seed', targetQuantity: 20, rewards: [XP(150), ITEM('blueberrySeed', 5)], icon: '🌳' }, // Requires logic for seed tier
  { id: 'weekly_use_fertilizer_any_10', title: 'Dưỡng Đất Tuần Hoàn', description: 'Sử dụng 10 lần phân bón bất kỳ.', category: 'weekly', type: 'use_fertilizer', targetQuantity: 10, rewards: [GOLD(150), ITEM('t2_richEarth', 2)], icon: '✨' },
  { id: 'weekly_complete_daily_3', title: 'Chuyên Gia Hàng Ngày', description: 'Hoàn thành 3 nhiệm vụ hàng ngày trong tuần này.', category: 'weekly', type: 'complete_daily_missions', targetQuantity: 3, rewards: [GOLD(250), XP(80)], icon: '🎯' },
  { id: 'weekly_sell_specific_strawberry_50', title: 'Vựa Dâu Tuần', description: 'Bán 50 Dâu Tây trong tuần.', category: 'weekly', type: 'sell_item', targetItemId: 'strawberry', targetQuantity: 50, rewards: [GOLD(400)], icon: '🍓' },
  { id: 'weekly_unlock_plots_1', title: 'Mở Rộng Đất Tuần', description: 'Mở khóa ít nhất 1 ô đất mới trong tuần.', category: 'weekly', type: 'unlock_plots', targetQuantity: 1, rewards: [XP(200), ITEM('cornSeed', 10)], icon: '🏞️' },
  { id: 'weekly_buy_fertilizer_tier2_5', title: 'Nâng Cấp Phân Bón', description: 'Mua 5 phân bón bậc 2 trở lên.', category: 'weekly', type: 'buy_item', targetQuantity: 5, rewards: [GOLD(100)], icon: '🛍️' }, // Requires logic for fertilizer tier
  { id: 'weekly_harvest_diverse_5_types', title: 'Đa Canh Đa Lợi', description: 'Thu hoạch ít nhất 5 loại cây trồng khác nhau.', category: 'weekly', type: 'harvest_crop', targetQuantity: 5, rewards: [XP(250), ITEM('t3_powerGro',1)], icon: ' разнообразие' }, // Requires logic for diverse types
  { id: 'weekly_reach_level_plus_2', title: 'Tiến Bộ Vượt Bậc', description: 'Tăng ít nhất 2 cấp độ trong tuần.', category: 'weekly', type: 'reach_level', targetQuantity: 2, rewards: [GOLD(500), ITEM('t3_wonderSoil', 1)], icon: '🚀' }, // Target quantity is "levels gained"
];

// For random missions, we can have a larger pool with varying difficulty.
// The system would pick one or a few at a time for the player.
export const RANDOM_MISSION_POOL_DATA: Mission[] = [
  // Short & Easy
  { id: 'random_harvest_tomato_3', title: 'Cà Chua Chín Mọng', category: 'random', type: 'harvest_crop', targetItemId: 'tomato', targetQuantity: 3, rewards: [GOLD(10), XP(5)] },
  { id: 'random_plant_carrot_2', title: 'Gieo Hạt Cà Rốt', category: 'random', type: 'plant_seed', targetItemId: 'carrotSeed', targetQuantity: 2, rewards: [XP(10)] },
  { id: 'random_sell_corn_1', title: 'Bán Ngô Nhanh', category: 'random', type: 'sell_item', targetItemId: 'corn', targetQuantity: 1, rewards: [GOLD(15)] },
  { id: 'random_use_fertilizer_t1_any_1', title: 'Thử Phân Bón', category: 'random', type: 'use_fertilizer', targetItemId: 't1_basicGrow', targetQuantity: 1, rewards: [XP(5)] },
  // Medium
  { id: 'random_harvest_strawberry_10', title: 'Rổ Dâu Tây', category: 'random', type: 'harvest_crop', targetItemId: 'strawberry', targetQuantity: 10, rewards: [GOLD(40), XP(15)] },
  { id: 'random_plant_potato_5', title: 'Trồng Khoai Tây', category: 'random', type: 'plant_seed', targetItemId: 'potatoSeed', targetQuantity: 5, rewards: [GOLD(30)] },
  { id: 'random_earn_gold_50_selling', title: 'Thương Lái Nhỏ', description: 'Kiếm 50 vàng từ bán nông sản.', category: 'random', type: 'earn_gold', targetQuantity: 50, rewards: [ITEM('tomatoSeed', 2)] },
  // ... Add up to 100 diverse random mission templates
  ...Array.from({ length: 100 - 7 }, (_, i) => ({
    id: `random_placeholder_${i}`,
    title: `Nhiệm Vụ Ngẫu Nhiên ${i + 1}`,
    description: `Mô tả cho nhiệm vụ ngẫu nhiên thứ ${i + 1}.`,
    category: 'random' as const,
    type: (['harvest_crop', 'plant_seed', 'sell_item'] as const)[i % 3], // Cycle through types
    targetItemId: (['tomato', 'carrotSeed', 'corn'] as const)[i % 3],
    targetQuantity: 5 + (i % 10), // Vary quantity
    rewards: [GOLD(20 + (i % 5) * 5), XP(10 + (i % 5) * 2)],
  })),
];

  