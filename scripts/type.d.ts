// @ts-check
/**
 * @fileoverview 各システムで使用する型定義ファイル。
 */

/** 市場アイテム情報 */
export type MarketItem = {
  /** 表示名 */
  displayName: string;
  /** アイテムID（Minecraft識別子） */
  typeId: string;
  /** 基本価格 */
  basePrice: number;
  /** 現在の価格 */
  currentPrice: number;
};

/** ショップアイテム情報 */
export type ShopItem = {
  /** アイテムID */
  id: string;
  /** 表示名 */
  displayName: string;
  /** 説明文の配列 */
  description: string[];
  /** 価格（コイン） */
  price: number;
};

/** 武器プレビュー用アイテム情報 */
export type PreviewItem = ShopItem & {
  /** 詳細情報（プレビュー用） */
  details: string[];
};

/** ガチャ報酬情報 */
export type GachaReward = {
  /** 報酬アイテムID */
  id: string;
  /** 出現重み */
  weight: number;
};

/** ガチャ設定 */
export type GachaConfigType = {
  /** ガチャ1回のコスト */
  cost: number;
  /** 報酬リスト */
  rewards: GachaReward[];
};

/** 市場設定 */
export type MarketConfigType = {
  /** 市場で取り扱うアイテムの連想配列 */
  MARKET_ITEMS: Record<string, MarketItem>;
};

/** ショップ設定 */
export type ShopConfigType = {
  /** 武器一覧 */
  weapons: ShopItem[];
  /** 防具一覧 */
  armor: ShopItem[];
  /** 雑貨一覧 */
  items: ShopItem[];
  /** 武器プレビュー用アイテム */
  preview: PreviewItem;
};

/** システム全体設定 */
export type SystemConfigType = {
  /** ショップ起動に使用するアイテムID */
  SHOP_TRIGGER_ITEM: string;
  /** 市場起動に使用するアイテムID */
  MARKET_TRIGGER_ITEM: string;
  /** ガチャ起動に使用するアイテムID */
  GACHA_TRIGGER_ITEM: string;
  /** 市場価格更新周期（tick単位） */
  MARKET_UPDATE_TICKS: number;
  /** 売却時に適用する倍率 */
  SELL_MULTIPLIER: number;
  /** VIP割引時の割引係数（例: 0.9なら10%割引） */
  VIP_DISCOUNT_FACTOR: number;
  /** VIPプレイヤー名の配列 */
  VIP_PLAYERS: string[];
  /** フラッシュセール実施中かどうか */
  flashSaleActive: boolean;
  /** フラッシュセール時の割引係数（例: 0.7なら30%割引） */
  flashSaleDiscount: number;
};

/** 日替わりボーナス設定 */
export type BonusConfigType = {
  /** 毎日付与されるボーナスコイン数 */
  dailyBonus: number;
  /** ボーナスのクールダウン（ミリ秒） */
  bonusCooldown: number;
};

/** コイン譲渡設定 */
export type TransferConfigType = {
  /** 1回あたりの最大譲渡金額 */
  maxTransfer: number;
};

/** プレイヤーの通貨情報 */
export type CurrencyRecord = {
  /** プレイヤー名 */
  playerName: string;
  /** 現在の残高 */
  balance: number;
};

/** 取引履歴エントリ */
export type Transaction = {
  /** 取引プレイヤー名 */
  playerName: string;
  /** アイテムID */
  itemId: string;
  /** 取引価格 */
  price: number;
  /** 取引種別（購入、売却、譲渡、ギフト） */
  type: "buy" | "sell" | "transfer" | "gift";
  /** 取引日時（UNIXタイムスタンプ） */
  timestamp: number;
};

/** 検索条件（部分指定可） */
export type SearchCriteria = {
  /** プレイヤー名 */
  playerName?: string;
  /** 取引種別 */
  type?: string;
  /** 最小取引価格 */
  minPrice?: number;
  /** 最大取引価格 */
  maxPrice?: number;
  /** 取引開始時間（UNIXタイムスタンプ） */
  startTime?: number;
  /** 取引終了時間（UNIXタイムスタンプ） */
  endTime?: number;
};

/** コマンドモジュールの型 */
export type CommandModule = {
  /** コマンド名 */
  name: string;
  /** 説明 */
  description: string;
  /** 利用方法 */
  usage: string;
  /**
   * コマンド実行関数
   * @param {import("@minecraft/server").ChatEvent} chat - チャットイベント
   * @param {import("@minecraft/server").Player} player - コマンドを実行するプレイヤー
   * @param {string[]} args - コマンド引数の配列
   */
  execute: (
    chat: import("@minecraft/server").ChatEvent,
    player: import("@minecraft/server").Player,
    args: string[]
  ) => void | Promise<void>;
};

/** 全体設定の型定義 */
export type GlobalConfigType = {
  /** コマンドの接頭辞。チャットメッセージがこの文字列で始まる場合、コマンドとして処理されます。 */
  prefix: string;
  /** コマンドの利用方法説明。コマンドの使い方やヘルプ情報を示します。 */
  usage: string;
  /** 登録されたコマンドのリスト。各文字列は、対応するコマンドモジュールの名前を表します。 */
  commands: string[];
  /** システム全体に関する設定。ショップ、マーケット、ガチャなど各システムで使用する定数が含まれます。 */
  systemConfig: SystemConfigType;
  /** 日替わりボーナスの設定。毎日付与されるボーナスコイン数やクールダウン時間（ミリ秒）を指定します。 */
  bonusConfig: BonusConfigType;
  /** コイン譲渡の設定。1回あたりに譲渡可能な最大金額を指定します。 */
  transferConfig: TransferConfigType;
  /** 通貨設定。プレイヤーの初期残高など、通貨に関する設定を含みます。 */
  currencyConfig: {
    /** プレイヤーの初期通貨残高を指定します。 */
    startingBalance: number;
  };
};
