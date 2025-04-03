// @ts-check
/**
 * @fileoverview リッチランキングなど、リーダーボード系を管理するクラス
 */

export class LeaderboardManager {
  /**
   * @param {import("./currency_manager").CurrencyManager} currencyManager
   */
  constructor(currencyManager) {
    this.currencyManager = currencyManager;
  }

  /**
   * 上位ランキングを表示する
   * @param {import("@minecraft/server").Player} player
   * @param {import("@minecraft/server").Player[]} onlinePlayers
   */
  showRichRanking(player, onlinePlayers) {
    const ranks = onlinePlayers
      .map((p) => [p.name, Number(this.currencyManager.getBalance(p))])
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 5);
    let msg = "【リッチランキング】\n";
    ranks.forEach(([name, balance], i) => {
      msg += `${i + 1}. ${name} - ${balance} コイン\n`;
    });
    player.sendMessage(msg);
  }
}
