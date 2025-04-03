// @ts-check
/**
 * @fileoverview config コマンドモジュール。管理者用設定変更フォームを表示します。
 */

import { ConfigManager } from "../../managers/config_manager.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "config",
  description: "管理者用設定変更フォームを表示します。",
  usage: `${config.prefix}config`,
  async execute(chat, player, args) {
    ConfigManager.openConfigForm(player);
  },
};

await CommandHandler.registerCommand(command);
