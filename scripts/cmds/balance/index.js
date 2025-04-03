// @ts-check
/**
 * @fileoverview balance コマンドモジュール。プレイヤーの現在の通貨残高を表示します。
 */

import { currencyManager } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "balance",
  description: "現在の通貨残高を表示します。",
  usage: `${config.prefix}balance`,
  /**
   * @param {import("@minecraft/server").ChatSendAfterEvent} chat
   * @param {import("@minecraft/server").Player} player
   * @param {string[]} args
   */
  async execute(chat, player, args) {
    player.sendMessage(
      `${player.name} の残高: ${currencyManager.getBalance(player)} コイン`
    );
  },
};

await CommandHandler.registerCommand(command);
