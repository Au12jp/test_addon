// @ts-check
/**
 * @fileoverview ping コマンドモジュール。実行時に「Pong!」と返します。
 */

import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "ping",
  description: "Ping Pong",
  usage: `${config.prefix}ping`,
  async execute(chat, player, args) {
    player.sendMessage("Pong!");
  },
};

await CommandHandler.registerCommand(command);
