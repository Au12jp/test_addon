// @ts-check
/**
 * @fileoverview shop コマンドモジュール。ショップシステムのメインメニューを起動します。
 */

import { shopSystem } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "shop",
  description: "ショップシステムを起動します。",
  usage: `${config.prefix}shop`,
  async execute(chat, player, args) {
    shopSystem.showMainMenu(player);
  },
};

await CommandHandler.registerCommand(command);
