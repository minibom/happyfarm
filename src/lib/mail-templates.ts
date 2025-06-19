
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
    templateName: "Sự kiện bắt đầu (Chung)",
    defaultSubject: "🎉 Sự kiện {{eventName}} đã bắt đầu!",
    defaultBody: "Chào {{playerName}},\n\nSự kiện đặc biệt '{{eventName}}' đã chính thức khởi động tại Happy Farm!\n\nMô tả: {{eventDescription}}\nThời gian diễn ra: Từ {{startTime}} đến {{endTime}}.\n\nHiệu ứng nổi bật:\n{{effectsSummary}}\n\nĐừng bỏ lỡ cơ hội tham gia và nhận những phần thưởng hấp dẫn cũng như trải nghiệm những điều mới mẻ.\n\nChúc bạn có những giây phút vui vẻ và bội thu!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 50 }],
    placeholders: ["{{eventName}}", "{{playerName}}", "{{eventDescription}}", "{{startTime}}", "{{endTime}}", "{{effectsSummary}}"],
  },
  {
    id: "event_reminder_generic",
    templateName: "Nhắc nhở sự kiện sắp kết thúc",
    defaultSubject: "⏰ Đừng bỏ lỡ! Sự kiện {{eventName}} sắp kết thúc!",
    defaultBody: "Này {{playerName}},\n\nChỉ còn {{timeLeft}} nữa là sự kiện '{{eventName}}' sẽ kết thúc rồi đó! Hãy nhanh tay hoàn thành các mục tiêu và tận dụng những ưu đãi cuối cùng để không bỏ lỡ những phần quà giá trị nhé!\n\nChúc bạn may mắn và gặt hái thành công!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{eventName}}", "{{playerName}}", "{{timeLeft}}"],
  },
  {
    id: "event_ended_rewards",
    templateName: "Kết thúc sự kiện & Trao thưởng",
    defaultSubject: "🎁 Sự kiện {{eventName}} đã kết thúc - Nhận quà của bạn!",
    defaultBody: "Chào {{playerName}},\n\nSự kiện '{{eventName}}' đã chính thức khép lại. Happy Farm xin chân thành cảm ơn sự tham gia nhiệt tình của bạn!\n\nChúng tôi xin gửi tặng bạn phần thưởng sau đây như một lời tri ân cho những đóng góp và thành tích của bạn trong suốt sự kiện:\n\nChúc bạn tiếp tục có những trải nghiệm tuyệt vời và những mùa màng bội thu tại Happy Farm!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 100 }, { type: 'xp', amount: 50 }],
    placeholders: ["{{eventName}}", "{{playerName}}"],
  },
  // --- System & Maintenance ---
  {
    id: "system_maintenance_start",
    templateName: "Thông báo bảo trì hệ thống",
    defaultSubject: "🛠️ Thông Báo Bảo Trì Hệ Thống Happy Farm",
    defaultBody: "Chào các Nông Dân,\n\nĐể nâng cao chất lượng dịch vụ và mang đến những trải nghiệm tốt hơn, Happy Farm sẽ tiến hành bảo trì hệ thống.\n\nThời gian dự kiến: Từ {{startTime}} đến {{endTime}} ngày {{date}}.\n\nTrong thời gian này, bạn có thể không truy cập được vào game hoặc gặp một số gián đoạn. Chúng tôi rất mong nhận được sự thông cảm của các bạn vì sự bất tiện này.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{startTime}}", "{{endTime}}", "{{date}}"],
  },
  {
    id: "system_maintenance_end_with_gift",
    templateName: "Hoàn tất bảo trì (Có quà)",
    defaultSubject: "✅ Bảo Trì Hoàn Tất - Happy Farm Trở Lại + Quà Nhỏ!",
    defaultBody: "Chào các Nông Dân,\n\nQuá trình bảo trì hệ thống đã hoàn tất. Happy Farm đã hoạt động trở lại bình thường và ổn định hơn.\n\nĐể cảm ơn sự kiên nhẫn của bạn, chúng tôi xin gửi tặng một phần quà nhỏ. Hãy kiểm tra hòm thư và nhận nhé!\n\nChúc các bạn tiếp tục có những giờ phút vui vẻ tại nông trại!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 50 }, { type: 'item', itemId: 't1_quickSoil', quantity: 1 }],
    placeholders: [],
  },
  {
    id: "system_update_new_features",
    templateName: "Cập nhật tính năng mới",
    defaultSubject: "🚀 Happy Farm Có Gì Mới? Khám Phá Ngay Bản Cập Nhật {{versionNumber}}!",
    defaultBody: "Chào {{playerName}},\n\nHappy Farm vừa tung ra bản cập nhật {{versionNumber}} với hàng loạt tính năng và cải tiến hấp dẫn:\n- {{feature1Description}}\n- {{feature2Description}}\n- {{feature3Description}}\n\nVà còn nhiều điều bất ngờ khác nữa! Hãy vào game và tự mình trải nghiệm ngay để không bỏ lỡ những điều thú vị này nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'xp', amount: 25 }, {type: 'item', itemId: 'tomatoSeed', quantity: 5}],
    placeholders: ["{{playerName}}", "{{versionNumber}}", "{{feature1Description}}", "{{feature2Description}}", "{{feature3Description}}"],
  },
  // --- Player Milestones & Achievements ---
  {
    id: "player_level_milestone",
    templateName: "Chúc mừng đạt mốc Cấp Độ",
    defaultSubject: "🌟 Chúc Mừng {{playerName}} Đạt Cấp {{level}}!",
    defaultBody: "Chào {{playerName}},\n\nXin chúc mừng bạn đã xuất sắc đạt Cấp {{level}}! Đây là một cột mốc quan trọng, đánh dấu sự trưởng thành và những nỗ lực không ngừng của bạn trong việc xây dựng nông trại.\n\nĐể ghi nhận thành tích này, Happy Farm xin gửi tặng bạn một phần quà nhỏ. Mong rằng nó sẽ giúp ích cho bạn trên chặng đường sắp tới.\n\nTiếp tục cố gắng và vươn tới những đỉnh cao mới nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 200 }, { type: 'item', itemId: 't1_quickSoil', quantity: 3 }],
    placeholders: ["{{playerName}}", "{{level}}"],
  },
  {
    id: "player_tier_milestone_manual",
    templateName: "Chúc mừng thăng Bậc (Thủ công)",
    defaultSubject: "🏆 Chúc Mừng {{playerName}} Đã Thăng Lên {{tierName}}!",
    defaultBody: "Chào {{playerName}},\n\nThật tuyệt vời! Bạn đã chính thức thăng lên Bậc {{tierNumber}} - {{tierName}}! Những nỗ lực không ngừng của bạn đã được đền đáp xứng đáng. Các buff mới và vật phẩm cao cấp hơn đang chờ bạn khám phá.\n\nHappy Farm xin gửi lời chúc mừng và một món quà nhỏ khích lệ.\n\nHãy tận hưởng những đặc quyền mới ở bậc hạng này nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 250 }, { type: 'xp', amount: 100 }],
    placeholders: ["{{playerName}}", "{{tierNumber}}", "{{tierName}}"],
  },
  // --- Offers & Promotions ---
  {
    id: "offer_special_sale",
    templateName: "Thông báo khuyến mãi đặc biệt",
    defaultSubject: "💥 Khuyến Mãi Cực Sốc: {{saleName}} - Giảm Đến {{discountPercent}}%!",
    defaultBody: "Chào {{playerName}},\n\nĐừng bỏ lỡ cơ hội vàng! Chương trình khuyến mãi {{saleName}} đang diễn ra tại Happy Farm với ưu đãi CHƯA TỪNG CÓ, giảm giá lên đến {{discountPercent}}% cho các vật phẩm {{itemCategory}}.\n\nThời gian diễn ra: Từ {{startDate}} đến {{endDate}}.\n\nNhanh tay sắm ngay những món đồ yêu thích để nâng cấp nông trại của bạn!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{saleName}}", "{{discountPercent}}", "{{itemCategory}}", "{{startDate}}", "{{endDate}}"],
  },
  {
    id: "offer_limited_item",
    templateName: "Vật phẩm giới hạn mở bán",
    defaultSubject: "✨ Vật Phẩm Giới Hạn: {{itemName}} Đã Xuất Hiện!",
    defaultBody: "Chào {{playerName}},\n\nTin nóng hổi! Vật phẩm siêu hiếm và cực kỳ giá trị - {{itemName}} - đã có mặt tại cửa hàng trong thời gian giới hạn! Chỉ có {{quantityAvailable}} suất duy nhất. Đừng bỏ lỡ cơ hội sở hữu {{itemName}} với {{itemEffect}}.\n\nGiá bán ưu đãi: {{itemPrice}} Vàng.\n\nSố lượng có hạn, nhanh tay kẻo lỡ!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{itemName}}", "{{quantityAvailable}}", "{{itemEffect}}", "{{itemPrice}}"],
  },
  // --- Community & Engagement ---
  {
    id: "community_contest_winner",
    templateName: "Chúc mừng người thắng cuộc thi",
    defaultSubject: "🎉 Chúc Mừng {{winnerName}} - Nhà Vô Địch Cuộc Thi {{contestName}}!",
    defaultBody: "Kính gửi {{winnerName}},\n\nHappy Farm xin trân trọng chúc mừng bạn đã xuất sắc vượt qua hàng ngàn nông dân tài ba để giành chiến thắng thuyết phục trong cuộc thi {{contestName}} vừa qua!\n\nThành tích của bạn thật đáng ngưỡng mộ. Phần thưởng của bạn bao gồm:\n- {{reward1Description}}\n- {{reward2Description}}\n\nPhần thưởng sẽ được gửi đến bạn qua thư này (nếu đính kèm) hoặc trong thời gian sớm nhất.\n\nCảm ơn bạn đã tham gia và làm cho cộng đồng Happy Farm thêm sôi động và hấp dẫn!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 500 }], // Example, specific rewards would be set by admin
    placeholders: ["{{winnerName}}", "{{contestName}}", "{{reward1Description}}", "{{reward2Description}}"],
  },
  {
    id: "community_feedback_request",
    templateName: "Yêu cầu phản hồi/khảo sát",
    defaultSubject: "📝 Góp Ý Cùng Happy Farm - Nhận Quà Liền Tay!",
    defaultBody: "Chào {{playerName}},\n\nĐể Happy Farm ngày càng hoàn thiện hơn và mang đến những trải nghiệm tốt nhất cho bạn, chúng tôi rất mong nhận được những ý kiến đóng góp quý báu. Vui lòng dành chút thời gian tham gia khảo sát ngắn tại: {{surveyLink}}\n\nSau khi hoàn thành, bạn sẽ nhận được một phần quà nhỏ từ Happy Farm như một lời cảm ơn chân thành.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'item', itemId: 't1_basicGrow', quantity: 2 }],
    placeholders: ["{{playerName}}", "{{surveyLink}}"],
  },
  // --- Player Support & Info ---
  {
    id: "support_bug_compensation",
    templateName: "Đền bù lỗi game",
    defaultSubject: "🎁 Quà Đền Bù Sự Cố {{issueName}} Tại Happy Farm",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi thành thật xin lỗi về sự cố {{issueName}} đã xảy ra vào ngày {{dateOfIssue}}, có thể đã gây ảnh hưởng đến trải nghiệm của bạn tại Happy Farm.\n\nĐội ngũ kỹ thuật đã nỗ lực khắc phục. Để đền bù cho sự bất tiện này, Happy Farm xin gửi tặng bạn một phần quà nhỏ. Mong bạn nhận lấy.\n\nCảm ơn sự thông cảm và tiếp tục đồng hành của bạn.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 100 }, { type: 'xp', amount: 50 }],
    placeholders: ["{{playerName}}", "{{issueName}}", "{{dateOfIssue}}"],
  },
  {
    id: "info_account_warning",
    templateName: "Cảnh báo tài khoản (chung)",
    defaultSubject: "⚠️ Thông Báo Quan Trọng Về Tài Khoản Happy Farm Của Bạn",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi ghi nhận hoạt động {{warningReason}} từ tài khoản của bạn. Điều này có thể vi phạm quy định của trò chơi. Vui lòng xem xét lại và tuân thủ các điều khoản để đảm bảo một môi trường công bằng và vui vẻ cho tất cả người chơi.\n\nNếu bạn có bất kỳ thắc mắc nào hoặc cho rằng đây là một sự nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{warningReason}}"],
  },
  {
    id: "info_chat_ban",
    templateName: "Thông báo cấm chat",
    defaultSubject: "🚫 Thông Báo: Tài Khoản Bị Hạn Chế Tính Năng Chat",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi rất tiếc phải thông báo rằng tài khoản của bạn đã bị hạn chế tính năng chat do vi phạm quy tắc cộng đồng {{reasonForBan}}. Thời gian hạn chế là {{banDuration}}.\n\nVui lòng xem lại quy tắc ứng xử của Happy Farm. Chúng tôi mong muốn một môi trường thân thiện cho tất cả người chơi.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}", "{{reasonForBan}}", "{{banDuration}}"],
  },
  {
    id: "info_chat_unban",
    templateName: "Thông báo gỡ cấm chat",
    defaultSubject: "✅ Thông Báo: Tài Khoản Đã Được Gỡ Hạn Chế Chat",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi xin thông báo rằng hạn chế tính năng chat trên tài khoản của bạn đã được gỡ bỏ. Bạn có thể tiếp tục trò chuyện cùng mọi người.\n\nHãy cùng nhau xây dựng một cộng đồng Happy Farm văn minh và vui vẻ nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [],
    placeholders: ["{{playerName}}"],
  },
  // --- General Purpose & Greetings ---
  {
    id: "general_thank_you",
    templateName: "Thư cảm ơn chung",
    defaultSubject: "💖 Cảm Ơn {{playerName}} Đã Đồng Hành Cùng Happy Farm!",
    defaultBody: "Chào {{playerName}},\n\nĐội ngũ Happy Farm xin gửi lời cảm ơn chân thành đến bạn vì đã luôn yêu mến, ủng hộ và là một phần quan trọng của cộng đồng chúng tôi.\n\nSự đồng hành của bạn là nguồn động lực to lớn để chúng tôi không ngừng phát triển và mang đến những trải nghiệm tốt hơn mỗi ngày.\n\nChúc bạn một ngày thật nhiều niềm vui và may mắn!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'item', itemId: 'tomatoSeed', quantity: 3 }],
    placeholders: ["{{playerName}}"],
  },
  {
    id: "general_happy_holiday",
    templateName: "Chúc mừng ngày lễ (chung)",
    defaultSubject: "🎉 Chúc Mừng Ngày Lễ {{holidayName}} Vui Vẻ!",
    defaultBody: "Chào {{playerName}},\n\nNhân dịp lễ {{holidayName}}, đội ngũ Happy Farm xin kính chúc bạn và gia đình có những khoảnh khắc thật vui vẻ, ấm áp và ngập tràn ý nghĩa bên những người thân yêu.\n\nChúng tôi cũng xin gửi tặng bạn một món quà nhỏ nhân dịp này, mong bạn sẽ thích.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 100 }, { type: 'xp', amount: 50 }],
    placeholders: ["{{playerName}}", "{{holidayName}}"],
  },
  {
    id: "general_inactivity_nudge",
    templateName: "Nhắc nhở người chơi không hoạt động",
    defaultSubject: "🤔 Nông Trại Nhớ Bạn Lắm Đấy, {{playerName}}!",
    defaultBody: "Chào {{playerName}},\n\nĐã một thời gian rồi không thấy bạn ghé thăm nông trại. Cây cối xơ xác, vật nuôi thì ngóng trông! Đùa thôi, nhưng chúng tôi thật sự nhớ bạn đấy!\n\nHãy quay lại Happy Farm để tiếp tục chăm sóc và phát triển cơ ngơi của mình nhé. Có nhiều điều thú vị và những cập nhật mới đang chờ bạn khám phá!\n\nĐừng quên, có một món quà nhỏ chào mừng bạn trở lại đang chờ trong hòm thư!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 150 }, { type: 'item', itemId: 't1_quickSoil', quantity: 1 }],
    placeholders: ["{{playerName}}"],
  },
  {
    id: "general_login_bonus_special",
    templateName: "Thưởng đăng nhập đặc biệt",
    defaultSubject: "🎁 Quà Tặng Đăng Nhập Đặc Biệt Hôm Nay Dành Cho {{playerName}}!",
    defaultBody: "Chào {{playerName}},\n\nXin chúc mừng! Hôm nay là một ngày đặc biệt và Happy Farm có một món quà bất ngờ dành riêng cho bạn khi đăng nhập.\n\nHãy nhận lấy và sử dụng nó để làm cho nông trại của bạn thêm phần khởi sắc nhé! Chúc bạn một ngày bội thu.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'xp', amount: 100 }, { type: 'item', itemId: 'strawberrySeed', quantity: 5 }],
    placeholders: ["{{playerName}}"],
  },
  {
    id: "general_apology",
    templateName: "Thư xin lỗi chung",
    defaultSubject: "✉️ Lời Xin Lỗi Chân Thành Từ Đội Ngũ Happy Farm",
    defaultBody: "Chào {{playerName}},\n\nChúng tôi vô cùng xin lỗi vì {{reasonForApology}} đã xảy ra, gây ảnh hưởng đến trải nghiệm của bạn tại Happy Farm. Chúng tôi hiểu rằng điều này có thể gây ra sự bất tiện và thất vọng.\n\nĐội ngũ kỹ thuật đang nỗ lực hết mình để khắc phục vấn đề (nếu chưa) và cam kết sẽ mang đến một môi trường chơi game tốt hơn. Để bày tỏ sự chân thành, xin gửi bạn một phần quà nhỏ.\n\nMong bạn thông cảm và tiếp tục ủng hộ Happy Farm.\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'gold', amount: 50 }, {type: 'item', itemId: 't1_basicGrow', quantity: 1}],
    placeholders: ["{{playerName}}", "{{reasonForApology}}"],
  },
  {
    id: "achievement_unlocked_generic",
    templateName: "Chúc mừng mở khóa thành tựu",
    defaultSubject: "🌟 Chúc Mừng {{playerName}}! Bạn Đã Mở Khóa Thành Tựu '{{achievementName}}'!",
    defaultBody: "Chào {{playerName}},\n\nTuyệt vời! Với sự kiên trì và kỹ năng của mình, bạn đã xuất sắc hoàn thành và mở khóa thành tựu: '{{achievementName}}'.\n\nĐây là phần thưởng xứng đáng ghi nhận sự cố gắng của bạn. Hãy tiếp tục chinh phục những thử thách mới và đạt được nhiều thành tựu hơn nữa nhé!\n\nTrân trọng,\nĐội ngũ Happy Farm",
    defaultRewards: [{ type: 'xp', amount: 75 }],
    placeholders: ["{{playerName}}", "{{achievementName}}"],
  },
];
