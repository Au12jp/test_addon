// @ts-check
/**
 * @fileoverview dailybonus コマンドモジュール。プレイヤーに日替わりボーナスを付与します。（1日1回）
 */

import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "dailybonus",
  description: "日替わりボーナスを受け取ります。（1日1回）",
  usage: `${config.prefix}dailybonus`,
  async execute(chat, player, args) {
    // bonusManager.claimBonus(player);
  },
};

await CommandHandler.registerCommand(command);
