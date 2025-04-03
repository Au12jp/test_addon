// @ts-check
/**
 * @fileoverview gift コマンドモジュール。ショップのギフト送付機能を起動します。
 */

import { shopSystem } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "gift",
  description: "ギフト送付機能を起動します。",
  usage: `${config.prefix}gift`,
  async execute(chat, player, args) {
    shopSystem.showGiftMenu(player);
  },
};

await CommandHandler.registerCommand(command);
