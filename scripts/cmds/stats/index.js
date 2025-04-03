// @ts-check
/**
 * @fileoverview stats コマンドモジュール。あなたの統計情報（残高、取引件数）を表示します。
 */

import { currencyManager, transactionManager } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "stats",
  description: "あなたの統計情報（残高、取引件数）を表示します。",
  usage: `${config.prefix}stats`,
  async execute(chat, player, args) {
    const balance = currencyManager.getBalance(player);
    const history = transactionManager.getHistory(player.name);
    const msg = `【あなたの統計情報】\n残高: ${balance} コイン\n取引件数: ${history.length} 件`;
    player.sendMessage(msg);
  },
};

await CommandHandler.registerCommand(command);
