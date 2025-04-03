// @ts-check
/**
 * @fileoverview history コマンドモジュール。プレイヤー個人の取引履歴を表示します。
 */

import { transactionManager } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "history",
  description: "あなたの取引履歴を表示します。",
  usage: `${config.prefix}history`,
  async execute(chat, player, args) {
    const history = transactionManager.getHistory(player.name);
    if (history.length === 0) {
      player.sendMessage("取引履歴はありません。");
      return;
    }
    let msg = "【取引履歴】\n";
    history.forEach((tx, index) => {
      msg += `${index + 1}. ${tx.type} - ${tx.itemId} - ${
        tx.price
      } コイン - ${new Date(tx.timestamp).toLocaleString()}\n`;
    });
    player.sendMessage(msg);
  },
};

await CommandHandler.registerCommand(command);
