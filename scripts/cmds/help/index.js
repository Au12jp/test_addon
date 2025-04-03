// @ts-check
/**
 * @fileoverview help コマンドモジュール。利用可能なコマンド一覧または指定コマンドの詳細を表示します。
 */

import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "help",
  description: "利用可能なコマンド一覧または指定コマンドの詳細を表示します。",
  usage: `${config.prefix}help [command]`,
  async execute(chat, player, args) {
    if (!args || args.length === 0) {
      let helpMessage = "§a利用可能なコマンド一覧:\n";
      // ハンドラーのキャッシュからコマンド一覧を取得
      for (const [cmdName, cmdModule] of CommandHandler.commands.entries()) {
        helpMessage += `§e${config.prefix}${cmdName}§r - ${cmdModule.description} - Usage: ${cmdModule.usage}\n`;
      }
      player.sendMessage(helpMessage);
    } else {
      const specifiedCommand = args[0].toLowerCase();
      const cmdModule = CommandHandler.commands.get(specifiedCommand);
      if (cmdModule) {
        player.sendMessage(
          `§a${config.prefix}${specifiedCommand}§r - ${cmdModule.description} - Usage: ${cmdModule.usage}`
        );
      } else {
        player.sendMessage(
          `§c指定されたコマンド "${specifiedCommand}" は存在しません。`
        );
      }
    }
  },
};

await CommandHandler.registerCommand(command);
