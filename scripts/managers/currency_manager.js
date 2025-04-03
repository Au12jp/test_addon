// @ts-check
/**
 * @fileoverview 各プレイヤーの通貨残高を dp とスコアボードの値で相互に同期するクラス。
 * admin タグを持たないプレイヤーに対しては、スコアボードの変更を禁止し、
 * 常に dp の値で上書きする処理を行います。
 */

import { DPConfigGlobal, CurrencyConfig } from "../config.js";
import { world, system } from "@minecraft/server";
import { DPManager } from "./dp_manager.js"; // DPManager は対象のオブジェクトの dp 操作をラップするクラス

export class CurrencyManager {
  constructor() {
    /**
     * スコアボードの通貨用 objective の ID
     * @type {string}
     */
    this.currencyObjectiveId = "col";
    /**
     * 各プレイヤーの最後に同期した通貨値を保持するマップ（キー：プレイヤー名、値：通貨数）
     * @type {Map<string, number>}
     */
    this.lastSyncedCurrency = new Map();

    // スコアボードの通貨用 objective を作成・取得
    this.ensureCurrencyObjective();

    // 毎 tick ごとに dp とスコアボードの通貨値を同期する処理を開始
    system.runInterval(() => {
      const startTime = Date.now();
      try {
        this.syncCurrency();
      } catch (err) {
        console.error("[CurrencyManager] syncCurrency() でエラーが発生:", err);
      }
      const elapsed = Date.now() - startTime;
      // 処理時間が閾値（例: 5ms）を超える場合は警告を出す
      if (elapsed > 5) {
        console.warn(
          `[CurrencyManager] 同期処理が重くなっています: ${elapsed} ms`
        );
      }
    }, 1);
  }

  /**
   * 指定した通貨 objective が存在しなければ作成し、必ず objective を返します。
   * @returns {import("@minecraft/server").ScoreboardObjective}
   */
  ensureCurrencyObjective() {
    let objective = world.scoreboard.getObjective(this.currencyObjectiveId);
    if (!objective) {
      try {
        objective = world.scoreboard.addObjective(
          this.currencyObjectiveId,
          "通貨"
        );
        console.log(
          `[CurrencyManager] Objective "${this.currencyObjectiveId}" を新規作成しました。`
        );
      } catch (err) {
        console.error(
          `[CurrencyManager] Objective の作成に失敗しました: ${err}`
        );
        throw err;
      }
    }
    this.currencyObjective = objective;
    return objective;
  }

  /**
   * プレイヤーの dp 操作用 DPManager を返します。
   * @param {import("@minecraft/server").Player} player
   * @returns {DPManager}
   */
  _dp(player) {
    return new DPManager(player);
  }

  /**
   * プレイヤーの残高を dp から取得します。未設定の場合は初期残高を設定して返します。
   * @param {import("@minecraft/server").Player} player
   * @returns {number}
   */
  getBalance(player) {
    const dpMgr = this._dp(player);
    try {
      const dpVal = dpMgr.get(DPConfigGlobal.currencyKey);
      if (typeof dpVal === "number") return dpVal;
    } catch (err) {
      console.error(
        `[CurrencyManager] ${player.name} の dp 取得中にエラーが発生: ${err}`
      );
    }
    try {
      dpMgr.set(DPConfigGlobal.currencyKey, CurrencyConfig.startingBalance);
    } catch (err) {
      console.error(
        `[CurrencyManager] ${player.name} の dp 初期設定中にエラーが発生: ${err}`
      );
    }
    return CurrencyConfig.startingBalance;
  }

  /**
   * プレイヤーの残高を dp に設定します。
   * @param {import("@minecraft/server").Player} player
   * @param {number} amount
   */
  setBalance(player, amount) {
    try {
      this._dp(player).set(DPConfigGlobal.currencyKey, amount);
    } catch (err) {
      console.error(
        `[CurrencyManager] ${player.name} の dp 更新中にエラーが発生: ${err}`
      );
    }
  }

  /**
   * プレイヤーの残高に指定額を加算します。
   * @param {import("@minecraft/server").Player} player
   * @param {number} amount
   */
  addCoins(player, amount) {
    const current = this.getBalance(player);
    this.setBalance(player, current + amount);
  }

  /**
   * プレイヤーの残高から指定額を減算します。残高不足の場合は false を返します。
   * @param {import("@minecraft/server").Player} player
   * @param {number} amount
   * @returns {boolean}
   */
  deductCoins(player, amount) {
    const current = this.getBalance(player);
    if (current < amount) return false;
    this.setBalance(player, current - amount);
    return true;
  }

  /**
   * 他プレイヤーへ通貨を譲渡します。
   * @param {string} senderName
   * @param {string} receiverName
   * @param {number} amount
   * @returns {boolean}
   */
  transferCoins(senderName, receiverName, amount) {
    const players = world.getPlayers();
    const sender = players.find((p) => p.name === senderName);
    const receiver = players.find((p) => p.name === receiverName);
    if (!sender || !receiver) {
      sender?.sendMessage(`§c受取人 "${receiverName}" が見つかりません。`);
      return false;
    }
    if (!this.deductCoins(sender, amount)) {
      sender.sendMessage("§c譲渡に失敗。残高不足。");
      return false;
    }
    this.addCoins(receiver, amount);
    sender.sendMessage(`§a${amount} コインを ${receiverName} に譲渡しました。`);
    receiver.sendMessage(
      `§a${senderName} から ${amount} コインが譲渡されました。`
    );
    return true;
  }

  /**
   * 日替わりボーナスを付与します（まだ受け取っていなければ）。
   * @param {import("@minecraft/server").Player} player
   * @param {number} bonus
   * @returns {boolean} ボーナス付与に成功した場合は true、すでに受け取っていた場合は false を返す
   */
  claimDailyBonus(player, bonus) {
    const dpMgr = this._dp(player);
    const lastDate = dpMgr.get(DPConfigGlobal.bonusDateKey);
    const today = new Date().toISOString().split("T")[0];
    if (lastDate === today) return false;
    this.addCoins(player, bonus);
    dpMgr.set(DPConfigGlobal.bonusDateKey, today);
    return true;
  }

  /**
   * dp とスコアボード（objective "col"）の通貨値を相互に監視し、
   * どちらかが変更されている場合にもう一方を更新して同期します。
   *
   * 管理者（admin タグを持つプレイヤー）は dp とスコアボードの双方向の同期を行い、
   * 非管理者は外部からのスコアボード変更を禁止し、常に dp の値で上書きします。
   */
  syncCurrency() {
    const objective = this.currencyObjective || this.ensureCurrencyObjective();
    for (const player of world.getPlayers()) {
      try {
        const identity = player.scoreboardIdentity;
        if (!identity) {
          console.warn(
            `[CurrencyManager] ${player.name} の scoreboardIdentity が未定義のため同期をスキップ`
          );
          // scoreboardIdentity が未定義の場合、コマンドでスコアを 0 に初期化して再試行
          try {
            // コマンドの実行結果は非同期ですが、同期的に実行するため await せずに実行
            player.runCommand(
              `scoreboard players set "${player.name}" ${this.currencyObjectiveId} 0`
            );
            console.log(
              `[CurrencyManager] ${player.name} のスコアを 0 に初期化しました。`
            );
          } catch (cmdErr) {
            console.error(
              `[CurrencyManager] ${player.name} の scoreboard 初期化に失敗: ${cmdErr}`
            );
          }
          continue;
        }
        const playerId = player.name;
        const dpVal = this._dp(player).get(DPConfigGlobal.currencyKey);
        const dpCurrency =
          typeof dpVal === "number" ? dpVal : CurrencyConfig.startingBalance;
        const sbCurrency = objective.getScore(identity) ?? 0;
        const lastSynced = this.lastSyncedCurrency.get(playerId);

        // 非管理者の場合：常に dp の値でスコアボードを上書きする（スコアボード変更を禁止）
        if (!player.hasTag("admin")) {
          if (sbCurrency !== dpCurrency) {
            objective.setScore(identity, dpCurrency);
            console.log(
              `[Sync Non-Admin] ${playerId}: dp (${dpCurrency}) に合わせてスコアボードを上書き`
            );
          }
          continue;
        }

        // 管理者の場合：dp とスコアボードの双方向同期
        if (lastSynced === undefined) {
          this.lastSyncedCurrency.set(playerId, dpCurrency);
          if (dpCurrency !== sbCurrency) {
            objective.setScore(identity, dpCurrency);
            console.log(
              `[Sync Init] ${playerId}: dp (${dpCurrency}) → スコアボード更新`
            );
          }
          continue;
        }

        if (dpCurrency !== lastSynced && dpCurrency !== sbCurrency) {
          objective.setScore(identity, dpCurrency);
          this.lastSyncedCurrency.set(playerId, dpCurrency);
          console.log(
            `[Sync Admin] ${playerId}: dp変更 (${lastSynced} → ${dpCurrency}) → スコアボード更新`
          );
        } else if (sbCurrency !== lastSynced && sbCurrency !== dpCurrency) {
          this._dp(player).set(DPConfigGlobal.currencyKey, sbCurrency);
          this.lastSyncedCurrency.set(playerId, sbCurrency);
          console.log(
            `[Sync Admin] ${playerId}: スコアボード変更 (${lastSynced} → ${sbCurrency}) → dp更新`
          );
        }
      } catch (err) {
        console.error(
          `[CurrencyManager] ${player.name} の同期処理中にエラーが発生: ${err}`
        );
      }
    }
  }
}
