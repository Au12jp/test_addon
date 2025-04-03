// @ts-check
/**
 * @fileoverview MainManager は、全システムの初期化、イベント登録およびコマンド処理を統合して実行するクラスです。
 * ・アイテム使用イベント：ショップ、マーケット、ガチャの起動
 * ・チャットイベント：コマンド処理
 * ・tick イベント：市場価格更新および取引ログの古いエントリ削除
 */

import { world, system } from "@minecraft/server";
import { config, SystemConfig } from "./config.js";
import { CommandHandler } from "./command_handler.js";
import {
  currencyManager,
  transactionManager,
  // bonusManager,
  // leaderboardManager,
  shopSystem,
  marketSystem,
  gachaSystem,
} from "./system_instances.js";

class MainManager {
  /**
   * 初期化処理。サーバー起動時にコマンドモジュールの事前読み込みを行い、各イベントを登録します。
   */
  async init() {
    // config.commands に登録されたコマンドモジュールを事前に読み込み、キャッシュする
    await CommandHandler.loadCommands();
    this.registerEvents();
    console.log("MainManager: イベント登録完了");
  }

  /**
   * 各種イベントの登録を行います。
   */
  registerEvents() {
    // アイテム使用イベント：指定アイテム使用で各システムを起動
    world.afterEvents.itemUse.subscribe((evd) => {
      const player = evd.source;
      // プレイヤーの通貨情報初期化（必要に応じて getBalance 内で設定）
      currencyManager.getBalance(player);
      switch (evd.itemStack.typeId) {
        case SystemConfig.SHOP_TRIGGER_ITEM:
          shopSystem.showMainMenu(player);
          break;
        case SystemConfig.MARKET_TRIGGER_ITEM:
          marketSystem.showMainMenu(player);
          break;
        case SystemConfig.GACHA_TRIGGER_ITEM:
          gachaSystem.showMainMenu(player);
          break;
        default:
          break;
      }
    });

    // tick イベント：市場価格更新
    let tickCounter = 0;
    system.runInterval(() => {
      tickCounter++;
      if (tickCounter >= SystemConfig.MARKET_UPDATE_TICKS) {
        marketSystem.updatePrices();
        tickCounter = 0;
        world.sendMessage("§a市場の価格が更新されました！");
      }
    });

    // チャットイベント：config.prefix で始まるメッセージをコマンドとして処理
    world.beforeEvents.chatSend.subscribe((evd) => {
      const message = evd.message.trim();
      if (!message.startsWith(config.prefix)) return;
      // コマンド処理を CommandHandler に委譲
      CommandHandler.handleChat(evd);
    });

    // tick イベント：1分ごとに取引ログの古いエントリを削除
    system.runInterval(() => {
      transactionManager.purgeOldLogs();
    }, 60000);
  }
}

// MainManager のインスタンス生成と初期化
const mainManager = new MainManager();
mainManager.init();
