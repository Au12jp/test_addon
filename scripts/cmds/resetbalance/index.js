// @ts-check
/**
 * @fileoverview resetbalance コマンドモジュール。管理者が指定したプレイヤーの残高を初期値にリセットします。
 */

import { world } from "@minecraft/server";
import { CurrencyConfig } from "../../config.js";
import { currencyManager } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "resetbalance",
  description:
    "指定したプレイヤーの残高を初期値にリセットします。（管理者専用）",
  usage: `${config.prefix}resetbalance [プレイヤー名]`,
  async execute(chat, player, args) {
    if (!player.hasTag("admin")) {
      player.sendMessage("§cこのコマンドは管理者専用です。");
      return;
    }
    if (args.length !== 1) {
      player.sendMessage("§c使い方: .resetbalance [プレイヤー名]");
      return;
    }
    const targetName = args[0];
    const players = world.getPlayers();
    const target = players.find((p) => p.name === targetName);
    if (!target) {
      player.sendMessage(`§cプレイヤー "${targetName}" が見つかりません。`);
      return;
    }
    currencyManager.setBalance(target, CurrencyConfig.startingBalance);
    player.sendMessage(`§a${targetName} の残高が初期値にリセットされました。`);
    target.sendMessage("§aあなたの残高が管理者によってリセットされました。");
  },
};

await CommandHandler.registerCommand(command);
