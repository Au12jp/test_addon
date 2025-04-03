// @ts-check
/**
 * @fileoverview Audit コマンドモジュール。取引履歴などの監査情報を表示します。
 */

import { TransactionManager } from "../../managers/transaction_manager.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "audit",
  description: "取引履歴などの監査情報を表示します。",
  usage: `${config.prefix}audit`,
  /**
   * コマンド実行関数
   * @param {import("@minecraft/server").ChatSendAfterEvent} chat
   * @param {import("@minecraft/server").Player} player
   * @param {string[]} args
   */
  async execute(chat, player, args) {
    try {
      const tm = new TransactionManager();
      const allTransactions = tm.getAllHistory();
      if (allTransactions.length === 0) {
        player.sendMessage("取引履歴はありません。");
      } else {
        // 最新の10件を表示
        const recent = allTransactions.slice(-10);
        let message = "§a最新の取引履歴:\n";
        for (const tx of recent) {
          const timeStr = new Date(tx.timestamp).toLocaleString();
          message += `§e${tx.playerName}§r が §b${tx.itemId}§r を §c${tx.price} コイン§r で §d${tx.type}§r (${timeStr})\n`;
        }
        player.sendMessage(message);
      }
    } catch (err) {
      player.sendMessage(
        `監査情報の取得中にエラーが発生しました: ${err.message}`
      );
      console.error("[audit] エラー:", err);
    }
  },
};

await CommandHandler.registerCommand(command);
