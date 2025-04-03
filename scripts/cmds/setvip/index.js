// @ts-check
/**
 * @fileoverview setvip コマンドモジュール。管理者が指定したプレイヤーの VIP 状態を切り替えます。
 */

import { SystemConfig } from "../../config.js";
import { world } from "@minecraft/server";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "setvip",
  description: "管理者専用：指定したプレイヤーの VIP 状態を切り替えます。",
  usage: `${config.prefix}setvip [プレイヤー名] [on|off]`,
  async execute(chat, player, args) {
    if (!player.hasTag("admin")) {
      player.sendMessage("§cこのコマンドは管理者専用です。");
      return;
    }
    if (args.length !== 2) {
      player.sendMessage("§c使い方: .setvip [プレイヤー名] [on|off]");
      return;
    }
    const targetName = args[0];
    const option = args[1].toLowerCase();
    const players = world.getPlayers();
    const target = players.find((p) => p.name === targetName);
    if (!target) {
      player.sendMessage(`§cプレイヤー "${targetName}" が見つかりません。`);
      return;
    }
    if (option === "on") {
      if (!SystemConfig.VIP_PLAYERS.includes(targetName)) {
        SystemConfig.VIP_PLAYERS.push(targetName);
        player.sendMessage(`§a${targetName} を VIP に追加しました。`);
        target.sendMessage("§aあなたは VIP ステータスに追加されました！");
      } else {
        player.sendMessage(`§c${targetName} は既に VIP です。`);
      }
    } else if (option === "off") {
      const index = SystemConfig.VIP_PLAYERS.indexOf(targetName);
      if (index !== -1) {
        SystemConfig.VIP_PLAYERS.splice(index, 1);
        player.sendMessage(`§a${targetName} を VIP から削除しました。`);
        target.sendMessage("§cあなたは VIP ステータスから削除されました。");
      } else {
        player.sendMessage(`§c${targetName} は VIP ではありません。`);
      }
    } else {
      player.sendMessage("§c使い方: .setvip [プレイヤー名] [on|off]");
    }
  },
};

await CommandHandler.registerCommand(command);
