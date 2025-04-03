// @ts-check
/**
 * @fileoverview market コマンドモジュール。市場システムのメインメニューを起動します。
 */

import { marketSystem } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "market",
  description: "市場システムを起動します。",
  usage: `${config.prefix}market`,
  async execute(chat, player, args) {
    marketSystem.showMainMenu(player);
  },
};

await CommandHandler.registerCommand(command);
