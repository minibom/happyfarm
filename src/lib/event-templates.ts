
import type { GameEventConfig } from '@/types';

export const GAME_EVENT_TEMPLATES_DATA: GameEventConfig[] = [
  // --- Crop Growth Time Reduction ---
  {
    id: "crop_growth_boost_minor",
    templateName: "Tăng Trưởng Nhanh Nhẹ (Nhỏ)",
    description: "Giảm nhẹ thời gian phát triển cho tất cả cây trồng. Cơ hội tốt để đẩy nhanh tiến độ nông trại của bạn!",
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
    description: "Giảm mạnh thời gian phát triển cho tất cả cây trồng vào cuối tuần. Hoàn hảo cho những kế hoạch lớn!",
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
    templateName: "Ngày Hội Cà Chua Chín Mọng",
    description: "Cà chua phát triển nhanh hơn bao giờ hết. Cơ hội vàng để thu hoạch những trái cà chua căng mọng!",
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
    description: "Cơ hội vàng để tích trữ! Giảm giá mua tất cả các loại hạt giống.",
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
    description: "Giảm giá đặc biệt cho hạt giống Cà Chua, Cà Rốt, Ngô. Hoàn hảo cho người mới bắt đầu!",
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
    description: "Giảm giá Phân Bón Thường và Đất Tơi Xốp. Giúp cây trồng của bạn phát triển tốt hơn!",
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
    description: "Thời điểm vàng để bán nông sản! Tăng giá bán cho tất cả các loại cây trồng.",
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
    templateName: "Lễ Hội Ngô Vàng Rực Rỡ",
    description: "Thương lái đang săn lùng Ngô! Tăng giá bán Ngô.",
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
    templateName: "Mùa Dâu Quả Mọng Ngọt Ngào",
    description: "Mùa của những trái dâu! Tăng giá bán Dâu Tây và Việt Quất.",
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
    templateName: "Lễ Hội Thu Hoạch Tưng Bừng",
    description: "Không khí lễ hội ngập tràn! Cây trồng nhanh hơn và bán được giá hơn.",
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
    description: "Mùa xuân đến, vạn vật sinh sôi! Hạt giống rẻ hơn, cây lớn nhanh hơn một chút.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.85, affectedItemIds: 'ALL_SEEDS' }, // 15% seed discount
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.05, affectedItemIds: 'ALL_CROPS' } // 5% growth reduction
    ],
    defaultDurationHours: 7 * 24, // 1 week
    icon: "🌸",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nMùa xuân đến rồi, gieo hạt thôi!",
  },
  {
    id: "fertilizer_tech_breakthrough",
    templateName: "Đột Phá Công Nghệ Phân Bón",
    description: "Các nhà khoa học đã có bước đột phá! Tất cả phân bón đều giảm giá mạnh.",
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
    description: "Thị trường đang rất chuộng các loại củ! Cà Rốt và Khoai Tây bán được giá cao.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.40, affectedItemIds: ['carrot', 'potato'] } // 40% sell price increase
    ],
    defaultDurationHours: 36,
    icon: "🥔",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCà rốt, khoai tây được giá!",
  },
  {
    id: "quick_grow_herbs",
    templateName: "Ngày Thảo Dược Nhanh Chín",
    description: "Xà Lách, Rau Bina, Cần Tây phát triển nhanh hơn bao giờ hết.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.30, affectedItemIds: ['lettuce', 'spinach', 'celery'] } // 30% growth reduction
    ],
    defaultDurationHours: 24,
    icon: "🌿",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nThu hoạch thảo dược siêu tốc!",
  },
  {
    id: "premium_fruit_market",
    templateName: "Chợ Trái Cây Cao Cấp",
    description: "Thương lái tìm mua trái cây hảo hạng! Tăng giá bán Xoài, Kiwi, Táo Đỏ.",
    defaultEffects: [
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 1.25, affectedItemIds: ['mango', 'kiwi', 'apple'] } // 25% sell price increase
    ],
    defaultDurationHours: 48,
    icon: "🍎",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nTrái cây cao cấp giá tốt!",
  },
  {
    id: "exotic_crop_boost",
    templateName: "Ưu Đãi Cây Trồng Ngoại Lai",
    description: "Cây Dứa và Dừa phát triển nhanh và bán giá tốt hơn. Khám phá hương vị nhiệt đới!",
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
    description: "Giảm giá sốc trong thời gian ngắn cho hạt giống Chanh, Cà Tím, Tỏi.",
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
    templateName: "Bội Thu Rau Củ Quả",
    description: "Một mùa bội thu! Tăng giá bán tất cả các loại rau củ quả.",
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
    description: "Một luồng năng lượng bí ẩn bao phủ nông trại! Giảm nhẹ thời gian phát triển cho mọi cây trồng suốt cả ngày.",
    defaultEffects: [
      { type: 'CROP_GROWTH_TIME_REDUCTION', value: 0.08, affectedItemIds: 'ALL_CROPS' } // 8% growth reduction
    ],
    defaultDurationHours: 24,
    icon: "💨",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCây lớn nhanh như thổi!",
  },
  {
    id: "end_of_season_clearance",
    templateName: "Xả Hàng Cuối Mùa",
    description: "Dọn kho đón mùa mới! Giảm giá mạnh một số hạt giống tồn kho.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.5, affectedItemIds: ['spinachSeed', 'radishSeed', 'turnipSeed', 'leekSeed'] } // Example selection
    ],
    defaultDurationHours: 12,
    icon: "📉",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nXả kho hạt giống, giá cực rẻ!",
  },
  // --- New Event Templates for Variety ---
  {
    id: "double_xp_weekend",
    templateName: "Cuối Tuần Nhân Đôi Kinh Nghiệm",
    description: "Nhận gấp đôi điểm kinh nghiệm từ mọi hoạt động thu hoạch vào cuối tuần này!",
    // Note: This effect type 'DOUBLE_XP_ON_HARVEST' is conceptual and would need specific game logic implementation.
    // For now, we can't directly model this with existing GameEventEffect types.
    // As a placeholder, it won't have direct effect, admin would need to communicate it or trigger manually.
    defaultEffects: [], // Placeholder, actual XP doubling needs game logic change
    defaultDurationHours: 48,
    icon: "✨XP",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: Nhận gấp đôi kinh nghiệm từ mọi hoạt động thu hoạch!\n\nCơ hội thăng cấp vù vù!",
  },
  {
    id: "fertilizer_effectiveness_boost",
    templateName: "Phân Bón Siêu Hiệu Quả",
    description: "Tất cả phân bón tạm thời tăng gấp rưỡi hiệu quả giảm thời gian!",
    // Note: This effect type 'FERTILIZER_EFFECTIVENESS_MULTIPLIER' is conceptual.
    // Would require game logic to check for this event and multiply fertilizer.timeReductionPercent.
    defaultEffects: [], // Placeholder
    defaultDurationHours: 24,
    icon: "🧪💪",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: Tất cả phân bón tăng 50% hiệu quả!\n\nBón phân siêu tiết kiệm thời gian!",
  },
  {
    id: "crop_surplus_carrot",
    templateName: "Thặng Dư Cà Rốt (Giá Rẻ)",
    description: "Thị trường ngập tràn cà rốt! Giá hạt giống cà rốt giảm mạnh, nhưng giá bán cà rốt cũng giảm theo.",
    defaultEffects: [
      { type: 'ITEM_PURCHASE_PRICE_MODIFIER', value: 0.4, affectedItemIds: ['carrotSeed'] }, // 60% seed discount
      { type: 'ITEM_SELL_PRICE_MODIFIER', value: 0.7, affectedItemIds: ['carrot'] } // 30% sell price reduction
    ],
    defaultDurationHours: 36,
    icon: "🥕📉",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: {{effectsSummary}}\n\nCơ hội mua hạt cà rốt giá cực rẻ!",
  },
  {
    id: "rare_seed_discovery_event",
    templateName: "Khám Phá Hạt Giống Quý Hiếm",
    description: "Một loại hạt giống đặc biệt 'Hạt Mầm Kỳ Diệu' (miracleSproutSeed) tạm thời xuất hiện trong chợ!",
    // Note: This requires 'miracleSproutSeed' to be defined in CROP_DATA (likely Tier 999).
    // The event itself doesn't change prices, but makes an item buyable. This is more a 'content unlock' event.
    // Game logic would need to check for this event to show the item in market.
    defaultEffects: [], // No price/time effects, just content availability
    defaultDurationHours: 48,
    icon: "💎🌱",
    defaultMailSubject: "Sự Kiện: {{eventName}}!",
    defaultMailBody: "Chào Nông Dân,\n\nSự kiện '{{eventName}}' đã chính thức bắt đầu!\n\nMô tả: {{eventDescription}}\nThời gian: Từ {{startTime}} đến {{endTime}}.\nHiệu ứng: Hạt Mầm Kỳ Diệu (miracleSproutSeed) đã xuất hiện trong Chợ!\n\nĐừng bỏ lỡ cơ hội sở hữu hạt giống độc đáo này!",
  },
];
