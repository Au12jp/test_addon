// @ts-check
/**
 * @fileoverview GachaSystem は、ガチャの UI 表示、報酬取得および報酬履歴管理を行うクラスです。
 */

import { GachaConfig } from "../config.js";
import { ActionFormData } from "@minecraft/server-ui";

export class GachaSystem {
  constructor() {
    this.rewardHistory = new Map();
  }

  /**
   * ガチャのメインメニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showMainMenu(player) {
    new ActionFormData()
      .title("§l§3ガチャメインメニュー")
      .body("選択肢を選んでください。")
      .button("ガチャを引く")
      .button("報酬履歴を見る")
      .button("ガチャ情報")
      .button("戻る")
      .show(player)
      .then((response) => {
        if (response.canceled || response.selection === 3) return;
        switch (response.selection) {
          case 0:
            this.confirmGachaPull(player);
            break;
          case 1:
            this.viewRewardHistory(player);
            break;
          case 2:
            this.showGachaInfo(player);
            break;
          default:
            this.showMainMenu(player);
        }
      });
  }

  /**
   * ガチャを引くか確認するフォームを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  confirmGachaPull(player) {
    new ActionFormData()
      .title("§l§3ガチャ実行確認")
      .body(
        `ガチャを引くには ${GachaConfig.cost} コインが必要です。実行しますか？`
      )
      .button("はい")
      .button("いいえ")
      .show(player)
      .then((response) => {
        if (response.canceled || response.selection === 1)
          return this.showMainMenu(player);
        const reward = this.getGachaReward();
        if (!this.rewardHistory.has(player.name)) {
          this.rewardHistory.set(player.name, []);
        }
        this.rewardHistory.get(player.name).push(reward);
        new ActionFormData()
          .title("§l§3ガチャ報酬")
          .body(`おめでとうございます！\n報酬: ${reward}`)
          .button("OK")
          .show(player)
          .then(() => this.showMainMenu(player));
      });
  }

  /**
   * 報酬履歴を表示します。
   * @param {import("@minecraft/server").Player} player
   */
  viewRewardHistory(player) {
    const history = this.rewardHistory.get(player.name) || [];
    const info = history.length ? history.join("\n") : "まだ報酬はありません。";
    new ActionFormData()
      .title("§l§3ガチャ報酬履歴")
      .body(info)
      .button("戻る")
      .show(player)
      .then(() => this.showMainMenu(player));
  }

  /**
   * ガチャの情報を表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showGachaInfo(player) {
    const info = `ガチャ情報:
- 1回 ${GachaConfig.cost} コイン必要
- 報酬は出現重みにより決定
- 頑張ってください！`;
    new ActionFormData()
      .title("§l§3ガチャ情報")
      .body(info)
      .button("戻る")
      .show(player)
      .then(() => this.showMainMenu(player));
  }

  /**
   * ガチャ報酬を決定します。
   * @returns {string}
   */
  getGachaReward() {
    const rewards = GachaConfig.rewards;
    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const reward of rewards) {
      if (random < reward.weight) return reward.id;
      random -= reward.weight;
    }
    return rewards[0].id;
  }
}
