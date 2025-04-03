// @ts-check
/**
 * @fileoverview 日替わりボーナスの管理クラス
 */

import { BonusConfig } from "../config.js";

/**
 * @typedef {import("./currency_manager").CurrencyManager} CurrencyManager
 */

export class BonusManager {
  /**
   * @param {CurrencyManager} currencyManager
   */
  constructor(currencyManager) {
    this.currencyManager = currencyManager;
  }
  /**
   * プレイヤーにボーナスを付与
   * @param {import("@minecraft/server").Player} player
   */
  claimBonus(player) {
    if (this.currencyManager.claimDailyBonus(player, BonusConfig.dailyBonus)) {
      player.sendMessage(
        `§aおめでとうございます！ ${BonusConfig.dailyBonus} コインのボーナスを獲得しました！`
      );
    } else {
      player.sendMessage("§c既に本日のボーナスは受け取っています。");
    }
  }
}
