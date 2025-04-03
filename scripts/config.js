// @ts-check
/**
 * @fileoverview システム全体の設定および dynamic property (dp) を用いた設定管理を行うファイル。
 * ショップや市場などの固定値定数も含みます。
 */

import { world } from "@minecraft/server";
import { MinecraftTextures } from "./utils/minecraft_textures.js";

/** @typedef {import("./type.js").SystemConfigType} SystemConfigType */
/** @typedef {import("./type.js").ShopConfigType} ShopConfigType */
/** @typedef {import("./type.js").MarketConfigType} MarketConfigType */
/** @typedef {import("./type.js").GachaConfigType} GachaConfigType */
/** @typedef {import("./type.js").BonusConfigType} BonusConfigType */
/** @typedef {import("./type.js").TransferConfigType} TransferConfigType */
/** @typedef {import("./type.js").GlobalConfigType} GlobalConfigType */

/** アイコン用テクスチャの設定 */
export const IconConfig = {
  shop: {
    /** 武器用アイコン（剣） */
    weapon: MinecraftTextures.ITEMS_IRON_SWORD,
    /** 防具用アイコン（チェストプレート） */
    armor: MinecraftTextures.ITEMS_IRON_CHESTPLATE,
    /** 雑貨用アイコン（リンゴ） */
    item: MinecraftTextures.ITEMS_APPLE,
    /** 武器プレビュー用アイコン（ネザライト斧） */
    preview: MinecraftTextures.ITEMS_NETHERITE_AXE,
    /** 炉メニュー用アイコン（稼働中の炉） */
    furnace: MinecraftTextures.BLOCKS_FURNACE_FRONT_ON,
  },
  market: {
    /** 市場で購入時のボタンアイコン */
    buy: MinecraftTextures.UI_BUY_NOW_NORMAL,
    /** 市場で売却時のボタンアイコン */
    sell: MinecraftTextures.UI_TRASH,
    /** 市場情報表示用アイコン */
    info: MinecraftTextures.UI_INFOBULB,
  },
  gacha: {
    /** ガチャメニュー用アイコン */
    gacha: MinecraftTextures.UI_GLYPH_PERSONA,
    /** ガチャ報酬表示用アイコン */
    reward: MinecraftTextures.ITEMS_POTION_BOTTLE_HEAL,
    /** ガチャ報酬履歴用アイコン */
    history: MinecraftTextures.UI_RATINGS_FULLSTAR,
  },
  common: {
    /** 戻る用ボタンアイコン（左向き矢印） */
    back: MinecraftTextures.UI_ARROW_LEFT,
    /** 共通の戻るアイコン */
    return: MinecraftTextures.UI_ARROW_LEFT,
    /** ギフト送信用アイコン */
    gift: MinecraftTextures.UI_SHARE_GOOGLE,
  },
};

/** ショップ用設定 */
export const ShopConfig = /** @type {ShopConfigType} */ ({
  /** 武器一覧 */
  weapons: [
    {
      /** アイテムID */
      id: "minecraft:iron_sword",
      /** 表示名 */
      displayName: "§l§a剣",
      /** 説明文の配列 */
      description: ["攻撃力: 7", "価格: 100 コイン"],
      /** 価格（コイン） */
      price: 100,
    },
    {
      id: "minecraft:stone_axe",
      displayName: "§l§a斧",
      description: ["攻撃力: 9", "価格: 120 コイン"],
      price: 120,
    },
  ],
  /** 防具一覧 */
  armor: [
    {
      id: "minecraft:iron_helmet",
      displayName: "§l§bヘルメット",
      description: ["防御力: 3", "価格: 80 コイン"],
      price: 80,
    },
    {
      id: "minecraft:iron_chestplate",
      displayName: "§l§bチェストプレート",
      description: ["防御力: 8", "価格: 200 コイン"],
      price: 200,
    },
  ],
  /** 雑貨一覧 */
  items: [
    {
      id: "minecraft:apple",
      displayName: "§l§eリンゴ",
      description: ["体力回復: 4", "価格: 10 コイン"],
      price: 10,
    },
  ],
  /** 武器プレビュー用アイテム */
  preview: {
    id: "minecraft:netherite_axe",
    displayName: "§l§dネザライト斧",
    description: ["特別な武器"],
    price: 300,
    details: ["攻撃力: 10", "耐久性: 2031"],
  },
});

/** 市場用設定 */
export const MarketConfig = /** @type {MarketConfigType} */ ({
  /** 市場で取り扱うアイテムの連想配列 */
  MARKET_ITEMS: {
    diamond: {
      displayName: "§bダイヤモンド",
      typeId: "minecraft:diamond",
      basePrice: 100,
      currentPrice: 100,
    },
    goldIngot: {
      displayName: "§6金インゴット",
      typeId: "minecraft:gold_ingot",
      basePrice: 50,
      currentPrice: 50,
    },
    ironIngot: {
      displayName: "§f鉄インゴット",
      typeId: "minecraft:iron_ingot",
      basePrice: 30,
      currentPrice: 30,
    },
  },
});

/** ガチャ用設定 */
export const GachaConfig = /** @type {GachaConfigType} */ ({
  /** ガチャ1回のコスト */
  cost: 50,
  /** 報酬リスト */
  rewards: [
    { id: "minecraft:stone", weight: 50 },
    { id: "minecraft:iron_ingot", weight: 30 },
    { id: "minecraft:gold_ingot", weight: 15 },
    { id: "minecraft:diamond", weight: 5 },
  ],
});

/* dp を利用した全体設定管理 */

/** dp のキー定義 */
export const DPConfigGlobal = {
  /** プレイヤー通貨の dp キー */
  currencyKey: "player_currency",
  /** 日替わりボーナスの最終受給日の dp キー */
  bonusDateKey: "last_bonus_date",
  /** フラッシュセール状態の dp キー */
  flashSaleKey: "world_flash_sale",
  /** 取引履歴ログの dp キー */
  transactionLogsKey: "transaction_logs",
  /** 全体設定の dp キー */
  globalConfigKey: "global_config",
};

/** 全体設定のデフォルト値 */
const defaultGlobalConfig = {
  /** コマンドの接頭辞 */
  prefix: ".",
  /** コマンドの使い方 */
  usage: "コマンドの使い方: .[command] [args...]",
  /** 利用可能なコマンドのリスト */
  commands: [
    "ping",
    "help",
    "shop",
    "market",
    "gacha",
    "balance",
    "dailybonus",
    "transfer",
    "rich",
    "config",
    "flashsale",
    "gift",
    "stats",
    "resetbalance",
    "setvip",
    "history",
    "audit",
    "search",
  ],
  /** システム全体設定 */
  systemConfig: {
    /** ショップ起動に使用するアイテムID */
    SHOP_TRIGGER_ITEM: "minecraft:compass",
    /** 市場起動に使用するアイテムID */
    MARKET_TRIGGER_ITEM: "minecraft:nether_star",
    /** ガチャ起動に使用するアイテムID */
    GACHA_TRIGGER_ITEM: "minecraft:feather",
    /** 市場価格更新周期（tick単位） */
    MARKET_UPDATE_TICKS: 1200,
    /** 売却時に適用する倍率 */
    SELL_MULTIPLIER: 0.8,
    /** VIP割引時の割引係数 */
    VIP_DISCOUNT_FACTOR: 0.9,
    /** VIPプレイヤー名の配列 */
    VIP_PLAYERS: ["VIPPlayer1", "VIPPlayer2"],
    /** フラッシュセール実施中かどうか */
    flashSaleActive: false,
    /** フラッシュセール時の割引係数 */
    flashSaleDiscount: 0.7,
  },
  /** 日替わりボーナス設定 */
  bonusConfig: {
    /** 毎日付与されるボーナスコイン数 */
    dailyBonus: 100,
    /** ボーナスのクールダウン（ミリ秒） */
    bonusCooldown: 86400000,
  },
  /** コイン譲渡設定 */
  transferConfig: {
    /** 1回あたりの最大譲渡金額 */
    maxTransfer: 200,
  },
  /** 通貨設定 */
  currencyConfig: {
    /** 初期残高 */
    startingBalance: 500,
  },
};

/**
 * dp から全体設定を読み込みます。存在しなければデフォルト値をセットします。
 * @returns {GlobalConfigType} 全体設定オブジェクト
 */
export function loadGlobalConfig() {
  const data = world.getDynamicProperty(DPConfigGlobal.globalConfigKey);
  if (typeof data === "string") {
    try {
      /** @type {GlobalConfigType} */
      const parsed = JSON.parse(data);
      return parsed;
    } catch (e) {
      console.error("[loadGlobalConfig] JSON 解析エラー:", e);
      // JSON 解析に失敗した場合はデフォルト値を使用します
    }
  }
  const jsonString = JSON.stringify(defaultGlobalConfig);
  try {
    world.setDynamicProperty(DPConfigGlobal.globalConfigKey, jsonString);
  } catch (err) {
    console.error("[loadGlobalConfig] dp 書き込みエラー:", err);
  }
  return defaultGlobalConfig;
}

/**
 * dp に全体設定を保存します。
 * @param {GlobalConfigType} newConfig - 更新後の全体設定オブジェクト
 */
export function saveGlobalConfig(newConfig) {
  try {
    world.setDynamicProperty(
      DPConfigGlobal.globalConfigKey,
      JSON.stringify(newConfig)
    );
  } catch (err) {
    console.error("[saveGlobalConfig] dp 書き込みエラー:", err);
  }
}

/**
 * グローバル設定を dp から読み込む Promise を定義します。
 * worldInitialize イベントが発生したタイミングで設定を読み込み、Promise を解決します。
 * @type {Promise<GlobalConfigType>}
 */
export const globalConfig = new Promise((resolve, reject) => {
  world.afterEvents.worldLoad.subscribe(() => {
    try {
      const config = loadGlobalConfig();
      console.log(
        "[globalConfig] globalConfig が読み込まれました:",
        JSON.stringify(config)
      );
      resolve(config);
    } catch (error) {
      console.error(
        "[globalConfig] globalConfig の読み込みに失敗しました:",
        error
      );
      reject(error);
    }
  });
});

// top-level await (ESM 環境で有効な場合)
const resolvedConfig = await globalConfig;

/** エイリアスとして各設定をエクスポート */
export const config = {
  prefix: resolvedConfig.prefix,
  usage: resolvedConfig.usage,
  commands: resolvedConfig.commands,
};

export const SystemConfig = resolvedConfig.systemConfig;
export const BonusConfig = resolvedConfig.bonusConfig;
export const TransferConfig = resolvedConfig.transferConfig;
export const CurrencyConfig = resolvedConfig.currencyConfig;

/**
 * ログの保存期間設定（ミリ秒）
 */
export const LogRetentionConfig = {
  retentionPeriod: 7 * 24 * 60 * 60 * 1000,
};
