// @ts-check
/**
 * @fileoverview システムに必要な管理クラスのシングルトンインスタンスを生成してエクスポートします。
 */

import { CurrencyManager } from "./managers/currency_manager.js";
import { TransactionManager } from "./managers/transaction_manager.js";
import { BonusManager } from "./managers/bonus_manager.js";
import { LeaderboardManager } from "./managers/leaderboard_manager.js";

import { ShopSystem } from "./systems/shop_system.js";
import { MarketSystem } from "./systems/market_system.js";
import { GachaSystem } from "./systems/gacha_system.js";
import { ConfigManager } from "./managers/config_manager.js";

const currencyManager = new CurrencyManager();
const transactionManager = new TransactionManager();
const bonusManager = new BonusManager(currencyManager);
const leaderboardManager = new LeaderboardManager(currencyManager);

const shopSystem = new ShopSystem(currencyManager, transactionManager);
const marketSystem = new MarketSystem(transactionManager);
const gachaSystem = new GachaSystem();

export {
  currencyManager,
  transactionManager,
  bonusManager,
  leaderboardManager,
  shopSystem,
  marketSystem,
  gachaSystem,
  ConfigManager,
};
