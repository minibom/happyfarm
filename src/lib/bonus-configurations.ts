
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
    id: "recurring_weekly_top10", // Example: Top 10 weekly leaderboard
    triggerType: "leaderboardWeekly",
    triggerValue: "top10", // Cloud Function would parse this string
    description: "Phần thưởng hàng tuần cho Top 10 người chơi trên Bảng Xếp Hạng (Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'item', itemId: 't2_farmBoost', quantity: 3 },
      { type: 'item', itemId: 'cornSeed', quantity: 10 },
    ],
    mailSubject: "Vinh danh Top 10 Bảng Xếp Hạng Tuần!",
    mailBody: "Xin chúc mừng! Bạn đã xuất sắc lọt vào Top 10 trên Bảng Xếp Hạng tuần này của Happy Farm.\n\nĐây là phần thưởng dành cho những nỗ lực không ngừng của bạn. Hãy tiếp tục cố gắng và giữ vững vị trí nhé!",
    isEnabled: true, // This would typically be managed by a scheduled function
  },
  {
    id: "recurring_monthly_top50", // Example: Top 50 monthly leaderboard
    triggerType: "leaderboardMonthly",
    triggerValue: "top50", // Cloud Function would parse this string
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
  // Add more configurations as needed for other tiers, events, etc.
];
