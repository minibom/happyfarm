
import type { RewardItem } from '@/types';

export interface MailTemplate {
  id: string;
  templateName: string; // For admin UI to select
  defaultSubject: string;
  defaultBody: string;
  defaultRewards: RewardItem[];
  placeholders?: string[]; // e.g., "{{playerName}}", "{{eventName}}"
}

export const MAIL_TEMPLATES_DATA: MailTemplate[] = [
  // --- Event Related ---
  {
    id: "event_start_generic",
    templateName: "Thông báo bắt đầu sự kiện (Chung)",
    defaultSubject: "🎉 Sự kiện {{eventName}} đã bắt đầu!",
    defaultBody: "Chào {{playerName}},\n\nSự kiện {{eventName}} đã chính thức khởi động! Tham gia ngay để nhận những phần thưởng hấp dẫn và trải nghiệm những điều mới mẻ.\n\nThời gian: {{eventDuration}}\n\nChúc bạn có những giây phút vui vẻ!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 50 }],
    placeholders: ["{{eventName}}", "{{playerName}}", "{{eventDuration}}"],
  },
  {
    id: "event_reminder_generic",
    templateName: "Nhắc nhở sự kiện sắp kết thúc (Chung)",
    defaultSubject: "⏰ Đừng bỏ lỡ! Sự kiện {{eventName}} sắp kết thúc!",
    defaultBody: "Chào {{playerName}},\n\nChỉ còn {{timeLeft}} nữa là sự kiện {{eventName}} sẽ kết thúc. Hãy nhanh tay hoàn thành các mục tiêu để không bỏ lỡ những phần quà giá trị nhé!\n\nChúc bạn may mắn!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{eventName}}", "{{playerName}}", "{{timeLeft}}"],
  },
  {
    id: "event_ended_rewards",
    templateName: "Kết thúc sự kiện & Trao thưởng (Chung)",
    defaultSubject: "🎁 Sự kiện {{eventName}} đã kết thúc - Nhận quà của bạn!",
    defaultBody: "Chào {{playerName}},\n\nSự kiện {{eventName}} đã chính thức khép lại. Cảm ơn bạn đã tham gia nhiệt tình!\n\nChúng tôi xin gửi tặng bạn phần thưởng sau đây cho những đóng góp của bạn:\n\nChúc bạn tiếp tục có những trải nghiệm tuyệt vời tại Happy Farm!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 100 }, { type: 'xp', amount: 50 }],
    placeholders: ["{{eventName}}", "{{playerName}}"],
  },
  // --- System & Maintenance ---
  {
    id: "system_maintenance_start",
    templateName: "Thông báo bảo trì hệ thống",
    defaultSubject: "🛠️ Thông Báo Bảo Trì Hệ Thống Happy Farm",
    defaultBody: "Chào các Nông Dân,\n\nĐể nâng cao chất lượng dịch vụ, Happy Farm sẽ tiến hành bảo trì hệ thống.\n\nThời gian dự kiến: Từ {{startTime}} đến {{endTime}} ngày {{date}}.\n\nTrong thời gian này, bạn có thể không truy cập được vào game. Mong các bạn thông cảm vì sự bất tiện này.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{startTime}}", "{{endTime}}", "{{date}}"],
  },
  {
    id: "system_maintenance_end",
    templateName: "Thông báo hoàn tất bảo trì",
    defaultSubject: "✅ Bảo Trì Hoàn Tất - Happy Farm Trở Lại!",
    defaultBody: "Chào các Nông Dân,\n\nQuá trình bảo trì hệ thống đã hoàn tất. Happy Farm đã hoạt động trở lại bình thường.\n\nCảm ơn sự kiên nhẫn của các bạn. Chúc các bạn tiếp tục có những giờ phút vui vẻ!\n\n(Nếu có quà đền bù, admin có thể thêm vào mục Phần thưởng)\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: [],
  },
  {
    id: "system_update_new_features",
    templateName: "Thông báo cập nhật tính năng mới",
    defaultSubject: "🚀 Happy Farm Có Gì Mới? Khám Phá Ngay!",
    defaultBody: "Chào {{playerName}},\n\nHappy Farm vừa có một bản cập nhật lớn với nhiều tính năng thú vị:\n- {{feature1Description}}\n- {{feature2Description}}\n- Và nhiều cải tiến khác!\n\nHãy vào game và trải nghiệm ngay nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'xp', amount: 20 }],
    placeholders: ["{{playerName}}", "{{feature1Description}}", "{{feature2Description}}"],
  },
  // --- Player Milestones ---
  {
    id: "player_level_milestone",
    templateName: "Chúc mừng đạt mốc Cấp Độ",
    defaultSubject: "🌟 Chúc Mừng Bạn Đạt Cấp {{level}}!",
    defaultBody: "Chào {{playerName}},\n\nXin chúc mừng bạn đã xuất sắc đạt Cấp {{level}}! Đây là một cột mốc đáng nhớ trong hành trình phát triển nông trại của bạn.\n\nĐể ghi nhận sự cố gắng này, Happy Farm xin gửi tặng bạn một phần quà nhỏ.\n\nTiếp tục cố gắng và vươn tới những đỉnh cao mới nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 200 }, { type: 'item', itemId: 't1_quickSoil', quantity: 3 }],
    placeholders: ["{{playerName}}", "{{level}}"],
  },
  // Note: Tier up rewards are primarily handled by BonusConfiguration
  // but a template for manual tier congrats mail can be useful.
  {
    id: "player_tier_milestone_manual",
    templateName: "Chúc mừng thăng Bậc (Thủ công)",
    defaultSubject: "🏆 Chúc Mừng Bạn Đã Thăng Lên Bậc {{tierName}}!",
    defaultBody: "Chào {{playerName}},\n\nThật tuyệt vời! Bạn đã chính thức thăng lên Bậc {{tierNumber}} - {{tierName}}! Những nỗ lực không ngừng của bạn đã được đền đáp xứng đáng.\n\nHappy Farm xin gửi lời chúc mừng và một món quà nhỏ khích lệ.\n\nHãy khám phá những điều mới mẻ ở bậc hạng này nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 250 }, { type: 'xp', amount: 100 }],
    placeholders: ["{{playerName}}", "{{tierNumber}}", "{{tierName}}"],
  },
  // --- Offers & Promotions ---
  {
    id: "offer_special_sale",
    templateName: "Thông báo khuyến mãi đặc biệt",
    defaultSubject: "💥 Khuyến Mãi Cực Sốc: {{saleName}}!",
    defaultBody: "Chào {{playerName}},\n\nĐừng bỏ lỡ cơ hội vàng! Chương trình khuyến mãi {{saleName}} đang diễn ra tại Happy Farm với ưu đãi lên đến {{discountPercent}}% cho các vật phẩm {{itemCategory}}.\n\nThời gian: Từ {{startDate}} đến {{endDate}}.\n\nNhanh tay sắm ngay những món đồ yêu thích!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{saleName}}", "{{discountPercent}}", "{{itemCategory}}", "{{startDate}}", "{{endDate}}"],
  },
  {
    id: "offer_limited_item",
    templateName: "Thông báo vật phẩm giới hạn",
    defaultSubject: "✨ Vật Phẩm Giới Hạn: {{itemName}} Đã Xuất Hiện!",
    defaultBody: "Chào {{playerName}},\n\nVật phẩm siêu hiếm {{itemName}} đã có mặt tại cửa hàng trong thời gian giới hạn! Chỉ có {{quantityAvailable}} suất, đừng bỏ lỡ cơ hội sở hữu {{itemName}} với {{itemEffect}}.\n\nGiá bán: {{itemPrice}} Vàng.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{itemName}}", "{{quantityAvailable}}", "{{itemEffect}}", "{{itemPrice}}"],
  },
  // --- Community & Engagement ---
  {
    id: "community_contest_winner",
    templateName: "Chúc mừng người thắng cuộc thi",
    defaultSubject: "🎉 Chúc Mừng {{winnerName}} - Người Chiến Thắng Cuộc Thi {{contestName}}!",
    defaultBody: "Chào {{winnerName}},\n\nHappy Farm xin trân trọng chúc mừng bạn đã xuất sắc giành chiến thắng trong cuộc thi {{contestName}} vừa qua!\n\nPhần thưởng của bạn bao gồm:\n- {{reward1}}\n- {{reward2}}\n\nPhần thưởng sẽ được gửi đến bạn trong thời gian sớm nhất (hoặc đã đính kèm).\n\nCảm ơn bạn đã tham gia và làm cho cộng đồng Happy Farm thêm sôi động!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 500 }], // Example, specific rewards would be set by admin
    placeholders: ["{{winnerName}}", "{{contestName}}", "{{reward1}}", "{{reward2}}"],
  },
  {
    id: "community_feedback_request",
    templateName: "Yêu cầu phản hồi/khảo sát",
    defaultSubject: "📝 Góp Ý Cùng Happy Farm - Nhận Quà Liền Tay!",
    defaultBody: "Chào {{playerName}},\n\nĐể Happy Farm ngày càng hoàn thiện hơn, chúng tôi rất mong nhận được những ý kiến đóng góp quý báu từ bạn. Vui lòng dành chút thời gian tham gia khảo sát tại: {{surveyLink}}\n\nSau khi hoàn thành, bạn sẽ nhận được một phần quà nhỏ thay lời cảm ơn.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'item', itemId: 't1_basicGrow', quantity: 2 }],
    placeholders: ["{{playerName}}", "{{surveyLink}}"],
  },
  // --- Player Support & Info ---
  {
    id: "support_bug_compensation",
    templateName: "Đền bù lỗi game",
    defaultSubject: "🎁 Quà Đền Bù Sự Cố {{issueName}}",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi thành thật xin lỗi về sự cố {{issueName}} đã xảy ra vào {{dateOfIssue}}, gây ảnh hưởng đến trải nghiệm của bạn.\n\nĐể đền bù cho sự bất tiện này, Happy Farm xin gửi tặng bạn một phần quà nhỏ.\n\nCảm ơn sự thông cảm của bạn.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 100 }, { type: 'xp', amount: 50 }],
    placeholders: ["{{playerName}}", "{{issueName}}", "{{dateOfIssue}}"],
  },
  {
    id: "info_account_warning",
    templateName: "Cảnh báo tài khoản (chung)",
    defaultSubject: "⚠️ Thông Báo Quan Trọng Về Tài Khoản Happy Farm Của Bạn",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi ghi nhận hoạt động {{warningReason}} từ tài khoản của bạn. Vui lòng tuân thủ các quy định của trò chơi để đảm bảo một môi trường công bằng và vui vẻ cho tất cả người chơi.\n\nNếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ bộ phận hỗ trợ.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{warningReason}}"],
  },
  // --- General Purpose & Greetings ---
  {
    id: "general_thank_you",
    templateName: "Thư cảm ơn chung",
    defaultSubject: "💖 Cảm Ơn Bạn Đã Đồng Hành Cùng Happy Farm!",
    defaultBody: "Chào {{playerName}},\n\nĐội ngũ Happy Farm xin gửi lời cảm ơn chân thành đến bạn vì đã luôn yêu mến và ủng hộ trò chơi.\n\nSự đồng hành của bạn là nguồn động lực to lớn để chúng tôi không ngừng phát triển và mang đến những trải nghiệm tốt hơn.\n\nChúc bạn một ngày vui vẻ!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'item', itemId: 'tomatoSeed', quantity: 3 }],
    placeholders: ["{{playerName}}"],
  },
  {
    id: "general_happy_holiday",
    templateName: "Chúc mừng ngày lễ (chung)",
    defaultSubject: "🎉 Chúc Mừng Ngày Lễ {{holidayName}}!",
    defaultBody: "Chào {{playerName}},\n\nNhân dịp lễ {{holidayName}}, Happy Farm xin kính chúc bạn và gia đình có những khoảnh khắc thật vui vẻ, ấm áp và ý nghĩa.\n\nChúng tôi cũng xin gửi tặng bạn một món quà nhỏ nhân dịp này.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 100 }, { type: 'xp', amount: 50 }],
    placeholders: ["{{playerName}}", "{{holidayName}}"],
  },
  {
    id: "general_inactivity_nudge",
    templateName: "Nhắc nhở người chơi không hoạt động",
    defaultSubject: "🤔 Nông Trại Nhớ Bạn Lắm Đấy, {{playerName}}!",
    defaultBody: "Chào {{playerName}},\n\nLâu rồi không thấy bạn ghé thăm nông trại. Cây cối và vật nuôi đang rất nhớ bạn đấy!\n\nHãy quay lại Happy Farm để tiếp tục chăm sóc và phát triển cơ ngơi của mình nhé. Có nhiều điều thú vị đang chờ bạn khám phá!\n\nĐừng quên, có một món quà nhỏ chào mừng bạn trở lại!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 150 }, { type: 'item', itemId: 't1_quickSoil', quantity: 1 }],
    placeholders: ["{{playerName}}"],
  },
  {
    id: "general_login_bonus_special",
    templateName: "Thưởng đăng nhập đặc biệt",
    defaultSubject: "🎁 Quà Tặng Đăng Nhập Đặc Biệt Hôm Nay!",
    defaultBody: "Chào {{playerName}},\n\nXin chúc mừng! Hôm nay là một ngày đặc biệt và Happy Farm có một món quà bất ngờ dành cho bạn khi đăng nhập.\n\nHãy nhận lấy và tiếp tục cuộc phiêu lưu nông trại nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'xp', amount: 100 }, { type: 'item', itemId: 'strawberrySeed', quantity: 5 }],
    placeholders: ["{{playerName}}"],
  },
  {
    id: "general_apology",
    templateName: "Thư xin lỗi chung",
    defaultSubject: "✉️ Lời Xin Lỗi Từ Đội Ngũ Happy Farm",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi vô cùng xin lỗi vì {{reasonForApology}} đã xảy ra, gây ảnh hưởng đến trải nghiệm của bạn tại Happy Farm.\n\nChúng tôi đang nỗ lực khắc phục và cam kết sẽ mang đến một môi trường chơi game tốt hơn. Để bày tỏ sự chân thành, xin gửi bạn một phần quà nhỏ.\n\nMong bạn thông cảm và tiếp tục ủng hộ.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 50 }],
    placeholders: ["{{playerName}}", "{{reasonForApology}}"],
  },
  {
    id: "achievement_unlocked_generic",
    templateName: "Chúc mừng mở khóa thành tựu (chung)",
    defaultSubject: "🌟 Chúc Mừng! Bạn Đã Mở Khóa Thành Tựu {{achievementName}}!",
    defaultBody: "Chào {{playerName}},\n\nTuyệt vời! Bạn đã xuất sắc hoàn thành và mở khóa thành tựu: '{{achievementName}}'.\n\nĐây là phần thưởng ghi nhận sự cố gắng của bạn. Hãy tiếp tục chinh phục những thử thách mới nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'xp', amount: 75 }],
    placeholders: ["{{playerName}}", "{{achievementName}}"],
  },
];

    