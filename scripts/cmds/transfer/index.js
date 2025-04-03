// @ts-check
/**
 * @fileoverview transfer コマンドモジュール。他のプレイヤーへ通貨を譲渡します。
 */

import { currencyManager } from "../../system_instances.js";
import { config } from "../../config.js";
import { CommandHandler } from "../../command_handler.js";

/** @type {import("../../type.js").CommandModule} */
const command = {
  name: "transfer",
  description: "指定したプレイヤーへ通貨を譲渡します。",
  usage: `${config.prefix}transfer [相手名] [金額]`,
  async execute(chat, player, args) {
    if (args.length !== 2) {
      player.sendMessage("§c使い方: .transfer [相手名] [金額]");
      return;
    }
    const receiverName = args[0];
    const amount = Number(args[1]);
    if (isNaN(amount)) {
      player.sendMessage("§c金額は数値で入力してください。");
      return;
    }
    currencyManager.transferCoins(player.name, receiverName, amount);
  },
};

await CommandHandler.registerCommand(command);
