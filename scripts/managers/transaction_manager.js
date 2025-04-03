// @ts-check
/**
 * @fileoverview TransactionManager は、dp を用いた取引履歴の保存・読み込み、
 * フィルタリング、保存期間管理、サスペクトアラートの検出を行うクラスです。
 */

import { world } from "@minecraft/server";
import { DPConfigGlobal, LogRetentionConfig } from "../config.js";
import { DPManager } from "./dp_manager.js";

/** @typedef {import("../type.js").Transaction} ShopTransaction */

export class TransactionManager extends DPManager {
  constructor() {
    super(world);
  }

  /**
   * dp から取引ログを読み込みます。
   * @returns {ShopTransaction[]} 取引履歴エントリ配列
   */
  loadLogs() {
    const data = this.get(DPConfigGlobal.transactionLogsKey);
    if (typeof data === "string") {
      try {
        const logs = JSON.parse(data);
        return Array.isArray(logs) ? logs : [];
      } catch (e) {
        console.error("[TransactionManager] JSON 解析エラー:", e);
        return [];
      }
    }
    return [];
  }

  /**
   * dp に取引ログを保存します。
   * @param {ShopTransaction[]} logs - 取引履歴の配列
   */
  saveLogs(logs) {
    try {
      this.set(DPConfigGlobal.transactionLogsKey, JSON.stringify(logs));
    } catch (err) {
      console.error("[TransactionManager] ログ保存中にエラーが発生:", err);
    }
  }

  /**
   * 新たな取引を記録し、サスペクトアラートチェックを行います。
   * @param {string} playerName - 取引を行ったプレイヤー名
   * @param {string} itemId - 取引対象のアイテムID
   * @param {number} price - 取引価格
   * @param {"buy"|"sell"|"transfer"|"gift"} type - 取引種別
   */
  recordTransaction(playerName, itemId, price, type) {
    const logs = this.loadLogs();
    const tx = { playerName, itemId, price, type, timestamp: Date.now() };
    logs.push(tx);
    this.saveLogs(logs);
    this.checkSuspiciousTransaction(tx);
  }

  /**
   * 保存期間を超えた古いログを削除します。
   */
  purgeOldLogs() {
    const logs = this.loadLogs();
    const now = Date.now();
    const filtered = logs.filter(
      (tx) => now - tx.timestamp <= LogRetentionConfig.retentionPeriod
    );
    if (filtered.length !== logs.length) {
      this.saveLogs(filtered);
    }
  }

  /**
   * 指定プレイヤーの取引履歴を取得します。
   * @param {string} playerName - プレイヤー名
   * @returns {ShopTransaction[]} 取引履歴の配列
   */
  getHistory(playerName) {
    return this.loadLogs().filter((tx) => tx.playerName === playerName);
  }

  /**
   * 全取引履歴を取得します。
   * @returns {ShopTransaction[]} 全取引履歴の配列
   */
  getAllHistory() {
    return this.loadLogs();
  }

  /**
   * 条件に基づいて取引履歴をフィルタリングして取得します。
   * @param {{ playerName?: string, type?: string, minPrice?: number, maxPrice?: number, startTime?: number, endTime?: number }} criteria - フィルタ条件
   * @returns {ShopTransaction[]} 条件に一致する取引履歴の配列
   */
  getFilteredHistory(criteria) {
    return this.loadLogs().filter((tx) => {
      if (criteria.playerName && tx.playerName !== criteria.playerName)
        return false;
      if (criteria.type && tx.type !== criteria.type) return false;
      if (typeof criteria.minPrice === "number" && tx.price < criteria.minPrice)
        return false;
      if (typeof criteria.maxPrice === "number" && tx.price > criteria.maxPrice)
        return false;
      if (
        typeof criteria.startTime === "number" &&
        tx.timestamp < criteria.startTime
      )
        return false;
      if (
        typeof criteria.endTime === "number" &&
        tx.timestamp > criteria.endTime
      )
        return false;
      return true;
    });
  }

  /**
   * 取引が疑わしいかチェックし、疑わしい場合は管理者に通知します。
   * @param {ShopTransaction} tx - 取引ログエントリ
   */
  checkSuspiciousTransaction(tx) {
    const suspiciousThreshold = 1000;
    if (tx.price >= suspiciousThreshold) {
      const adminPlayers = world.getPlayers({ tags: ["admin"] });
      adminPlayers.forEach((admin) => {
        admin.sendMessage(
          `§c[警告] 疑わしい取引: ${tx.playerName} が ${tx.itemId} を ${tx.price} コインで ${tx.type} しました。`
        );
      });
    }
  }
}
