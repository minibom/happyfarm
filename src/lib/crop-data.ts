
import type { CropDetails, CropId, SeedId } from '@/types';

// Base times and prices for Tier 10 crops for scaling
const T10_PINEAPPLE_TIMES = { growing: 3600000 * 10, ready: 7200000 * 10 }; // Adjusted base T10 time
const T10_PINEAPPLE_PRICES = { seed: 280, crop: 330 }; // Adjusted base T10 price
const T10_PINEAPPLE_YIELD = 10; // Base yield is an integer

// Crop definitions and related identifiers
export const CROP_DATA: Record<CropId, CropDetails> = {
  // --- Tier 1 ---
  tomato: { name: 'Cà Chua', seedName: 'tomatoSeed', icon: '🍅', timeToGrowing: 45000, timeToReady: 90000, harvestYield: 3, seedPrice: 5, cropPrice: 2, unlockTier: 1 },
  carrot: { name: 'Cà Rốt', seedName: 'carrotSeed', icon: '🥕', timeToGrowing: 60000, timeToReady: 120000, harvestYield: 2, seedPrice: 8, cropPrice: 5, unlockTier: 1 },
  corn: { name: 'Ngô', seedName: 'cornSeed', icon: '🌽', timeToGrowing: 75000, timeToReady: 150000, harvestYield: 1, seedPrice: 12, cropPrice: 15, unlockTier: 1 },
  strawberry: { name: 'Dâu Tây', seedName: 'strawberrySeed', icon: '🍓', timeToGrowing: 30000, timeToReady: 60000, harvestYield: 4, seedPrice: 10, cropPrice: 3, unlockTier: 1 },
  potato: { name: 'Khoai Tây', seedName: 'potatoSeed', icon: '🥔', timeToGrowing: 90000, timeToReady: 180000, harvestYield: 4, seedPrice: 7, cropPrice: 2, unlockTier: 1 },
  lettuce: { name: 'Xà Lách', seedName: 'lettuceSeed', icon: '🥬', timeToGrowing: 45000, timeToReady: 90000, harvestYield: 1, seedPrice: 4, cropPrice: 5, unlockTier: 1 },
  
  // --- Tier 2 ---
  blueberry: { name: 'Việt Quất', seedName: 'blueberrySeed', icon: '🫐', timeToGrowing: 150000, timeToReady: 300000, harvestYield: 5, seedPrice: 12, cropPrice: 3, unlockTier: 2 },
  onion: { name: 'Hành Tây', seedName: 'onionSeed', icon: '🧅', timeToGrowing: 120000, timeToReady: 240000, harvestYield: 3, seedPrice: 6, cropPrice: 2, unlockTier: 2 },
  cucumber: { name: 'Dưa Chuột', seedName: 'cucumberSeed', icon: '🥒', timeToGrowing: 105000, timeToReady: 210000, harvestYield: 2, seedPrice: 5, cropPrice: 3, unlockTier: 2 },
  spinach: { name: 'Rau Bina', seedName: 'spinachSeed', icon: '🍃', timeToGrowing: 75000, timeToReady: 150000, harvestYield: 2, seedPrice: 3, cropPrice: 2, unlockTier: 2 },
  radish: { name: 'Củ Cải Đỏ', seedName: 'radishSeed', icon: '🔴', timeToGrowing: 90000, timeToReady: 180000, harvestYield: 3, seedPrice: 6, cropPrice: 3, unlockTier: 2 },
  peas: { name: 'Đậu Hà Lan', seedName: 'peasSeed', icon: '🫛', timeToGrowing: 105000, timeToReady: 210000, harvestYield: 10, seedPrice: 9, cropPrice: 1, unlockTier: 2 }, // Used beans emoji for peas
  
  // --- Tier 3 ---
  lemon: { name: 'Chanh Vàng', seedName: 'lemonSeed', icon: '🍋', timeToGrowing: 300000, timeToReady: 600000, harvestYield: 4, seedPrice: 9, cropPrice: 3, unlockTier: 3 },
  eggplant: { name: 'Cà Tím', seedName: 'eggplantSeed', icon: '🍆', timeToGrowing: 330000, timeToReady: 660000, harvestYield: 3, seedPrice: 11, cropPrice: 4, unlockTier: 3 },
  garlic: { name: 'Tỏi', seedName: 'garlicSeed', icon: '🧄', timeToGrowing: 240000, timeToReady: 480000, harvestYield: 5, seedPrice: 8, cropPrice: 2, unlockTier: 3 },
  zucchini: { name: 'Bí Ngòi Xanh', seedName: 'zucchiniSeed', icon: '🟩', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 2, seedPrice: 7, cropPrice: 4, unlockTier: 3 }, // Green square for Zucchini
  celery: { name: 'Cần Tây', seedName: 'celerySeed', icon: '🌿', timeToGrowing: 225000, timeToReady: 450000, harvestYield: 1, seedPrice: 5, cropPrice: 6, unlockTier: 3 },
  turnip: { name: 'Củ Cải Turnip', seedName: 'turnipSeed', icon: '🟣', timeToGrowing: 210000, timeToReady: 420000, harvestYield: 2, seedPrice: 6, cropPrice: 4, unlockTier: 3 },
  
  // --- Tier 4 (Adjusted scaling) ---
  mango: { name: 'Xoài', seedName: 'mangoSeed', icon: '🥭', timeToGrowing: 1200000, timeToReady: 2400000, harvestYield: 5, seedPrice: 30, cropPrice: 20, unlockTier: 4 },
  broccoli: { name: 'Bông Cải Xanh', seedName: 'broccoliSeed', icon: '🥦', timeToGrowing: 900000, timeToReady: 1800000, harvestYield: 2, seedPrice: 20, cropPrice: 25, unlockTier: 4 },
  bellpepper: { name: 'Ớt Chuông', seedName: 'bellpepperSeed', icon: '🫑', timeToGrowing: 960000, timeToReady: 1920000, harvestYield: 6, seedPrice: 26, cropPrice: 10, unlockTier: 4 },
  cabbage: { name: 'Bắp Cải', seedName: 'cabbageSeed', icon: '🥬', timeToGrowing: 780000, timeToReady: 1560000, harvestYield: 2, seedPrice: 14, cropPrice: 16, unlockTier: 4 },
  cauliflower: { name: 'Súp Lơ Trắng', seedName: 'cauliflowerSeed', icon: '☁️', timeToGrowing: 900000, timeToReady: 1800000, harvestYield: 2, seedPrice: 22, cropPrice: 26, unlockTier: 4 },
  beetroot: { name: 'Củ Dền', seedName: 'beetrootSeed', icon: '🔴', timeToGrowing: 720000, timeToReady: 1440000, harvestYield: 4, seedPrice: 16, cropPrice: 10, unlockTier: 4 },
  
  // --- Tier 5 (Adjusted scaling) ---
  kiwi: { name: 'Kiwi', seedName: 'kiwiSeed', icon: '🥝', timeToGrowing: 1800000, timeToReady: 3600000, harvestYield: 6, seedPrice: 40, cropPrice: 15, unlockTier: 5 },
  apple: { name: 'Táo Đỏ', seedName: 'appleSeed', icon: '🍎', timeToGrowing: 1950000, timeToReady: 3900000, harvestYield: 4, seedPrice: 35, cropPrice: 20, unlockTier: 5 },
  banana: { name: 'Chuối', seedName: 'bananaSeed', icon: '🍌', timeToGrowing: 1650000, timeToReady: 3300000, harvestYield: 10, seedPrice: 32, cropPrice: 7, unlockTier: 5 },
  sweetpotato: { name: 'Khoai Lang', seedName: 'sweetpotatoSeed', icon: '🍠', timeToGrowing: 1500000, timeToReady: 3000000, harvestYield: 6, seedPrice: 22, cropPrice: 10, unlockTier: 5 },
  ginger: { name: 'Gừng', seedName: 'gingerSeed', icon: '🫚', timeToGrowing: 1725000, timeToReady: 3450000, harvestYield: 6, seedPrice: 34, cropPrice: 12, unlockTier: 5 },
  soybean: { name: 'Đậu Nành', seedName: 'soybeanSeed', icon: '🫘', timeToGrowing: 1800000, timeToReady: 3600000, harvestYield: 15, seedPrice: 25, cropPrice: 5, unlockTier: 5 },

  // --- Tier 6 (Adjusted scaling) ---
  grapes: { name: 'Nho', seedName: 'grapesSeed', icon: '🍇', timeToGrowing: 3600000, timeToReady: 7200000, harvestYield: 20, seedPrice: 55, cropPrice: 6, unlockTier: 6 },
  greenapple: { name: 'Táo Xanh', seedName: 'greenappleSeed', icon: '🍏', timeToGrowing: 3300000, timeToReady: 6600000, harvestYield: 5, seedPrice: 45, cropPrice: 22, unlockTier: 6 },
  peanut: { name: 'Đậu Phộng', seedName: 'peanutSeed', icon: '🥜', timeToGrowing: 3000000, timeToReady: 6000000, harvestYield: 20, seedPrice: 38, cropPrice: 3, unlockTier: 6 },
  chilipepper: { name: 'Ớt Cay', seedName: 'chilipepperSeed', icon: '🌶️', timeToGrowing: 2800000, timeToReady: 5600000, harvestYield: 15, seedPrice: 30, cropPrice: 5, unlockTier: 6 },
  papaya: { name: 'Đu Đủ', seedName: 'papayaSeed', icon: '🥭', timeToGrowing: 3800000, timeToReady: 7600000, harvestYield: 4, seedPrice: 60, cropPrice: 30, unlockTier: 6 }, // Papaya icon is Mango, but distinct enough
  leek: { name: 'Tỏi Tây (Boa-rô)', seedName: 'leekSeed', icon: '🌿', timeToGrowing: 2900000, timeToReady: 5800000, harvestYield: 3, seedPrice: 20, cropPrice: 12, unlockTier: 6 }, // Changed icon

  // --- Tier 7 (Adjusted scaling) ---
  peach: { name: 'Đào', seedName: 'peachSeed', icon: '🍑', timeToGrowing: 7200000, timeToReady: 14400000, harvestYield: 6, seedPrice: 90, cropPrice: 50, unlockTier: 7 },
  pear: { name: 'Lê', seedName: 'pearSeed', icon: '🍐', timeToGrowing: 7800000, timeToReady: 15600000, harvestYield: 5, seedPrice: 85, cropPrice: 45, unlockTier: 7 },
  mushroom: { name: 'Nấm', seedName: 'mushroomSeed', icon: '🍄', timeToGrowing: 6300000, timeToReady: 12600000, harvestYield: 12, seedPrice: 75, cropPrice: 15, unlockTier: 7 },
  sugarcane: { name: 'Mía', seedName: 'sugarcaneSeed', icon: '🎋', timeToGrowing: 9000000, timeToReady: 18000000, harvestYield: 6, seedPrice: 70, cropPrice: 30, unlockTier: 7 },
  plum: { name: 'Mận', seedName: 'plumSeed', icon: '💜', timeToGrowing: 8100000, timeToReady: 16200000, harvestYield: 8, seedPrice: 95, cropPrice: 25, unlockTier: 7 },
  asparagus: { name: 'Măng Tây', seedName: 'asparagusSeed', icon: '🎍', timeToGrowing: 6600000, timeToReady: 13200000, harvestYield: 8, seedPrice: 80, cropPrice: 20, unlockTier: 7 },
  starfruit: { name: 'Khế', seedName: 'starfruitSeed', icon: '🌟', timeToGrowing: 8400000, timeToReady: 16800000, harvestYield: 10, seedPrice: 100, cropPrice: 25, unlockTier: 7 },
  
  // --- Tier 8 (Adjusted scaling) ---
  cherry: { name: 'Anh Đào', seedName: 'cherrySeed', icon: '🍒', timeToGrowing: 12240000, timeToReady: 24480000, harvestYield: 15, seedPrice: 130, cropPrice: 20, unlockTier: 8 },
  orange: { name: 'Cam', seedName: 'orangeSeed', icon: '🍊', timeToGrowing: 12960000, timeToReady: 25920000, harvestYield: 7, seedPrice: 100, cropPrice: 40, unlockTier: 8 },
  rice: { name: 'Lúa Gạo', seedName: 'riceSeed', icon: '🍚', timeToGrowing: 14040000, timeToReady: 28080000, harvestYield: 30, seedPrice: 70, cropPrice: 5, unlockTier: 8 },
  pumpkin: { name: 'Bí Ngô', seedName: 'pumpkinSeed', icon: '🎃', timeToGrowing: 15120000, timeToReady: 30240000, harvestYield: 2, seedPrice: 120, cropPrice: 150, unlockTier: 8 },
  artichoke: { name: 'Atiso', seedName: 'artichokeSeed', icon: '🌸', timeToGrowing: 13680000, timeToReady: 27360000, harvestYield: 2, seedPrice: 130, cropPrice: 140, unlockTier: 8 },
  lentil: { name: 'Đậu Lăng', seedName: 'lentilSeed', icon: '🟤', timeToGrowing: 11160000, timeToReady: 22320000, harvestYield: 25, seedPrice: 80, cropPrice: 5, unlockTier: 8 },
  lychee: { name: 'Vải Thiều', seedName: 'lycheeSeed', icon: '🔴', timeToGrowing: 14400000, timeToReady: 28800000, harvestYield: 20, seedPrice: 150, cropPrice: 18, unlockTier: 8 },
  
  // --- Tier 9 (Adjusted scaling) ---
  watermelon: { name: 'Dưa Hấu', seedName: 'watermelonSeed', icon: '🍉', timeToGrowing: 23040000, timeToReady: 46080000, harvestYield: 2, seedPrice: 200, cropPrice: 240, unlockTier: 9 },
  avocado: { name: 'Bơ', seedName: 'avocadoSeed', icon: '🥑', timeToGrowing: 24000000, timeToReady: 48000000, harvestYield: 4, seedPrice: 220, cropPrice: 140, unlockTier: 9 },
  olive: { name: 'Ô Liu', seedName: 'oliveSeed', icon: '🫒', timeToGrowing: 21120000, timeToReady: 42240000, harvestYield: 12, seedPrice: 200, cropPrice: 40, unlockTier: 9 },
  chestnut: { name: 'Hạt Dẻ', seedName: 'chestnutSeed', icon: '🌰', timeToGrowing: 25920000, timeToReady: 51840000, harvestYield: 4, seedPrice: 280, cropPrice: 160, unlockTier: 9 },
  dragonfruit: { name: 'Thanh Long', seedName: 'dragonfruitSeed', icon: '🩷', timeToGrowing: 20160000, timeToReady: 40320000, harvestYield: 4, seedPrice: 240, cropPrice: 150, unlockTier: 9 },

  // --- Tier 10 ---
  pineapple: { name: 'Dứa (Thơm)', seedName: 'pineappleSeed', icon: '🍍', timeToGrowing: T10_PINEAPPLE_TIMES.growing, timeToReady: T10_PINEAPPLE_TIMES.ready, harvestYield: T10_PINEAPPLE_YIELD, seedPrice: T10_PINEAPPLE_PRICES.seed, cropPrice: T10_PINEAPPLE_PRICES.crop, unlockTier: 10 },
  coconut: { name: 'Dừa', seedName: 'coconutSeed', icon: '🥥', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.1), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.1), harvestYield: T10_PINEAPPLE_YIELD, seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.3), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.3), unlockTier: 10 },
  durian: { name: 'Sầu Riêng', seedName: 'durianSeed', icon: '🍈', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.2), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.2), harvestYield: T10_PINEAPPLE_YIELD, seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 3.3), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 4.3), unlockTier: 10 }, // Durian emoji is a generic melon

  // --- Crops for Tiers 11-15 (HarvestYield rounded) ---
  celestialCarrot: { name: 'Cà Rốt Thiên Giới', seedName: 'celestialCarrotSeed', icon: '🌟🥕', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.3), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.3), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.1), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.5), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.2), unlockTier: 11 },
  starBean: { name: 'Đậu Ngôi Sao', seedName: 'starBeanSeed', icon: '✨🫘', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.35), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.35), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.5), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.6), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.1), unlockTier: 11 },
  moonHerb: { name: 'Thảo Dược Mặt Trăng', seedName: 'moonHerbSeed', icon: '🌙🌿', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.4), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.4), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.2), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.7), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.3), unlockTier: 12 },
  sunBerry: { name: 'Dâu Mặt Trời', seedName: 'sunBerrySeed', icon: '☀️🍓', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.45), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.45), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.2), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.8), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.4), unlockTier: 12 },
  galaxyGrain: { name: 'Ngũ Cốc Ngân Hà', seedName: 'galaxyGrainSeed', icon: '🌌🌾', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.5), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.5), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.6), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 1.9), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.2), unlockTier: 13 },
  cometCorn: { name: 'Ngô Sao Chổi', seedName: 'cometCornSeed', icon: '☄️🌽', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.55), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.55), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 0.8), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.0), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.8), unlockTier: 13 },
  nebulaNectarine: { name: 'Đào Tinh Vân', seedName: 'nebulaNectarineSeed', icon: '🍑✨', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.6), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.6), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 0.9), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.2), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 2.0), unlockTier: 14 },
  voidRoot: { name: 'Rễ Hư Vô', seedName: 'voidRootSeed', icon: '⚫🥔', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.65), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.65), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.3), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.3), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.5), unlockTier: 14 },
  quantumQuince: { name: 'Mộc Qua Lượng Tử', seedName: 'quantumQuinceSeed', icon: '⚛️🍈', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.7), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.7), harvestYield: T10_PINEAPPLE_YIELD, seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.5), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 2.2), unlockTier: 15 },
  phantomPepper: { name: 'Ớt Bóng Ma', seedName: 'phantomPepperSeed', icon: '👻🌶️', timeToGrowing: Math.floor(T10_PINEAPPLE_TIMES.growing * 1.75), timeToReady: Math.floor(T10_PINEAPPLE_TIMES.ready * 1.75), harvestYield: Math.floor(T10_PINEAPPLE_YIELD * 1.4), seedPrice: Math.floor(T10_PINEAPPLE_PRICES.seed * 2.6), cropPrice: Math.floor(T10_PINEAPPLE_PRICES.crop * 1.7), unlockTier: 15 },

  // --- Special Event Crops (Tier 999) ---
  goldenPumpkin: { name: 'Bí Ngô Hoàng Kim (Sự Kiện)', seedName: 'goldenPumpkinSeed', icon: '🎃🌟', timeToGrowing: 60000 * 5, timeToReady: 120000 * 5, harvestYield: 1, seedPrice: 500, cropPrice: 2500, unlockTier: 999 },
  crystalMelon: { name: 'Dưa Hấu Pha Lê (Sự Kiện)', seedName: 'crystalMelonSeed', icon: '💎🍉', timeToGrowing: 3600000 * 2, timeToReady: 7200000 * 2, harvestYield: 1, seedPrice: 1000, cropPrice: 10000, unlockTier: 999 },
  moonflowerBloom: { name: 'Nguyệt Dạ Hoa (Sự Kiện)', seedName: 'moonflowerBloomSeed', icon: '🌸🌙', timeToGrowing: 60 * 60 * 1000 * 4, timeToReady: 60 * 60 * 1000 * 8, harvestYield: 3, seedPrice: 300, cropPrice: 300, unlockTier: 999 },
  sunpetalRose: { name: 'Hồng Mặt Trời (Sự Kiện)', seedName: 'sunpetalRoseSeed', icon: '🌹☀️', timeToGrowing: 60 * 60 * 1000 * 3, timeToReady: 60 * 60 * 1000 * 6, harvestYield: 2, seedPrice: 250, cropPrice: 400, unlockTier: 999 },
  luckyClover: { name: 'Cỏ May Mắn (Sự Kiện)', seedName: 'luckyCloverSeed', icon: '🍀', timeToGrowing: 10 * 60 * 1000, timeToReady: 20 * 60 * 1000, harvestYield: 1, seedPrice: 100, cropPrice: 777, unlockTier: 999 },
  loveBerryEvent: { name: 'Dâu Tình Yêu (Sự Kiện)', seedName: 'loveBerryEventSeed', icon: '🍓❤️', timeToGrowing: 14 * 60 * 1000, timeToReady: 20 * 60 * 1000, harvestYield: 5, seedPrice: 50, cropPrice: 50, unlockTier: 999 }, // Renamed to avoid conflict with any regular "Love Berry"
  ghostPepperEvent: { name: 'Ớt Ma Quái (Sự Kiện)', seedName: 'ghostPepperEventSeed', icon: '🌶️👻', timeToGrowing: 4 * 444 * 1000, timeToReady: 4 * 444 * 1000, harvestYield: 4, seedPrice: 44, cropPrice: 444, unlockTier: 999 },
  rainbowTulip: { name: 'Tulip Cầu Vồng (Sự Kiện)', seedName: 'rainbowTulipSeed', icon: '🌷🌈', timeToGrowing: 60 * 60 * 1000 * 6, timeToReady: 60 * 60 * 1000 * 12, harvestYield: 1, seedPrice: 500, cropPrice: 1500, unlockTier: 999 },
  starAniseEvent: { name: 'Hồi Ngôi Sao (Sự Kiện)', seedName: 'starAniseEventSeed', icon: '🌟🍂', timeToGrowing: 30 * 60 * 1000, timeToReady: 60 * 60 * 1000, harvestYield: 10, seedPrice: 80, cropPrice: 20, unlockTier: 999 },
  dreamWeedEvent: { name: 'Cỏ Mộng Mơ (Sự Kiện)', seedName: 'dreamWeedEventSeed', icon: '🌿💭', timeToGrowing: 60 * 60 * 1000 * 1, timeToReady: 60 * 60 * 1000 * 2, harvestYield: 1, seedPrice: 10, cropPrice: 1, unlockTier: 999 },
};

export const ALL_CROP_IDS = Object.keys(CROP_DATA) as CropId[];
export const ALL_SEED_IDS = ALL_CROP_IDS.map(cropId => CROP_DATA[cropId].seedName as SeedId);

