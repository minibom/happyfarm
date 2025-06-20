
import type { BonusConfiguration } from '@/types';
import { TIER_DATA } from './tier-data'; 

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
    triggerValue: 2,
    description: `Phần thưởng khi người chơi đạt Bậc 2 - ${TIER_DATA[1].name}.`,
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'xp', amount: 150 },
      { type: 'item', itemId: 'strawberrySeed', quantity: 5 },
      { type: 'item', itemId: 't1_basicGrow', quantity: 2 },
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 2 - ${TIER_DATA[1].name}!`,
    mailBody: `Thật tuyệt vời! Bạn đã chăm chỉ làm việc và đạt được Bậc 2 - ${TIER_DATA[1].name}.\n\nĐây là phần thưởng xứng đáng cho những nỗ lực của bạn. Hãy tiếp tục phát triển nông trại và khám phá những điều mới mẻ nhé!`,
    isEnabled: true,
  },
  {
    id: "tierUp_3",
    triggerType: "tierUp",
    triggerValue: 3,
    description: `Phần thưởng khi người chơi đạt Bậc 3 - ${TIER_DATA[2].name}.`,
    rewards: [
      { type: 'gold', amount: 500 },
      { type: 'xp', amount: 300 },
      { type: 'item', itemId: 'blueberrySeed', quantity: 5 },
      { type: 'item', itemId: 't1_quickSoil', quantity: 3 },
    ],
    mailSubject: `Chúc mừng thăng hạng lên Bậc 3 - ${TIER_DATA[2].name}!`,
    mailBody: `Xuất sắc! Kỹ năng nông trại của bạn đã được nâng lên một tầm cao mới khi đạt Bậc 3 - ${TIER_DATA[2].name}.\n\nNhận lấy phần thưởng này và tiếp tục hành trình trở thành một nông dân tài ba!`,
    isEnabled: true,
  },
  {
    id: "tierUp_4",
    triggerType: "tierUp",
    triggerValue: 4,
    description: `Phần thưởng khi người chơi đạt Bậc 4 - ${TIER_DATA[3].name}.`,
    rewards: [
      { type: 'gold', amount: 750 },
      { type: 'xp', amount: 400 },
      { type: 'item', itemId: 'mangoSeed', quantity: 3 },
      { type: 'item', itemId: 't2_farmBoost', quantity: 1 }, // Changed from t4_superFert as Tier 4 doesn't unlock t4 items yet
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 4 - ${TIER_DATA[3].name}!`,
    mailBody: `Tuyệt vời! Bạn đã đạt Bậc 4 - ${TIER_DATA[3].name}.\n\nPhần thưởng này dành cho bạn. Hãy tiếp tục khám phá nhé!`,
    isEnabled: true,
  },
  {
    id: "tierUp_5",
    triggerType: "tierUp",
    triggerValue: 5,
    description: `Phần thưởng khi người chơi đạt Bậc 5 - ${TIER_DATA[4].name}.`,
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'appleSeed', quantity: 10 },
      { type: 'item', itemId: 't3_powerGro', quantity: 2 }, // Adjusted quantity
    ],
    mailSubject: `Tuyệt Vời! Bạn Đã Đạt Bậc 5 - ${TIER_DATA[4].name}!`,
    mailBody: `Không thể tin được! Bạn đã vươn tới Bậc 5 - ${TIER_DATA[4].name}! Nông trại của bạn chắc chắn đang rất thịnh vượng.\n\nPhần thưởng này là để ghi nhận sự kiên trì và tài năng của bạn. Hãy tiếp tục làm nên những điều kỳ diệu!`,
    isEnabled: true,
  },
  {
    id: "tierUp_6",
    triggerType: "tierUp",
    triggerValue: 6,
    description: `Phần thưởng khi người chơi đạt Bậc 6 - ${TIER_DATA[5].name}.`,
    rewards: [
      { type: 'gold', amount: 1200 },
      { type: 'xp', amount: 600 },
      { type: 'item', itemId: 'grapesSeed', quantity: 5 },
      { type: 'item', itemId: 't4_superFert', quantity: 1 }, // Tier 4 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 6 - ${TIER_DATA[5].name}!`,
    mailBody: `Tuyệt vời! Bạn đã đạt Bậc 6 - ${TIER_DATA[5].name}.\n\nPhần thưởng này dành cho bạn. Hãy tiếp tục khám phá nhé!`,
    isEnabled: true,
  },
  {
    id: "tierUp_7",
    triggerType: "tierUp",
    triggerValue: 7,
    description: `Phần thưởng khi người chơi đạt Bậc 7 - ${TIER_DATA[6].name}.`,
    rewards: [
      { type: 'gold', amount: 1500 },
      { type: 'xp', amount: 750 },
      { type: 'item', itemId: 'peachSeed', quantity: 3 },
      { type: 'item', itemId: 't5_ultraNutrient', quantity: 1 }, // Tier 5 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 7 - ${TIER_DATA[6].name}!`,
    mailBody: `Thật đáng nể! Bạn đã chinh phục Bậc 7 - ${TIER_DATA[6].name}.\n\nNhận lấy phần thưởng và tiếp tục hành trình!`,
    isEnabled: true,
  },
  {
    id: "tierUp_8",
    triggerType: "tierUp",
    triggerValue: 8,
    description: `Phần thưởng khi người chơi đạt Bậc 8 - ${TIER_DATA[7].name}.`,
    rewards: [
      { type: 'gold', amount: 1800 },
      { type: 'xp', amount: 900 },
      { type: 'item', itemId: 'cherrySeed', quantity: 5 },
      { type: 'item', itemId: 't6_gigaGro', quantity: 1 }, // Tier 6 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 8 - ${TIER_DATA[7].name}!`,
    mailBody: `Xuất sắc! Bậc 8 - ${TIER_DATA[7].name} đã nằm trong tay bạn.\n\nĐây là phần thưởng xứng đáng cho những nỗ lực của bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_9",
    triggerType: "tierUp",
    triggerValue: 9,
    description: `Phần thưởng khi người chơi đạt Bậc 9 - ${TIER_DATA[8].name}.`,
    rewards: [
      { type: 'gold', amount: 2200 },
      { type: 'xp', amount: 1100 },
      { type: 'item', itemId: 'watermelonSeed', quantity: 3 },
      { type: 'item', itemId: 't7_megaFertilizer', quantity: 1 }, // Tier 7 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 9 - ${TIER_DATA[8].name}!`,
    mailBody: `Quá ấn tượng! Bạn đã chạm tới Bậc 9 - ${TIER_DATA[8].name}.\n\nPhần thưởng này là của bạn, hãy sử dụng thật tốt nhé!`,
    isEnabled: true,
  },
  {
    id: "tierUp_10",
    triggerType: "tierUp",
    triggerValue: 10,
    description: `Phần thưởng khi người chơi đạt Bậc 10 - ${TIER_DATA[9].name}.`,
    rewards: [
      { type: 'gold', amount: 2600 },
      { type: 'xp', amount: 1300 },
      { type: 'item', itemId: 'pineappleSeed', quantity: 5 },
      { type: 'item', itemId: 't8_cosmicCompost', quantity: 1 }, // Tier 8 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 10 - ${TIER_DATA[9].name}!`,
    mailBody: `Một cột mốc đáng nhớ! Bạn đã đạt Bậc 10 - ${TIER_DATA[9].name}.\n\nĐây là phần thưởng tuyệt vời cho hành trình của bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_11",
    triggerType: "tierUp",
    triggerValue: 11,
    description: `Phần thưởng khi người chơi đạt Bậc 11 - ${TIER_DATA[10].name}.`,
    rewards: [
      { type: 'gold', amount: 3000 },
      { type: 'xp', amount: 1500 },
      { type: 'item', itemId: 'celestialCarrotSeed', quantity: 3 },
      { type: 'item', itemId: 't9_divineElixir', quantity: 1 }, // Tier 9 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 11 - ${TIER_DATA[10].name}!`,
    mailBody: `Thật đáng kinh ngạc! Bạn đã mở khóa Bậc 11 - ${TIER_DATA[10].name}.\n\nHãy nhận lấy phần thưởng và tiếp tục chinh phục những thử thách mới.`,
    isEnabled: true,
  },
  {
    id: "tierUp_12",
    triggerType: "tierUp",
    triggerValue: 12,
    description: `Phần thưởng khi người chơi đạt Bậc 12 - ${TIER_DATA[11].name}.`,
    rewards: [
      { type: 'gold', amount: 3500 },
      { type: 'xp', amount: 1750 },
      { type: 'item', itemId: 'moonHerbSeed', quantity: 5 },
      { type: 'item', itemId: 't10_omnipotentOoze', quantity: 1 }, // Tier 10 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 12 - ${TIER_DATA[11].name}!`,
    mailBody: `Bạn thật sự là một nông dân tài ba khi đạt đến Bậc 12 - ${TIER_DATA[11].name}.\n\nPhần thưởng này là minh chứng cho sự chăm chỉ của bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_13",
    triggerType: "tierUp",
    triggerValue: 13,
    description: `Phần thưởng khi người chơi đạt Bậc 13 - ${TIER_DATA[12].name}.`,
    rewards: [
      { type: 'gold', amount: 4000 },
      { type: 'xp', amount: 2000 },
      { type: 'item', itemId: 'galaxyGrainSeed', quantity: 3 },
      { type: 'item', itemId: 't11_starDust', quantity: 1 }, // Tier 11 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 13 - ${TIER_DATA[12].name}!`,
    mailBody: `Không ngừng tiến bộ! Bậc 13 - ${TIER_DATA[12].name} đã được bạn chinh phục.\n\nNhận lấy phần thưởng và tiếp tục làm nên những điều vĩ đại.`,
    isEnabled: true,
  },
  {
    id: "tierUp_14",
    triggerType: "tierUp",
    triggerValue: 14,
    description: `Phần thưởng khi người chơi đạt Bậc 14 - ${TIER_DATA[13].name}.`,
    rewards: [
      { type: 'gold', amount: 4500 },
      { type: 'xp', amount: 2250 },
      { type: 'item', itemId: 'nebulaNectarineSeed', quantity: 5 },
      { type: 'item', itemId: 't12_moonEssence', quantity: 1 }, // Tier 12 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 14 - ${TIER_DATA[13].name}!`,
    mailBody: `Sức mạnh của bạn là không thể phủ nhận! Bậc 14 - ${TIER_DATA[13].name}.\n\nPhần thưởng giá trị này là dành cho bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_15",
    triggerType: "tierUp",
    triggerValue: 15,
    description: `Phần thưởng khi người chơi đạt Bậc 15 - ${TIER_DATA[14].name}.`,
    rewards: [
      { type: 'gold', amount: 5000 },
      { type: 'xp', amount: 2500 },
      { type: 'item', itemId: 'quantumQuinceSeed', quantity: 3 },
      { type: 'item', itemId: 't13_galaxyBloom', quantity: 1 }, // Tier 13 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 15 - ${TIER_DATA[14].name}!`,
    mailBody: `Một thành tựu vĩ đại! Chúc mừng bạn đã đạt Bậc 15 - ${TIER_DATA[14].name}.\n\nPhần thưởng này xứng đáng với nỗ lực của bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_16",
    triggerType: "tierUp",
    triggerValue: 16,
    description: `Phần thưởng khi người chơi đạt Bậc 16 - ${TIER_DATA[15].name}.`,
    rewards: [
      { type: 'gold', amount: 5500 },
      { type: 'xp', amount: 2750 },
      { type: 'item', itemId: 'phantomPepperSeed', quantity: 5 },
      { type: 'item', itemId: 't14_nebulaRich', quantity: 1 }, // Tier 14 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 16 - ${TIER_DATA[15].name}!`,
    mailBody: `Bạn đã vượt qua một cột mốc nữa! Chúc mừng Bậc 16 - ${TIER_DATA[15].name}.\n\nPhần thưởng này dành cho sự kiên trì của bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_17",
    triggerType: "tierUp",
    triggerValue: 17,
    description: `Phần thưởng khi người chơi đạt Bậc 17 - ${TIER_DATA[16].name}.`,
    rewards: [
      { type: 'gold', amount: 6000 },
      { type: 'xp', amount: 3000 },
      { type: 'item', itemId: 'quantumQuinceSeed', quantity: 5 }, // High tier seed
      { type: 'item', itemId: 't15_quantumGrow', quantity: 1 }, // Tier 15 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 17 - ${TIER_DATA[16].name}!`,
    mailBody: `Thật không thể tin được! Bạn đã đạt Bậc 17 - ${TIER_DATA[16].name}.\n\nSự cống hiến của bạn thật đáng ngưỡng mộ.`,
    isEnabled: true,
  },
  {
    id: "tierUp_18",
    triggerType: "tierUp",
    triggerValue: 18,
    description: `Phần thưởng khi người chơi đạt Bậc 18 - ${TIER_DATA[17].name}.`,
    rewards: [
      { type: 'gold', amount: 6500 },
      { type: 'xp', amount: 3250 },
      { type: 'item', itemId: 'phantomPepperSeed', quantity: 7 }, // High tier seed
      { type: 'item', itemId: 't15_quantumGrow', quantity: 2 }, // Tier 15 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 18 - ${TIER_DATA[17].name}!`,
    mailBody: `Bạn đang tiến gần đến đỉnh cao! Bậc 18 - ${TIER_DATA[17].name}.\n\nPhần thưởng này là động lực để bạn tiếp tục.`,
    isEnabled: true,
  },
  {
    id: "tierUp_19",
    triggerType: "tierUp",
    triggerValue: 19,
    description: `Phần thưởng khi người chơi đạt Bậc 19 - ${TIER_DATA[18].name}.`,
    rewards: [
      { type: 'gold', amount: 7000 },
      { type: 'xp', amount: 3500 },
      { type: 'item', itemId: 'quantumQuinceSeed', quantity: 7 }, // High tier seed
      { type: 'item', itemId: 't15_quantumGrow', quantity: 2 }, // Tier 15 item
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 19 - ${TIER_DATA[18].name}!`,
    mailBody: `Chỉ còn một bước nữa! Bậc 19 - ${TIER_DATA[18].name}.\n\nSự vĩ đại đang chờ đón bạn.`,
    isEnabled: true,
  },
  {
    id: "tierUp_20",
    triggerType: "tierUp",
    triggerValue: 20,
    description: `Phần thưởng khi người chơi đạt Bậc 20 - ${TIER_DATA[19].name}.`,
    rewards: [
      { type: 'gold', amount: 10000 }, // Increased gold for max tier
      { type: 'xp', amount: 5000 },   // Increased XP
      { type: 'item', itemId: 'phantomPepperSeed', quantity: 10 },
      { type: 'item', itemId: 't15_quantumGrow', quantity: 3 },
    ],
    mailSubject: `Chúc mừng bạn đã lên Bậc 20 - ${TIER_DATA[19].name}!`,
    mailBody: `Đỉnh cao danh vọng! Bạn đã là một ${TIER_DATA[19].name}.\n\nĐây là phần thưởng cao quý nhất dành cho bạn. Cảm ơn bạn đã là một phần của Happy Farm!`,
    isEnabled: true,
  },
  // --- Other Bonuses ---
  {
    id: "firstPlotUnlock_reward",
    triggerType: "firstPlotUnlock",
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
    id: "plotsUnlocked_15",
    triggerType: "specialEvent",
    triggerValue: "plots_15",
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
    id: "event_summerFestival_login",
    triggerType: "specialEvent",
    triggerValue: "summer_festival_login_day1", // Admin would trigger this by sending mail with this bonusId
    description: "Quà đăng nhập ngày 1 - Sự kiện Lễ Hội Mùa Hè.",
    rewards: [
      { type: 'item', itemId: 'watermelonSeed', quantity: 5 },
      { type: 'item', itemId: 't1_speedySprout', quantity: 2 },
    ],
    mailSubject: "☀️ Chào Mừng Lễ Hội Mùa Hè!",
    mailBody: "Lễ Hội Mùa Hè đã đến Happy Farm! Đăng nhập mỗi ngày để nhận những phần quà hấp dẫn.\n\nĐây là quà tặng cho ngày đầu tiên của bạn. Chúc bạn có một mùa hè thật vui vẻ!",
    isEnabled: true,
  },
  {
    id: "daily_login_reward_conceptual",
    triggerType: "specialEvent", // Would be triggered by a Cloud Function daily
    triggerValue: "daily_reward_cycle_1",
    description: "Phần thưởng đăng nhập hàng ngày (Ý tưởng - Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 20 },
      { type: 'xp', amount: 10 },
    ],
    mailSubject: "🎁 Quà Đăng Nhập Hàng Ngày!",
    mailBody: "Cảm ơn bạn đã ghé thăm nông trại hôm nay! Đây là một chút quà nhỏ khích lệ từ Happy Farm.\n\nChúc bạn một ngày làm việc hiệu quả!",
    isEnabled: true, // This would be enabled/disabled by admin or logic
  },
  {
    id: "recurring_weekly_top10",
    triggerType: "leaderboardWeekly", // Would be triggered by a Cloud Function weekly
    triggerValue: "top10",
    description: "Phần thưởng hàng tuần cho Top 10 người chơi trên Bảng Xếp Hạng (Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'item', itemId: 't2_farmBoost', quantity: 3 },
      { type: 'item', itemId: 'cornSeed', quantity: 10 },
    ],
    mailSubject: "Vinh danh Top 10 Bảng Xếp Hạng Tuần!",
    mailBody: "Xin chúc mừng! Bạn đã xuất sắc lọt vào Top 10 trên Bảng Xếp Hạng tuần này của Happy Farm.\n\nĐây là phần thưởng dành cho những nỗ lực không ngừng của bạn. Hãy tiếp tục cố gắng và giữ vững vị trí nhé!",
    isEnabled: true, // This would be enabled/disabled by admin or logic
  },
  {
    id: "recurring_monthly_top50",
    triggerType: "leaderboardMonthly", // Would be triggered by a Cloud Function monthly
    triggerValue: "top50",
    description: "Phần thưởng hàng tháng cho Top 50 người chơi trên Bảng Xếp Hạng (Cần Cloud Function).",
    rewards: [
      { type: 'gold', amount: 750 },
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'onionSeed', quantity: 15 },
    ],
    mailSubject: "Chúc mừng Top 50 Bảng Xếp Hạng Tháng!",
    mailBody: "Thật đáng tự hào! Bạn đã có mặt trong Top 50 Bảng Xếp Hạng tháng này.\n\nHappy Farm xin gửi tặng bạn phần quà này như một lời tri ân. Chúc bạn tiếp tục có những trải nghiệm tuyệt vời!",
    isEnabled: true, // This would be enabled/disabled by admin or logic
  },
];
