
import type { Mission, MissionReward, InventoryItem } from '@/types';

const GOLD = (amount: number): MissionReward => ({ type: 'gold', amount });
const XP = (amount: number): MissionReward => ({ type: 'xp', amount });
const ITEM = (itemId: InventoryItem, quantity: number): MissionReward => ({ type: 'item', itemId, quantity });

export const MAIN_MISSIONS_DATA: Mission[] = [
  // --- Tutorial & Early Game (Levels 1-10) ---
  { id: 'main_harvest_tomato_5', title: 'Những Trái Cà Chua Đầu Tiên', description: 'Thu hoạch 5 Cà Chua đầu tiên từ nông trại của bạn.', category: 'main', type: 'harvest_crop', targetItemId: 'tomato', targetQuantity: 5, requiredLevelUnlock: 1, rewards: [GOLD(20), XP(10)], icon: '🍅' },
  { id: 'main_plant_carrot_3', title: 'Gieo Mầm Cà Rốt', description: 'Trồng 3 hạt Cà Rốt xuống ô đất trống.', category: 'main', type: 'plant_seed', targetItemId: 'carrotSeed', targetQuantity: 3, requiredLevelUnlock: 1, rewards: [GOLD(15), XP(8), ITEM('tomatoSeed', 2)], icon: '🥕' },
  { id: 'main_sell_corn_2', title: 'Thương Vụ Đầu Tay', description: 'Bán 2 bắp Ngô tại chợ để làm quen.', category: 'main', type: 'sell_item', targetItemId: 'corn', targetQuantity: 2, requiredLevelUnlock: 1, rewards: [GOLD(30), XP(10)], icon: '🌽' },
  { id: 'main_reach_level_2', title: 'Bước Tiến Nhỏ', description: 'Đạt được cấp độ 2.', category: 'main', type: 'reach_level', targetQuantity: 2, requiredLevelUnlock: 1, rewards: [GOLD(50), ITEM('t1_basicGrow', 1)], icon: '📈' },
  { id: 'main_buy_seeds_strawberry', title: 'Hạt Giống Mới', description: 'Mua 5 hạt Dâu Tây từ chợ.', category: 'main', type: 'buy_item', targetItemId: 'strawberrySeed', targetQuantity: 5, requiredLevelUnlock: 2, rewards: [XP(20)], icon: '🍓' },
  { id: 'main_unlock_first_new_plot', title: 'Mở Rộng Đất Đai', description: 'Mở khóa ô đất mới đầu tiên (ô thứ 11).', category: 'main', type: 'unlock_plots', targetQuantity: 1, requiredLevelUnlock: 3, rewards: [GOLD(100), XP(30)], icon: '🏞️' }, // TargetQuantity refers to "new" plots unlocked beyond initial
  { id: 'main_harvest_potato_10', title: 'Thu Hoạch Khoai Tây', description: 'Thu hoạch 10 củ Khoai Tây.', category: 'main', type: 'harvest_crop', targetItemId: 'potato', targetQuantity: 10, requiredLevelUnlock: 4, rewards: [GOLD(80), XP(25)], icon: '🥔' },
  { id: 'main_use_fertilizer_basic_1', title: 'Chăm Sóc Cây Trồng', description: 'Sử dụng Phân Bón Thường (t1_basicGrow) 1 lần.', category: 'main', type: 'use_fertilizer', targetItemId: 't1_basicGrow', targetQuantity: 1, requiredLevelUnlock: 5, rewards: [ITEM('t1_quickSoil', 1)], icon: '🧪' },
  { id: 'main_earn_gold_500', title: 'Tích Lũy Vốn Liếng', description: 'Kiếm được tổng cộng 500 vàng.', category: 'main', type: 'earn_gold', targetQuantity: 500, requiredLevelUnlock: 6, rewards: [GOLD(100), XP(50)], icon: '💰' },
  { id: 'main_reach_level_5', title: 'Nông Dân Chăm Chỉ', description: 'Đạt được cấp độ 5.', category: 'main', type: 'reach_level', targetQuantity: 5, requiredLevelUnlock: 4, rewards: [GOLD(150), ITEM('lettuceSeed', 5)], icon: '🧑‍🌾' },

  // --- Mid Game Progression (Levels 11-30) ---
  { id: 'main_plant_blueberry_8', title: 'Vườn Việt Quất', description: 'Trồng 8 hạt Việt Quất.', category: 'main', type: 'plant_seed', targetItemId: 'blueberrySeed', targetQuantity: 8, requiredLevelUnlock: 11, rewards: [GOLD(100), XP(40)], icon: '🫐' },
  { id: 'main_sell_onion_20', title: 'Chuyên Gia Hành Tây', description: 'Bán 20 củ Hành Tây.', category: 'main', type: 'sell_item', targetItemId: 'onion', targetQuantity: 20, requiredLevelUnlock: 12, rewards: [GOLD(200), XP(60)], icon: '🧅' },
  { id: 'main_reach_level_10', title: 'Tay Nghề Vững Vàng', description: 'Đạt cấp độ 10.', category: 'main', type: 'reach_level', targetQuantity: 10, requiredLevelUnlock: 9, rewards: [GOLD(250), XP(100), ITEM('t2_farmBoost', 1)], icon: '🏆' },
  { id: 'main_use_fertilizer_t2_3', title: 'Nâng Cấp Phân Bón', description: 'Sử dụng 3 lần phân bón bậc 2 (vd: Phân Chuồng Cao Cấp).', category: 'main', type: 'use_fertilizer', targetItemId: 't2_farmBoost', targetQuantity: 3, requiredLevelUnlock: 13, rewards: [GOLD(150), XP(70)], icon: '💩' },
  { id: 'main_unlock_plots_5_new', title: 'Mở Rộng Hơn Nữa', description: 'Mở khóa thêm 5 ô đất mới (tổng cộng 5 ô mới sau ô ban đầu).', category: 'main', type: 'unlock_plots', targetQuantity: 5, requiredLevelUnlock: 15, rewards: [GOLD(500), XP(150)], icon: '🗺️' },
  { id: 'main_harvest_lemon_15', title: 'Vườn Chanh Trái Vụ', description: 'Thu hoạch 15 quả Chanh Vàng.', category: 'main', type: 'harvest_crop', targetItemId: 'lemon', targetQuantity: 15, requiredLevelUnlock: 16, rewards: [GOLD(300), XP(120)], icon: '🍋' },
  { id: 'main_reach_level_15', title: 'Nhà Nông Có Tiếng', description: 'Đạt cấp độ 15.', category: 'main', type: 'reach_level', targetQuantity: 15, requiredLevelUnlock: 14, rewards: [GOLD(400), ITEM('eggplantSeed', 5), ITEM('t3_powerGro', 1)], icon: '🌟' },
  { id: 'main_earn_gold_2500', title: 'Thương Gia Nông Sản', description: 'Kiếm được tổng cộng 2500 vàng.', category: 'main', type: 'earn_gold', targetQuantity: 2500, requiredLevelUnlock: 18, rewards: [GOLD(500), XP(200)], icon: '💼' },
  { id: 'main_plant_mango_5', title: 'Thử Thách Xoài Cát', description: 'Trồng 5 hạt Xoài.', category: 'main', type: 'plant_seed', targetItemId: 'mangoSeed', targetQuantity: 5, requiredLevelUnlock: 21, rewards: [GOLD(250), XP(100)], icon: '🥭' },
  { id: 'main_reach_level_20', title: 'Bậc Thầy Canh Tác', description: 'Đạt cấp độ 20.', category: 'main', type: 'reach_level', targetQuantity: 20, requiredLevelUnlock: 19, rewards: [GOLD(600), XP(250), ITEM('t4_superFert', 1)], icon: '🥇' },

  // --- Advanced Game (Levels 31-50) ---
  { id: 'main_sell_kiwi_20', title: 'Đặc Sản Kiwi', description: 'Bán 20 quả Kiwi.', category: 'main', type: 'sell_item', targetItemId: 'kiwi', targetQuantity: 20, requiredLevelUnlock: 26, rewards: [GOLD(800), XP(300)], icon: '🥝' },
  { id: 'main_unlock_plots_total_20', title: 'Chủ Đồn Điền', description: 'Mở khóa tổng cộng 20 ô đất.', category: 'main', type: 'unlock_plots', targetQuantity: 20, requiredLevelUnlock: 28, rewards: [GOLD(1000), XP(400)], icon: '🏰' },
  { id: 'main_reach_level_30', title: 'Lão Nông Triệu Phú', description: 'Đạt cấp độ 30.', category: 'main', type: 'reach_level', targetQuantity: 30, requiredLevelUnlock: 29, rewards: [GOLD(1500), ITEM('t5_ultraNutrient', 1), ITEM('appleSeed', 5)], icon: '🧐' },
  { id: 'main_harvest_grapes_50', title: 'Mùa Nho Bội Thu', description: 'Thu hoạch 50 chùm Nho.', category: 'main', type: 'harvest_crop', targetItemId: 'grapes', targetQuantity: 50, requiredLevelUnlock: 31, rewards: [GOLD(1200), XP(500)], icon: '🍇' },
  { id: 'main_use_fertilizer_t5_5', title: 'Dinh Dưỡng Thượng Hạng', description: 'Sử dụng 5 lần phân bón bậc 5 (vd: Dinh Dưỡng Tối Ưu).', category: 'main', type: 'use_fertilizer', targetItemId: 't5_ultraNutrient', targetQuantity: 5, requiredLevelUnlock: 33, rewards: [GOLD(750), XP(300)], icon: '✨🧪' },
  { id: 'main_earn_gold_10000', title: 'Đại Gia Nông Nghiệp', description: 'Kiếm được tổng cộng 10,000 vàng.', category: 'main', type: 'earn_gold', targetQuantity: 10000, requiredLevelUnlock: 35, rewards: [GOLD(2000), XP(800)], icon: '🤑' },
  { id: 'main_reach_level_40', title: 'Huyền Thoại Nông Dân', description: 'Đạt cấp độ 40.', category: 'main', type: 'reach_level', targetQuantity: 40, requiredLevelUnlock: 39, rewards: [GOLD(2500), ITEM('t6_gigaGro', 2), ITEM('peachSeed', 3)], icon: '📜' },
  { id: 'main_plant_pineapple_3', title: 'Vua Dứa', description: 'Trồng 3 hạt Dứa.', category: 'main', type: 'plant_seed', targetItemId: 'pineappleSeed', targetQuantity: 3, requiredLevelUnlock: 41, rewards: [GOLD(1000), XP(400)], icon: '🍍' },
  { id: 'main_sell_durian_5', title: 'Thử Thách Sầu Riêng', description: 'Bán 5 quả Sầu Riêng.', category: 'main', type: 'sell_item', targetItemId: 'durian', targetQuantity: 5, requiredLevelUnlock: 45, rewards: [GOLD(3000), XP(1000)], icon: '🤢👑' },
  { id: 'main_reach_level_50', title: 'Đỉnh Cao Danh Vọng', description: 'Đạt cấp độ 50.', category: 'main', type: 'reach_level', targetQuantity: 50, requiredLevelUnlock: 49, rewards: [GOLD(5000), XP(2000), ITEM('t10_hyperHarvest', 1)], icon: '🌌' },
  
  // Additional 20 Main Missions (Placeholder for future expansion, making it 50 total)
  // For now, these will be challenging and high-reward.
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `main_epic_quest_${i + 1}`,
    title: `Chinh Phục Huyền Thoại ${i + 1}`,
    description: `Hoàn thành thử thách nông trại vĩ đại thứ ${i + 1}.`,
    category: 'main' as const,
    type: (['harvest_crop', 'earn_gold', 'reach_level'] as const)[i % 3],
    targetItemId: (['pineapple', undefined, undefined] as const)[i % 3] as InventoryItem | undefined,
    targetQuantity: 50 + i * 10,
    requiredLevelUnlock: 50 + i * 2, // Start unlocking after level 50
    rewards: [GOLD(5000 + i * 1000), XP(2000 + i * 500), ITEM('t10_hyperHarvest', 1)],
    icon: (['🌠', '💎', '💫'] as const)[i % 3],
  })),
];

export const DAILY_MISSION_TEMPLATES_DATA: Mission[] = [
  { id: 'daily_harvest_common_15', title: 'Nông Sản Hàng Ngày', description: 'Thu hoạch 15 cây trồng bậc 1 (Cà Chua, Cà Rốt, Ngô, Dâu Tây, Khoai Tây hoặc Xà Lách).', category: 'daily', type: 'harvest_crop', targetQuantity: 15, rewards: [GOLD(60), XP(25)], icon: '🧺' },
  { id: 'daily_plant_any_8', title: 'Vườn Ươm Mỗi Ngày', description: 'Trồng 8 hạt giống bất kỳ.', category: 'daily', type: 'plant_seed', targetQuantity: 8, rewards: [GOLD(50), XP(20)], icon: '🌱' },
  { id: 'daily_sell_for_gold_150', title: 'Giao Dịch Sáng Sớm', description: 'Bán nông sản tại chợ và kiếm được 150 vàng.', category: 'daily', type: 'earn_gold', targetQuantity: 150, rewards: [ITEM('tomatoSeed', 4), XP(15)], icon: '💰' },
  { id: 'daily_use_fertilizer_any_1', title: 'Dưỡng Chất Cho Đất', description: 'Sử dụng 1 lần phân bón bất kỳ.', category: 'daily', type: 'use_fertilizer', targetQuantity: 1, rewards: [GOLD(25), ITEM('t1_basicGrow', 1)], icon: '🧪' },
  { id: 'daily_harvest_specific_carrot_7', title: 'Ngày Vàng Cà Rốt', description: 'Thu hoạch 7 Cà Rốt.', category: 'daily', type: 'harvest_crop', targetItemId: 'carrot', targetQuantity: 7, rewards: [GOLD(70), XP(30)], icon: '🥕' },
  { id: 'daily_buy_seeds_any_5', title: 'Mua Sắm Hạt Giống', description: 'Mua 5 hạt giống bất kỳ từ chợ.', category: 'daily', type: 'buy_item', targetQuantity: 5, rewards: [XP(40)], icon: '🛍️' },
  { id: 'daily_harvest_strawberry_5', title: 'Dâu Tây Ngọt Ngào', description: 'Thu hoạch 5 Dâu Tây.', category: 'daily', type: 'harvest_crop', targetItemId: 'strawberry', targetQuantity: 5, rewards: [GOLD(65), XP(28)], icon: '🍓' },
  { id: 'daily_plant_corn_4', title: 'Gieo Hạt Ngô Vàng', description: 'Trồng 4 hạt Ngô.', category: 'daily', type: 'plant_seed', targetItemId: 'cornSeed', targetQuantity: 4, rewards: [ITEM('t1_quickSoil', 1)], icon: '🌽' },
  { id: 'daily_sell_lettuce_3', title: 'Xà Lách Tươi Xanh', description: 'Bán 3 cây Xà Lách.', category: 'daily', type: 'sell_item', targetItemId: 'lettuce', targetQuantity: 3, rewards: [GOLD(55)], icon: '🥬' },
  { id: 'daily_xp_boost_30', title: 'Nỗ Lực Mỗi Ngày', description: 'Kiếm thêm 30 XP từ các hoạt động.', category: 'daily', type: 'earn_gold', targetQuantity: 30, rewards: [GOLD(45)], icon: '⭐' }, // Reusing earn_gold type for simplicity for now
];

export const WEEKLY_MISSION_TEMPLATES_DATA: Mission[] = [
  { id: 'weekly_harvest_any_tier1_75', title: 'Đại Thu Hoạch Bậc 1', description: 'Thu hoạch 75 cây trồng bậc 1 trong tuần.', category: 'weekly', type: 'harvest_crop', targetQuantity: 75, rewards: [GOLD(350), XP(120), ITEM('t2_farmBoost', 1)], icon: '🚜' },
  { id: 'weekly_earn_gold_1200', title: 'Thương Nhân Đại Tài', description: 'Kiếm được 1200 vàng từ việc bán nông sản trong tuần.', category: 'weekly', type: 'earn_gold', targetQuantity: 1200, rewards: [GOLD(250), ITEM('blueberrySeed', 3)], icon: '🏆' },
  { id: 'weekly_plant_tier2_or_higher_15', title: 'Mở Rộng Giống Mới', description: 'Trồng 15 hạt giống bậc 2 trở lên trong tuần.', category: 'weekly', type: 'plant_seed', targetQuantity: 15, rewards: [XP(180), ITEM('t2_richEarth', 2)], icon: '🌳' },
  { id: 'weekly_use_fertilizer_any_7', title: 'Tuần Lễ Phân Bón', description: 'Sử dụng 7 lần phân bón bất kỳ (có thể cùng loại).', category: 'weekly', type: 'use_fertilizer', targetQuantity: 7, rewards: [GOLD(180), ITEM('t3_powerGro', 1)], icon: '✨🧪' },
  { id: 'weekly_complete_daily_missions_4', title: 'Siêng Năng Cả Tuần', description: 'Hoàn thành 4 nhiệm vụ hàng ngày trong tuần này.', category: 'weekly', type: 'complete_daily_missions', targetQuantity: 4, rewards: [GOLD(300), XP(100)], icon: '🎯' },
  { id: 'weekly_sell_specific_potato_40', title: 'Vựa Khoai Tây Tuần Này', description: 'Bán 40 củ Khoai Tây trong tuần.', category: 'weekly', type: 'sell_item', targetItemId: 'potato', targetQuantity: 40, rewards: [GOLD(450)], icon: '🥔🧺' },
  { id: 'weekly_unlock_plot_if_possible', title: 'Khai Hoang Mở Đất', description: 'Mở khóa ít nhất 1 ô đất mới trong tuần (nếu có thể).', category: 'weekly', type: 'unlock_plots', targetQuantity: 1, rewards: [XP(250), ITEM('onionSeed', 5)], icon: '🏞️⛏️' },
  { id: 'weekly_buy_fertilizer_tier2_or_higher_3', title: 'Đầu Tư Thông Minh', description: 'Mua 3 phân bón bậc 2 trở lên.', category: 'weekly', type: 'buy_item', targetQuantity: 3, rewards: [GOLD(120)], icon: '🛍️💪' },
  { id: 'weekly_harvest_diverse_crops_4_types', title: 'Vườn Cây Đa Dạng', description: 'Thu hoạch ít nhất 4 loại cây trồng khác nhau trong tuần.', category: 'weekly', type: 'harvest_crop', targetQuantity: 4, rewards: [XP(300), ITEM('t3_wonderSoil',1)], icon: '🍎🥕🌽🍓' },
  { id: 'weekly_reach_level_plus_1', title: 'Thăng Tiến Trong Tuần', description: 'Tăng ít nhất 1 cấp độ trong tuần.', category: 'weekly', type: 'reach_level', targetQuantity: 1, rewards: [GOLD(550), ITEM('lemonSeed', 2)], icon: '🚀⭐' },
];

export const RANDOM_MISSION_POOL_DATA: Mission[] = [
  // Very Short & Easy
  { id: 'random_harvest_tomato_2', title: 'Hái Vội Cà Chua', category: 'random', type: 'harvest_crop', targetItemId: 'tomato', targetQuantity: 2, rewards: [GOLD(8), XP(4)], icon: '🍅' },
  { id: 'random_plant_carrot_1', title: 'Thả Giống Cà Rốt', category: 'random', type: 'plant_seed', targetItemId: 'carrotSeed', targetQuantity: 1, rewards: [XP(6)], icon: '🥕' },
  { id: 'random_sell_corn_1', title: 'Bán Vội Ngô', category: 'random', type: 'sell_item', targetItemId: 'corn', targetQuantity: 1, rewards: [GOLD(12)], icon: '🌽' },
  { id: 'random_use_fertilizer_t1_basicGrow_1', title: 'Thử Phân Bón Nhẹ', category: 'random', type: 'use_fertilizer', targetItemId: 't1_basicGrow', targetQuantity: 1, rewards: [XP(7)], icon: '🧪' },
  { id: 'random_buy_tomatoSeed_1', title: 'Mua Hạt Cà Chua', category: 'random', type: 'buy_item', targetItemId: 'tomatoSeed', targetQuantity: 1, rewards: [GOLD(5)] , icon: '🛍️'},
  { id: 'random_harvest_strawberry_1', title: 'Trái Dâu Ngọt', category: 'random', type: 'harvest_crop', targetItemId: 'strawberry', targetQuantity: 1, rewards: [XP(8)], icon: '🍓' },
  { id: 'random_plant_lettuce_1', title: 'Xà Lách Mơn Mởn', category: 'random', type: 'plant_seed', targetItemId: 'lettuceSeed', targetQuantity: 1, rewards: [GOLD(10)], icon: '🥬' },
  { id: 'random_earn_gold_20', title: 'Kiếm Chút Vàng', category: 'random', type: 'earn_gold', targetQuantity: 20, rewards: [XP(5)], icon: '💰' },
  { id: 'random_harvest_potato_1', title: 'Củ Khoai Tây Con', category: 'random', type: 'harvest_crop', targetItemId: 'potato', targetQuantity: 1, rewards: [GOLD(7)], icon: '🥔' },
  { id: 'random_plant_any_1', title: 'Gieo Một Hạt Bất Kỳ', category: 'random', type: 'plant_seed', targetQuantity: 1, rewards: [XP(5)], icon: '🌱' },
  // ... (10 easy missions)

  // Medium Difficulty (Expanding variety and quantity)
  { id: 'random_harvest_tomato_8', title: 'Thu Hoạch Cà Chua', category: 'random', type: 'harvest_crop', targetItemId: 'tomato', targetQuantity: 8, rewards: [GOLD(25), XP(12)], icon: '🍅🧺' },
  { id: 'random_plant_carrot_5', title: 'Trồng Vài Luống Cà Rốt', category: 'random', type: 'plant_seed', targetItemId: 'carrotSeed', targetQuantity: 5, rewards: [GOLD(20), XP(10)], icon: '🥕🌱' },
  { id: 'random_sell_corn_7', title: 'Bán Thêm Ngô', category: 'random', type: 'sell_item', targetItemId: 'corn', targetQuantity: 7, rewards: [GOLD(70), XP(15)], icon: '🌽💰' },
  { id: 'random_use_fertilizer_t1_quickSoil_2', title: 'Cải Tạo Đất Nhanh', category: 'random', type: 'use_fertilizer', targetItemId: 't1_quickSoil', targetQuantity: 2, rewards: [GOLD(30), XP(18)], icon: '✨🧪' },
  { id: 'random_buy_strawberrySeed_3', title: 'Thêm Hạt Dâu Tây', category: 'random', type: 'buy_item', targetItemId: 'strawberrySeed', targetQuantity: 3, rewards: [XP(15)], icon: '🍓🛍️' },
  { id: 'random_harvest_strawberry_7', title: 'Một Rổ Dâu Tươi', category: 'random', type: 'harvest_crop', targetItemId: 'strawberry', targetQuantity: 7, rewards: [GOLD(50), XP(20)], icon: '🍓🧺' },
  { id: 'random_plant_lettuce_4', title: 'Vườn Xà Lách', category: 'random', type: 'plant_seed', targetItemId: 'lettuceSeed', targetQuantity: 4, rewards: [GOLD(35), XP(16)], icon: '🥬🌱' },
  { id: 'random_earn_gold_75', title: 'Gom Vàng', category: 'random', type: 'earn_gold', targetQuantity: 75, rewards: [ITEM('cornSeed', 2)], icon: '💰✨' },
  { id: 'random_harvest_potato_6', title: 'Thu Khoai Tây', category: 'random', type: 'harvest_crop', targetItemId: 'potato', targetQuantity: 6, rewards: [GOLD(40), XP(18)], icon: '🥔🧺' },
  { id: 'random_plant_any_5', title: 'Gieo Trồng Mở Rộng', category: 'random', type: 'plant_seed', targetQuantity: 5, rewards: [GOLD(25), XP(12)], icon: '🌱➕' },
  { id: 'random_sell_carrot_10', title: 'Chợ Cà Rốt', category: 'random', type: 'sell_item', targetItemId: 'carrot', targetQuantity: 10, rewards: [GOLD(60), XP(20)], icon: '🥕💰' },
  { id: 'random_buy_fertilizer_any_1', title: 'Thử Phân Bón Mới', category: 'random', type: 'buy_item', targetQuantity: 1, rewards: [XP(10)], icon: '🧪🛍️' }, // Player buys any 1 fertilizer
  { id: 'random_harvest_onion_3', title: 'Hành Tây Thơm Lừng', category: 'random', type: 'harvest_crop', targetItemId: 'onion', targetQuantity: 3, requiredLevelUnlock: 5, rewards: [GOLD(30), XP(15)], icon: '🧅' },
  { id: 'random_plant_blueberry_2', title: 'Ươm Mầm Việt Quất', category: 'random', type: 'plant_seed', targetItemId: 'blueberrySeed', targetQuantity: 2, requiredLevelUnlock: 5, rewards: [GOLD(25), XP(12)], icon: '🫐' },
  { id: 'random_use_fertilizer_t2_any_1', title: 'Dùng Phân Tốt', category: 'random', type: 'use_fertilizer', targetQuantity: 1, requiredLevelUnlock: 5, rewards: [GOLD(35), XP(20)], icon: '💩✨' }, // Use any T2 fertilizer
  // ... (15 more medium missions)

  // Adding the rest with varied parameters to reach 100
  ...Array.from({ length: 100 - 25 }, (_, i) => {
    const types: Mission['type'][] = ['harvest_crop', 'plant_seed', 'sell_item', 'earn_gold', 'use_fertilizer', 'buy_item'];
    const type = types[i % types.length];
    const itemCategories = [
      { crop: 'tomato', seed: 'tomatoSeed', fertilizer: 't1_basicGrow', tier: 1, icon: '🍅' },
      { crop: 'carrot', seed: 'carrotSeed', fertilizer: 't1_quickSoil', tier: 1, icon: '🥕' },
      { crop: 'corn', seed: 'cornSeed', fertilizer: 't2_farmBoost', tier: 1, icon: '🌽' },
      { crop: 'strawberry', seed: 'strawberrySeed', fertilizer: 't2_richEarth', tier: 2, icon: '🍓' },
      { crop: 'potato', seed: 'potatoSeed', fertilizer: 't3_powerGro', tier: 2, icon: '🥔' },
      { crop: 'lettuce', seed: 'lettuceSeed', fertilizer: 't3_wonderSoil', tier: 3, icon: '🥬' },
      { crop: 'blueberry', seed: 'blueberrySeed', fertilizer: 't4_superFert', tier: 3, icon: '🫐' },
      { crop: 'onion', seed: 'onionSeed', fertilizer: 't5_ultraNutrient', tier: 4, icon: '🧅' },
      { crop: 'lemon', seed: 'lemonSeed', fertilizer: 't6_gigaGro', tier: 4, icon: '🍋' },
      { crop: 'mango', seed: 'mangoSeed', fertilizer: 't10_hyperHarvest', tier: 5, icon: '🥭' }
    ];
    const itemCat = itemCategories[i % itemCategories.length];
    
    let targetItemId: InventoryItem | undefined = undefined;
    let quantity = 1 + (i % 5); // 1 to 5
    let missionIcon = itemCat.icon;

    switch (type) {
      case 'harvest_crop':
        targetItemId = itemCat.crop as InventoryItem;
        quantity = 3 + (i % 7); // 3 to 9
        break;
      case 'plant_seed':
        targetItemId = itemCat.seed as InventoryItem;
        break;
      case 'sell_item':
        targetItemId = itemCat.crop as InventoryItem;
        quantity = 2 + (i % 6); // 2 to 7
        break;
      case 'earn_gold':
        quantity = 25 + (i % 10) * 5; // 25 to 70
        missionIcon = '💰';
        break;
      case 'use_fertilizer':
        targetItemId = itemCat.fertilizer as InventoryItem;
        missionIcon = '🧪';
        break;
      case 'buy_item':
        targetItemId = (i % 2 === 0 ? itemCat.seed : itemCat.fertilizer) as InventoryItem;
        missionIcon = '🛍️';
        break;
    }

    return {
      id: `random_pool_${i + 10}`, // Ensure unique IDs
      title: `Thử Thách Nông Trại ${i + 1}`,
      category: 'random' as const,
      type,
      targetItemId,
      targetQuantity: quantity,
      requiredLevelUnlock: Math.max(1, itemCat.tier -1), // ensure min level 1
      rewards: [GOLD(10 + (i % 8) * 3), XP(5 + (i % 6) * 2)],
      icon: missionIcon,
    };
  }),
];

  
