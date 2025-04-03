// @ts-check
/**
 * @fileoverview flashsale コマンドモジュール。フラッシュセールの ON/OFF を切り替えます。（管理者専用）
 */

import { SystemConfig } from "../../config.js";
import { world } from "@minecraft/server";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "flashsale",
  description:
    "フラッシュセールを ON または OFF に切り替えます。（管理者専用）",
  usage: `${config.prefix}flashsale on|off`,
  async execute(chat, player, args) {
    if (args.length !== 1) {
      player.sendMessage("§c使い方: .flashsale on|off");
      return;
    }
    const option = args[0].toLowerCase();
    if (option === "on") {
      SystemConfig.flashSaleActive = true;
      world.sendMessage("フラッシュセールが開始されました！");
    } else if (option === "off") {
      SystemConfig.flashSaleActive = false;
      world.sendMessage("フラッシュセールが終了しました。");
    } else {
      player.sendMessage("§c使い方: .flashsale on|off");
    }
  },
};

await CommandHandler.registerCommand(command);
