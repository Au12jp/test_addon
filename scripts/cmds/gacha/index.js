// @ts-check
/**
 * @fileoverview gacha コマンドモジュール。ガチャシステムのメインメニューを起動します。
 */

import { gachaSystem } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "gacha",
  description: "ガチャシステムを起動します。",
  usage: `${config.prefix}gacha`,
  async execute(chat, player, args) {
    gachaSystem.showMainMenu(player);
  },
};

await CommandHandler.registerCommand(command);
