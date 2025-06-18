
import type { GameEventConfig } from '@/types';

export const GAME_EVENT_TEMPLATES_DATA: GameEventConfig[] = [
  // --- Crop Growth Time Reduction ---
  {
    id: "crop_growth_boost_minor",
    templateName: "Tăng Trưởng Nhanh Nhẹ (Nhỏ)",
    description: "Giảm nhẹ thời gian phát triển cho tất cả cây trồng.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.10, affectedItemIds: 'ALL_CROPS' } // 10% reduction
    ],
    defaultDurationHours: 24,
    icon: "⏱️",
    defaultMailSubject: "Sự Kiện: {{eventName}} Bắt Đầu!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nHãy tận dụng cơ hội này nhé!",
  },
  {
    id: "crop_growth_boost_major_weekend",
    templateName: "Bùng Nổ Tăng Trưởng Cuối Tuần (Lớn)",
    description: "Giảm mạnh thời gian phát triển cho tất cả cây trồng vào cuối tuần.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.25, affectedItemIds: 'ALL_CROPS' } // 25% reduction
    ],
    defaultDurationHours: 48,
    icon: "🚀",
    defaultMailSubject: "Sự Kiện: {{eventName}} Bắt Đầu!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nThời gian vàng để thu hoạch bội thu!",
  },
  {
    id: "crop_growth_specific_tomato",
    templateName: "Ngày Hội Cà Chua",
    description: "Cà chua phát triển nhanh hơn.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.50, affectedItemIds: ['tomato'] } // 50% reduction for tomatoes
    ],
    defaultDurationHours: 72,
    icon: "🍅",
    defaultMailSubject: "Sự Kiện: {{eventName}} Bắt Đầu!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nTrồng cà chua ngay nào!",
  },
  // --- Item Purchase Price Modifier (Reduction) ---
  {
    id: "seed_discount_all",
    templateName: "Giảm Giá Hạt Giống (Tất cả)",
    description: "Giảm giá mua tất cả các loại hạt giống.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.8, affectedItemIds: 'ALL_SEEDS' } // 20% discount (price * 0.8)
    ],
    defaultDurationHours: 24,
    icon: "💰",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nMua hạt giống giá hời!",
  },
  {
    id: "seed_discount_tier1",
    templateName: "Ưu Đãi Hạt Giống Bậc 1",
    description: "Giảm giá hạt giống Cà Chua, Cà Rốt, Ngô.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.7, affectedItemIds: ['tomatoSeed', 'carrotSeed', 'cornSeed'] } // 30% discount
    ],
    defaultDurationHours: 48,
    icon: "💸",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nNhanh tay mua sắm!",
  },
  {
    id: "fertilizer_sale_basic",
    templateName: "Khuyến Mãi Phân Bón Cơ Bản",
    description: "Giảm giá Phân Bón Thường và Đất Tơi Xốp.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.75, affectedItemIds: ['t1_basicGrow', 't1_quickSoil'] } // 25% discount
    ],
    defaultDurationHours: 36,
    icon: "🛍️",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nĐừng bỏ lỡ!",
  },
  // --- Item Sell Price Modifier (Increase) ---
  {
    id: "crop_sell_bonus_all",
    templateName: "Giá Bán Nông Sản Tăng (Tất cả)",
    description: "Tăng giá bán cho tất cả nông sản.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.20, affectedItemIds: 'ALL_CROPS' } // 20% price increase
    ],
    defaultDurationHours: 24,
    icon: "📈",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCơ hội làm giàu!",
  },
  {
    id: "crop_sell_bonus_corn",
    templateName: "Lễ Hội Ngô Vàng",
    description: "Tăng giá bán Ngô.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.50, affectedItemIds: ['corn'] } // 50% price increase for corn
    ],
    defaultDurationHours: 72,
    icon: "🌽",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nNgô được giá, mau bán thôi!",
  },
  {
    id: "crop_sell_bonus_berries",
    templateName: "Mùa Dâu Quả Mọng",
    description: "Tăng giá bán Dâu Tây và Việt Quất.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.30, affectedItemIds: ['strawberry', 'blueberry'] } // 30% price increase
    ],
    defaultDurationHours: 48,
    icon: "🍓",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nDâu và việt quất đang có giá tốt!",
  },
  // --- Mixed Effects (Example) ---
  {
    id: "harvest_festival",
    templateName: "Lễ Hội Thu Hoạch",
    description: "Cây trồng nhanh hơn và bán được giá hơn.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.15, affectedItemIds: 'ALL_CROPS' },
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.15, affectedItemIds: 'ALL_CROPS' }
    ],
    defaultDurationHours: 72,
    icon: "🎉",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCùng tham gia lễ hội nào!",
  },
  // --- More Examples ---
  {
    id: "spring_planting_fever",
    templateName: "Sốt Gieo Trồng Mùa Xuân",
    description: "Hạt giống rẻ hơn, cây lớn nhanh hơn một chút.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.85, affectedItemIds: 'ALL_SEEDS' },
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.05, affectedItemIds: 'ALL_CROPS' }
    ],
    defaultDurationHours: 7 * 24, // 1 week
    icon: "🌸",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nMùa xuân đến rồi, gieo hạt thôi!",
  },
  {
    id: "fertilizer_tech_breakthrough",
    templateName: "Đột Phá Công Nghệ Phân Bón",
    description: "Tất cả phân bón đều giảm giá mạnh.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.5, affectedItemIds: 'ALL_FERTILIZERS' } // 50% discount
    ],
    defaultDurationHours: 12,
    icon: "🧪",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCơ hội vàng để tích trữ phân bón!",
  },
  {
    id: "market_demand_roots",
    templateName: "Nhu Cầu Củ Quả Tăng Cao",
    description: "Cà Rốt và Khoai Tây bán được giá cao.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.40, affectedItemIds: ['carrot', 'potato'] }
    ],
    defaultDurationHours: 36,
    icon: "🥔",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCà rốt, khoai tây được giá!",
  },
  {
    id: "quick_grow_herbs",
    templateName: "Ngày Thảo Dược Nhanh Chín",
    description: "Xà Lách, Rau Bina, Cần Tây phát triển nhanh hơn.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.30, affectedItemIds: ['lettuce', 'spinach', 'celery'] }
    ],
    defaultDurationHours: 24,
    icon: "🌿",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nThu hoạch thảo dược siêu tốc!",
  },
  {
    id: "premium_fruit_market",
    templateName: "Chợ Trái Cây Cao Cấp",
    description: "Tăng giá bán Xoài, Kiwi, Táo Đỏ.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.25, affectedItemIds: ['mango', 'kiwi', 'apple'] }
    ],
    defaultDurationHours: 48,
    icon: "🍎",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nTrái cây cao cấp giá tốt!",
  },
  {
    id: "exotic_crop_boost",
    templateName: "Ưu Đãi Cây Trồng Ngoại Lai",
    description: "Cây Dứa và Dừa phát triển nhanh và bán giá tốt hơn.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.10, affectedItemIds: ['pineapple', 'coconut'] },
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.10, affectedItemIds: ['pineapple', 'coconut'] }
    ],
    defaultDurationHours: 72,
    icon: "🍍",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nDứa và dừa đang hot!",
  },
  {
    id: "flash_sale_seeds_tier3",
    templateName: "Flash Sale Hạt Giống Bậc 3",
    description: "Giảm giá sốc hạt giống Chanh, Cà Tím, Tỏi.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.6, affectedItemIds: ['lemonSeed', 'eggplantSeed', 'garlicSeed'] } // 40% discount
    ],
    defaultDurationHours: 6,
    icon: "⚡",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nSăn sale hạt giống bậc 3!",
  },
  {
    id: "bumper_harvest_vegetables",
    templateName: "Bội Thu Rau Củ",
    description: "Tăng giá bán tất cả các loại rau (trừ trái cây).", // Logic for affectedItemIds would need more specific tagging or manual list
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.15, affectedItemIds: ['tomato', 'carrot', 'corn', 'potato', 'lettuce', 'onion', 'cucumber', 'spinach', 'radish', 'peas', 'eggplant', 'garlic', 'zucchini', 'celery', 'turnip', 'broccoli', 'bellpepper', 'cabbage', 'cauliflower', 'beetroot', 'leek', 'pumpkin', 'artichoke', 'lentil', 'asparagus'] }
    ],
    defaultDurationHours: 24,
    icon: "🧺",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nRau củ được mùa, được giá!",
  },
  {
    id: "rapid_growth_all_day",
    templateName: "Cả Ngày Tăng Trưởng Siêu Tốc",
    description: "Giảm nhẹ thời gian phát triển cho mọi cây trồng suốt cả ngày.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.08, affectedItemIds: 'ALL_CROPS' }
    ],
    defaultDurationHours: 24,
    icon: "💨",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCây lớn nhanh như thổi!",
  },
  {
    id: "end_of_season_clearance",
    templateName: "Xả Hàng Cuối Mùa",
    description: "Giảm giá mạnh một số hạt giống tồn kho.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.5, affectedItemIds: ['spinachSeed', 'radishSeed', 'turnipSeed', 'leekSeed'] } // Example selection
    ],
    defaultDurationHours: 12,
    icon: "📉",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nXả kho hạt giống, giá cực rẻ!",
  },
];
