// @ts-check
/**
 * @fileoverview rich コマンドモジュール。リッチプレイヤーランキングを表示します。
 */

import { leaderboardManager } from "../../system_instances.js";
import { world } from "@minecraft/server";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "rich",
  description: "リッチプレイヤーランキングを表示します。",
  usage: `${config.prefix}rich`,
  async execute(chat, player, args) {
    const onlinePlayers = world.getPlayers();
    leaderboardManager.showRichRanking(player, onlinePlayers);
  },
};

await CommandHandler.registerCommand(command);
