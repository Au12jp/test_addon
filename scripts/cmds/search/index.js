// @ts-check
/**
 * @fileoverview search コマンドモジュール。取引履歴を条件で検索して表示します。
 */

import { transactionManager } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "search",
  description:
    "取引履歴を検索して表示します。（例: .search [プレイヤー名] [取引種別] [最小価格] [最大価格]）",
  usage: `${config.prefix}search [プレイヤー名] [取引種別] [最小価格] [最大価格]`,
  /**
   * @param {import("@minecraft/server").ChatSendAfterEvent} chat
   * @param {import("@minecraft/server").Player} player
   * @param {string[]} args
   */
  async execute(chat, player, args) {
    /** @type {Partial<import("../../type.js").SearchCriteria>} */
    const criteria = {};
    if (args[0]) criteria.playerName = args[0];
    if (args[1]) criteria.type = args[1];
    if (args[2]) criteria.minPrice = Number(args[2]);
    if (args[3]) criteria.maxPrice = Number(args[3]);

    const results = transactionManager.getFilteredHistory(criteria);
    if (results.length === 0) {
      player.sendMessage("条件に一致する取引は見つかりませんでした。");
      return;
    }
    let msg = "【検索結果】\n";
    results.forEach((tx, index) => {
      msg += `${index + 1}. ${tx.playerName} - ${tx.type} - ${tx.itemId} - ${
        tx.price
      } コイン - ${new Date(tx.timestamp).toLocaleString()}\n`;
    });
    player.sendMessage(msg);
  },
};

await CommandHandler.registerCommand(command);
