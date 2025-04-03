// @ts-check
/**
 * @fileoverview CommandHandler は、チャットメッセージからコマンドを解析し、
 * 対応するコマンドモジュールを動的にインポートして実行するクラスです。
 */

import { config } from "./config.js";

/**
 * コマンドモジュールの型定義
 * @typedef {import("./type.js").CommandModule} CommandModule
 */

export class CommandHandler {
  /**
   * コマンドモジュールをキャッシュするマップ
   * @type {Map<string, CommandModule>}
   */
  static commands = new Map();

  /**
   * コマンドモジュールを登録します。
   * @param {CommandModule} commandModule - 登録するコマンドモジュール
   * @returns {Promise<void>}
   */
  static async registerCommand(commandModule) {
    return new Promise((resolve) => {
      const lowerName = commandModule.name.toLowerCase();
      CommandHandler.commands.set(lowerName, commandModule);
      console.log(
        `[CommandHandler] Registered command "${commandModule.name}"`
      );
      resolve();
    });
  }

  /**
   * config.commands に登録されたコマンドモジュールを順次読み込み、キャッシュを更新します。
   * この関数はサーバーの初期化時に一度だけ呼び出してください。
   * @returns {Promise<void>}
   */
  static async loadCommands() {
    console.log(`[CommandHandler] Loading commands...`);
    const startOverall = Date.now();
    for (const cmdName of config.commands) {
      try {
        console.log(`[CommandHandler] Loading command "${cmdName}"...`);
        // await import することで、各コマンドモジュール内の自動登録処理も実行される
        await import(`./cmds/help/index.js`);
      } catch (err) {
        console.error(
          `[CommandHandler] Error loading command module "${cmdName}": ${err}`
        );
      }
    }
    const overallDuration = Date.now() - startOverall;
    console.log(
      `[CommandHandler] Finished loading ${CommandHandler.commands.size} commands in ${overallDuration} ms`
    );
  }

  /**
   * チャットメッセージが接頭辞付きの場合、キャッシュを利用してコマンドを実行します。
   * キャッシュに存在しない場合は動的にインポートしてキャッシュに追加します。
   * @param {import("@minecraft/server").ChatSendBeforeEvent} chat
   * @returns {Promise<void>}
   */
  static async handleChat(chat) {
    if (!chat.message.startsWith(config.prefix)) {
      return;
    }
    chat.cancel = true;
    const player = chat.sender;
    const args = chat.message.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift();
    if (!cmd) {
      player.sendMessage(`コマンドが指定されていません。`);
      return;
    }
    const lowerCmd = cmd.toLowerCase();
    let commandModule = CommandHandler.commands.get(lowerCmd);
    if (!commandModule) {
      try {
        console.log(`[CommandHandler] Dynamically loading command "${cmd}"...`);
        const moduleImport = await import(`./cmds/${cmd}/index.js`);
        // default export がない場合は moduleImport 自体を利用する
        commandModule = moduleImport.default || moduleImport;
        if (!commandModule) {
          player.sendMessage(`§cコマンドモジュールが見つかりません: ${cmd}`);
          return;
        }
        await CommandHandler.registerCommand(commandModule);
        console.log(`[CommandHandler] Dynamically loaded command "${cmd}".`);
      } catch (err) {
        if (err instanceof ReferenceError) {
          player.sendMessage(
            `§cInvalid Command ${cmd}\nUsage: ${config.prefix}${cmd} ...`
          );
        } else {
          console.error(
            `[CommandHandler] Error dynamically loading command "${cmd}": ${err}`
          );
        }
        return;
      }
    }
    console.log(
      `[CommandHandler] Executing command "${cmd}" for player ${
        player.name
      } with args: ${JSON.stringify(args)}`
    );
    await commandModule.execute(chat, player, args);
  }
}
