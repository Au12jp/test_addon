// @ts-check
/**
 * @fileoverview MarketSystem は、市場の UI 表示、価格更新、購入・売却処理およびフラッシュセール機能を管理するクラスです。
 */

import { IconConfig, MarketConfig, SystemConfig } from "../config.js";
import { ActionFormData } from "@minecraft/server-ui";
import { ChestFormData } from "../extensions/forms.js";

/**
 * 市場システムクラス
 */
export class MarketSystem {
  /**
   * コンストラクタ。
   * @param {import("../managers/transaction_manager").TransactionManager} transactionManager 市場での取引管理に使用する TransactionManager インスタンス
   */
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
  }

  /**
   * 市場アイテムの価格を更新します。
   */
  updatePrices() {
    for (const key in MarketConfig.MARKET_ITEMS) {
      const item = MarketConfig.MARKET_ITEMS[key];
      const fluctuation = Math.random() * 0.4 - 0.2;
      item.currentPrice = Math.round(item.basePrice * (1 + fluctuation));
    }
  }

  /**
   * 市場のメインメニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showMainMenu(player) {
    new ActionFormData()
      .title("§l§2市場メインメニュー")
      .body("選択肢を選んでください。")
      .button("購入")
      .button("売却")
      .button("市場情報")
      .button("取引履歴")
      .button("戻る")
      .show(player)
      .then((response) => {
        if (response.canceled || response.selection === 4) return;
        switch (response.selection) {
          case 0:
            this.showBuyMenu(player);
            break;
          case 1:
            this.showSellMenu(player);
            break;
          case 2:
            this.showMarketInfo(player);
            break;
          case 3:
            this.showTransactionHistory(player);
            break;
          default:
            this.showMainMenu(player);
        }
      });
  }

  /**
   * 購入メニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showBuyMenu(player) {
    const chest = new ChestFormData("large").title("§l§2市場 - 購入");
    const items = MarketConfig.MARKET_ITEMS;
    const keys = Object.keys(items);
    keys.forEach((key, index) => {
      const item = items[key];
      let price = item.currentPrice;
      if (SystemConfig.flashSaleActive) {
        price = Math.round(price * SystemConfig.flashSaleDiscount);
      }
      chest.button(
        index,
        item.displayName,
        [`価格: ${price} コイン`],
        item.typeId
      );
    });
    chest.button(
      keys.length,
      "§l戻る",
      ["前のメニューへ"],
      IconConfig.common.return
    );
    chest.show(player).then((response) => {
      if (
        response.canceled ||
        response.selection === undefined ||
        response.selection >= keys.length
      ) {
        return this.showMainMenu(player);
      }
      const selectedKey = keys[response.selection];
      const selectedItem = items[selectedKey];
      let effectivePrice = selectedItem.currentPrice;
      if (SystemConfig.flashSaleActive) {
        effectivePrice = Math.round(
          effectivePrice * SystemConfig.flashSaleDiscount
        );
      }
      new ActionFormData()
        .title("§l§2購入確認")
        .body(
          `あなたは ${selectedItem.displayName} を ${effectivePrice} コインで購入しますか？`
        )
        .button("はい")
        .button("いいえ")
        .show(player)
        .then((confirmResp) => {
          if (confirmResp.canceled || confirmResp.selection === 1)
            return this.showMainMenu(player);
          player.sendMessage(
            `${player.name} が ${selectedItem.displayName} を ${effectivePrice} コインで購入しました！`
          );
          this.showMainMenu(player);
        });
    });
  }

  /**
   * 売却メニューを表示します。（実装例）
   * @param {import("@minecraft/server").Player} player
   */
  showSellMenu(player) {
    const chest = new ChestFormData("large").title("§l§2市場 - 売却");
    const items = MarketConfig.MARKET_ITEMS;
    const keys = Object.keys(items);
    keys.forEach((key, index) => {
      const item = MarketConfig.MARKET_ITEMS[key];
      const sellPrice = Math.round(
        item.currentPrice * SystemConfig.SELL_MULTIPLIER
      );
      chest.button(
        index,
        `売却: ${item.displayName}`,
        [`売却価格: ${sellPrice} コイン`],
        item.typeId
      );
    });
    chest.button(
      keys.length,
      "§l戻る",
      ["前のメニューへ"],
      IconConfig.common.return
    );
    chest.show(player).then((response) => {
      if (
        response.canceled ||
        response.selection === undefined ||
        response.selection >= keys.length
      ) {
        return this.showMainMenu(player);
      }
      const selectedKey = keys[response.selection];
      const selectedItem = MarketConfig.MARKET_ITEMS[selectedKey];
      const sellPrice = Math.round(
        selectedItem.currentPrice * SystemConfig.SELL_MULTIPLIER
      );
      new ActionFormData()
        .title("§l§2売却確認")
        .body(
          `あなたは ${selectedItem.displayName} を ${sellPrice} コインで売却しますか？`
        )
        .button("はい")
        .button("いいえ")
        .show(player)
        .then((confirmResp) => {
          if (confirmResp.canceled || confirmResp.selection === 1)
            return this.showMainMenu(player);
          player.sendMessage(
            `${player.name} が ${selectedItem.displayName} を ${sellPrice} コインで売却しました！`
          );
          this.showMainMenu(player);
        });
    });
  }

  /**
   * 市場情報を表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showMarketInfo(player) {
    let info = "市場情報:\n";
    for (const key in MarketConfig.MARKET_ITEMS) {
      const item = MarketConfig.MARKET_ITEMS[key];
      info += `${item.displayName}: 基本価格 ${item.basePrice} | 現在価格 ${item.currentPrice} コイン\n`;
    }
    new ActionFormData()
      .title("§l§2市場情報")
      .body(info)
      .button("戻る")
      .show(player)
      .then(() => this.showMainMenu(player));
  }

  /**
   * 取引履歴を表示します。（実装例）
   * @param {import("@minecraft/server").Player} player
   */
  showTransactionHistory(player) {
    new ActionFormData()
      .title("§l§2取引履歴")
      .body("取引履歴はありません。")
      .button("戻る")
      .show(player)
      .then(() => this.showMainMenu(player));
  }
}
