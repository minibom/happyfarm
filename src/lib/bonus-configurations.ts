
import type { BonusConfiguration } from '@/types';

export const BONUS_CONFIGURATIONS_DATA: BonusConfiguration[] = [
  {
    id: "firstLogin_welcome",
    triggerType: "firstLogin",
    description: "Quà chào mừng người chơi mới khi đăng nhập lần đầu.",
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'item', itemId: 'tomatoSeed', quantity: 10 },
      { type: 'item', itemId: 'carrotSeed', quantity: 5 },
    ],
    mailSubject: "Chào mừng bạn đến với Happy Farm!",
    mailBody: "Chào mừng bạn đến với thế giới Happy Farm! Hy vọng bạn sẽ có những giây phút thư giãn và vui vẻ tại nông trại của chúng tôi.\n\nĐây là một món quà nhỏ để bạn bắt đầu cuộc hành trình của mình. Chúc bạn may mắn và bội thu!",
    isEnabled: true,
  },
  {
    id: "tierUp_2",
    triggerType: "tierUp",
    triggerValue: 2, // Represents Tier 2
    description: "Phần thưởng khi người chơi đạt Bậc 2 - Chủ Vườn Chăm Chỉ.",
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'xp', amount: 150 },
      { type: 'item', itemId: 'strawberrySeed', quantity: 5 },
      { type: 'item', itemId: 't1_basicGrow', quantity: 2 },
    ],
    mailSubject: "Chúc mừng bạn đã lên Bậc 2!",
    mailBody: "Thật tuyệt vời! Bạn đã chăm chỉ làm việc và đạt được Bậc 2 - Chủ Vườn Chăm Chỉ.\n\nĐây là phần thưởng xứng đáng cho những nỗ lực của bạn. Hãy tiếp tục phát triển nông trại và khám phá những điều mới mẻ nhé!",
    isEnabled: true,
  },
  {
    id: "tierUp_3",
    triggerType: "tierUp",
    triggerValue: 3, // Represents Tier 3
    description: "Phần thưởng khi người chơi đạt Bậc 3 - Nhà Trồng Trọt Khéo Léo.",
    rewards: [
      { type: 'gold', amount: 500 },
      { type: 'xp', amount: 300 },
      { type: 'item', itemId: 'blueberrySeed', quantity: 5 },
      { type: 'item', itemId: 't1_quickSoil', quantity: 3 },
    ],
    mailSubject: "Chúc mừng thăng hạng lên Bậc 3!",
    mailBody: "Xuất sắc! Kỹ năng nông trại của bạn đã được nâng lên một tầm cao mới khi đạt Bậc 3 - Nhà Trồng Trọt Khéo Léo.\n\nNhận lấy phần thưởng này và tiếp tục hành trình trở thành một nông dân tài ba!",
    isEnabled: true,
  },
  {
    id: "tierUp_5", // New: Reward for Tier 5
    triggerType: "tierUp",
    triggerValue: 5, // Represents Tier 5
    description: "Phần thưởng khi người chơi đạt Bậc 5 - Bậc Thầy Nông Sản.",
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'appleSeed', quantity: 10 },
      { type: 'item', itemId: 't3_powerGro', quantity: 5 },
    ],
    mailSubject: "Tuyệt Vời! Bạn Đã Đạt Bậc 5!",
    mailBody: "Không thể tin được! Bạn đã vươn tới Bậc 5 - Bậc Thầy Nông Sản! Nông trại của bạn chắc chắn đang rất thịnh vượng.\n\nPhần thưởng này là để ghi nhận sự kiên trì và tài năng của bạn. Hãy tiếp tục làm nên những điều kỳ diệu!",
    isEnabled: true,
  },
  {
    id: "firstPlotUnlock_reward", // New: Reward for first plot unlock (beyond initial)
    triggerType: "firstPlotUnlock",
    // No triggerValue needed, as it's the first time after initial plots
    description: "Phần thưởng khi người chơi mở khóa ô đất đầu tiên (sau các ô ban đầu).",
    rewards: [
      { type: 'gold', amount: 50 },
      { type: 'xp', amount: 25 },
      { type: 'item', itemId: 'cornSeed', quantity: 3 },
    ],
    mailSubject: "Mở Rộng Lãnh Thổ!",
    mailBody: "Chúc mừng bạn đã mở khóa thành công ô đất mới! Nông trại của bạn ngày càng rộng lớn hơn.\n\nHãy gieo trồng và gặt hái thật nhiều thành quả trên mảnh đất mới này nhé!",
    isEnabled: true,
  },
  {
    id: "plotsUnlocked_15", // New: Reward for unlocking 15 plots
    triggerType: "specialEvent", // Use specialEvent for manual check or specific plot count check
    triggerValue: "plots_15", // Admin/system can check for this specific value
    description: "Thưởng khi người chơi mở khóa được 15 ô đất.",
    rewards: [
        { type: 'gold', amount: 250 },
        { type: 'item', itemId: 't2_richEarth', quantity: 3 },
    ],
    mailSubject: "Nông Trại Mở Rộng!",
    mailBody: "Chúc mừng bạn đã mở rộng nông trại lên đến 15 ô đất! Đây là một cột mốc quan trọng.\n\nNhận lấy phần thưởng này và tiếp tục phát triển nhé!",
    isEnabled: true,
  },
  {
    id: "event_summerFestival_login", // New: Example for a special event login
    triggerType: "specialEvent",
    triggerValue: "summer_festival_login_day1", // Unique ID for this event's first day login
    description: "Quà đăng nhập ngày 1 - Sự kiện Lễ Hội Mùa Hè.",
    rewards: [
      { type: 'item', itemId: 'watermelonSeed', quantity: 5 },
      { type: 'item', itemId: 't1_speedySprout', quantity: 2 },
    ],
    mailSubject: "☀️ Chào Mừng Lễ Hội Mùa Hè!",
    mailBody: "Lễ Hội Mùa Hè đã đến Happy Farm! Đăng nhập mỗi ngày để nhận những phần quà hấp dẫn.\n\nĐây là quà tặng cho ngày đầu tiên của bạn. Chúc bạn có một mùa hè thật vui vẻ!",
    isEnabled: true, // Admin would enable this during the event
  },
  {
    id: "daily_login_reward_conceptual", // New: Conceptual daily login bonus
    triggerType: "specialEvent", // Could be 'dailyLogin' if such a triggerType is implemented
    triggerValue: "daily_reward_cycle_1", // System would cycle through these
    description: "Phần thưởng đăng nhập hàng ngày (Ý tưởng - Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 20 },
      { type: 'xp', amount: 10 },
    ],
    mailSubject: "🎁 Quà Đăng Nhập Hàng Ngày!",
    mailBody: "Cảm ơn bạn đã ghé thăm nông trại hôm nay! Đây là một chút quà nhỏ khích lệ từ Happy Farm.\n\nChúc bạn một ngày làm việc hiệu quả!",
    isEnabled: true, // Requires a system to reset claim status daily
  },
  {
    id: "recurring_weekly_top10",
    triggerType: "leaderboardWeekly",
    triggerValue: "top10",
    description: "Phần thưởng hàng tuần cho Top 10 người chơi trên Bảng Xếp Hạng (Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'item', itemId: 't2_farmBoost', quantity: 3 },
      { type: 'item', itemId: 'cornSeed', quantity: 10 },
    ],
    mailSubject: "Vinh danh Top 10 Bảng Xếp Hạng Tuần!",
    mailBody: "Xin chúc mừng! Bạn đã xuất sắc lọt vào Top 10 trên Bảng Xếp Hạng tuần này của Happy Farm.\n\nĐây là phần thưởng dành cho những nỗ lực không ngừng của bạn. Hãy tiếp tục cố gắng và giữ vững vị trí nhé!",
    isEnabled: true,
  },
  {
    id: "recurring_monthly_top50",
    triggerType: "leaderboardMonthly",
    triggerValue: "top50",
    description: "Phần thưởng hàng tháng cho Top 50 người chơi trên Bảng Xếp Hạng (Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 750 },
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'onionSeed', quantity: 15 },
    ],
    mailSubject: "Chúc mừng Top 50 Bảng Xếp Hạng Tháng!",
    mailBody: "Thật đáng tự hào! Bạn đã có mặt trong Top 50 Bảng Xếp Hạng tháng này.\n\nHappy Farm xin gửi tặng bạn phần quà này như một lời tri ân. Chúc bạn tiếp tục có những trải nghiệm tuyệt vời!",
    isEnabled: true,
  },
];

