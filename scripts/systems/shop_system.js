// @ts-check
/**
 * @fileoverview ShopSystem は、ショップの UI 表示、購入処理、VIP割引およびギフト機能を管理するクラスです。
 */

import { IconConfig, ShopConfig, SystemConfig } from "../config.js";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { ChestFormData, FurnaceFormData } from "../extensions/forms.js";

export class ShopSystem {
  /**
   * @param {import("../managers/currency_manager.js").CurrencyManager} currencyManager
   * @param {import("../managers/transaction_manager.js").TransactionManager} transactionManager
   */
  constructor(currencyManager, transactionManager) {
    this.currencyManager = currencyManager;
    this.transactionManager = transactionManager;
  }

  /**
   * ショップのメインメニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showMainMenu(player) {
    new ChestFormData("large")
      .title("§l§5ショップメインメニュー")
      .button(1, "§l§a武器", ["武器一覧を表示"], IconConfig.shop.weapon)
      .button(2, "§l§b防具", ["防具一覧を表示"], IconConfig.shop.armor)
      .button(3, "§l§e雑貨", ["雑貨一覧を表示"], IconConfig.shop.item)
      .button(
        4,
        "§l§d武器プレビュー",
        ["武器の見た目を確認"],
        IconConfig.shop.preview
      )
      .button(5, "§l§6炉メニュー", ["炉のUIを表示"], IconConfig.shop.furnace)
      .button(
        6,
        "§l§cギフト",
        ["他プレイヤーへアイテムを贈る"],
        IconConfig.common.gift
      )
      .button(7, "§l戻る", ["メニューを閉じる"], IconConfig.common.return)
      .show(player)
      .then((response) => {
        if (response.canceled) return;
        switch (response.selection) {
          case 1:
            this.showWeaponsMenu(player);
            break;
          case 2:
            this.showArmorMenu(player);
            break;
          case 3:
            this.showItemsMenu(player);
            break;
          case 4:
            this.showWeaponPreview(player);
            break;
          case 5:
            this.showFurnaceMenu(player);
            break;
          case 6:
            this.showGiftMenu(player);
            break;
          default:
            break;
        }
      });
  }

  /**
   * 武器一覧メニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showWeaponsMenu(player) {
    const form = new ChestFormData("large").title("§l§a武器一覧");
    // 各武器ごとに button を追加
    ShopConfig.weapons.forEach((item, index) => {
      form.button(index, item.displayName, item.description, item.id, 1);
    });
    form.button(
      ShopConfig.weapons.length,
      "§l戻る",
      ["前のメニューへ"],
      IconConfig.common.return
    );
    form.show(player).then((response) => {
      if (
        response.canceled ||
        response.selection === undefined ||
        response.selection >= ShopConfig.weapons.length
      ) {
        return this.showMainMenu(player);
      }
      const selected = ShopConfig.weapons[response.selection];
      ShopSystem.purchaseItem(
        player,
        selected,
        this.currencyManager,
        this.transactionManager
      );
    });
  }

  /**
   * 防具一覧メニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showArmorMenu(player) {
    const form = new ChestFormData("large").title("§l§b防具一覧");
    ShopConfig.armor.forEach((item, index) => {
      form.button(index, item.displayName, item.description, item.id, 1);
    });
    form.button(
      ShopConfig.armor.length,
      "§l戻る",
      ["前のメニューへ"],
      IconConfig.common.return
    );
    form.show(player).then((response) => {
      if (
        response.canceled ||
        response.selection === undefined ||
        response.selection >= ShopConfig.armor.length
      ) {
        return this.showMainMenu(player);
      }
      const selected = ShopConfig.armor[response.selection];
      ShopSystem.purchaseItem(
        player,
        selected,
        this.currencyManager,
        this.transactionManager
      );
    });
  }

  /**
   * 雑貨一覧メニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showItemsMenu(player) {
    const form = new ChestFormData("large").title("§l§e雑貨一覧");
    ShopConfig.items.forEach((item, index) => {
      form.button(index, item.displayName, item.description, item.id, 1);
    });
    form.button(
      ShopConfig.items.length,
      "§l戻る",
      ["前のメニューへ"],
      IconConfig.common.return
    );
    form.show(player).then((response) => {
      if (
        response.canceled ||
        response.selection === undefined ||
        response.selection >= ShopConfig.items.length
      ) {
        return this.showMainMenu(player);
      }
      const selected = ShopConfig.items[response.selection];
      ShopSystem.purchaseItem(
        player,
        selected,
        this.currencyManager,
        this.transactionManager
      );
    });
  }

  /**
   * 武器プレビューメニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showWeaponPreview(player) {
    new ActionFormData()
      .title("§l§d武器プレビュー")
      .body("注目の武器の見た目を確認します。")
      .button(ShopConfig.preview.displayName + " プレビュー")
      .button("戻る")
      .show(player)
      .then((response) => {
        if (response.canceled || response.selection === 1) {
          return this.showMainMenu(player);
        }
        const form = new ChestFormData("large").title(
          ShopConfig.preview.displayName
        );
        form.button(
          0,
          "外観",
          ["高品質テクスチャ表示"],
          ShopConfig.preview.id,
          1
        );
        form.button(
          1,
          "詳細",
          ShopConfig.preview.details,
          ShopConfig.preview.id,
          1
        );
        form.button(
          2,
          "購入",
          [`${ShopConfig.preview.price} コインで購入`],
          ShopConfig.preview.id,
          1
        );
        form.button(3, "戻る", ["前のメニューへ"], IconConfig.common.return);
        form.show(player).then((resp) => {
          if (
            resp.canceled ||
            resp.selection === undefined ||
            resp.selection === 3
          ) {
            return this.showMainMenu(player);
          }
          if (resp.selection === 2) {
            ShopSystem.purchaseItem(
              player,
              ShopConfig.preview,
              this.currencyManager,
              this.transactionManager
            );
          } else {
            this.showMainMenu(player);
          }
        });
      });
  }

  /**
   * 炉メニューを表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showFurnaceMenu(player) {
    new FurnaceFormData(false)
      .title("§l§6炉メニュー")
      .button(0, "魚", ["魚を調理"], "minecraft:cod")
      .button(1, "石炭", ["燃料として使用"], "minecraft:coal")
      .button(2, "棒", ["木材から作成"], "textures/items/stick", 64)
      .button(3, "戻る", ["前のメニューへ"], IconConfig.common.return)
      .show(player)
      .then((response) => {
        if (
          response.canceled ||
          response.selection === undefined ||
          response.selection === 3
        ) {
          return this.showMainMenu(player);
        }
        player.sendMessage(`${player.name} が炉メニューから選択しました。`);
        this.showMainMenu(player);
      });
  }

  /**
   * ギフト送付機能を表示します。
   * @param {import("@minecraft/server").Player} player
   */
  showGiftMenu(player) {
    // 入力フィールドを含むフォームは ModalFormData を使用
    new ModalFormData()
      .title("§l§cギフト送付先入力")
      .textField("プレイヤー名", "例: OtherPlayer", "")
      .show(player)
      .then((response) => {
        if (response.canceled) {
          return this.showMainMenu(player);
        }
        const formValues = response.formValues;
        // formValues が存在し、最初の値が文字列であるかチェック
        if (!formValues || typeof formValues[0] !== "string") {
          player.sendMessage("送付先プレイヤー名が不正です。");
          return this.showMainMenu(player);
        }
        const targetName = formValues[0].trim();
        if (!targetName) {
          player.sendMessage("送付先プレイヤー名が不正です。");
          return this.showMainMenu(player);
        }
        const allItems = ShopConfig.weapons.concat(
          ShopConfig.armor,
          ShopConfig.items
        );
        const form = new ChestFormData("large").title(
          "§l§cギフト アイテム選択"
        );
        allItems.forEach((item, index) => {
          form.button(index, item.displayName, item.description, item.id, 1);
        });
        form.button(
          allItems.length,
          "§l戻る",
          ["前のメニューへ"],
          IconConfig.common.return
        );
        form.show(player).then((resp) => {
          if (
            resp.canceled ||
            resp.selection === undefined ||
            resp.selection >= allItems.length
          ) {
            return this.showMainMenu(player);
          }
          const selected = allItems[resp.selection];
          if (!this.currencyManager.deductCoins(player, selected.price)) {
            player.sendMessage("コインが足りません！");
            return this.showMainMenu(player);
          }
          player.sendMessage(
            `${player.name} が ${targetName} に ${selected.displayName} を ${selected.price} コイン分、ギフトとして送付しました！`
          );
          this.transactionManager.recordTransaction(
            player.name,
            selected.id,
            selected.price,
            "gift"
          );
          this.showMainMenu(player);
        });
      });
  }

  /**
   * 静的メソッド。購入処理を実行します。
   * @param {import("@minecraft/server").Player} player
   * @param {import("../type.js").ShopItem} item
   * @param {import("../managers/currency_manager.js").CurrencyManager} currencyManager
   * @param {import("../managers/transaction_manager.js").TransactionManager} transactionManager
   */
  static async purchaseItem(player, item, currencyManager, transactionManager) {
    let effectivePrice = item.price;
    if (SystemConfig.VIP_PLAYERS.includes(player.name)) {
      effectivePrice = Math.floor(
        item.price * SystemConfig.VIP_DISCOUNT_FACTOR
      );
      player.sendMessage(
        `VIP割引適用: ${effectivePrice} コインで購入可能です。`
      );
    }
    if (!currencyManager.deductCoins(player, effectivePrice)) {
      player.sendMessage("§cコインが足りません！");
      return;
    }
    try {
      player.runCommand(`give ${player.name} ${item.id} 1`);
      player.sendMessage(
        `§a${player.name} が ${item.displayName} を ${effectivePrice} コインで購入しました！`
      );
      transactionManager.recordTransaction(
        player.name,
        item.id,
        effectivePrice,
        "buy"
      );
    } catch (error) {
      player.sendMessage(
        `§cアイテム付与中にエラーが発生しました: ${error.message}`
      );
      currencyManager.addCoins(player, effectivePrice);
    }
  }
}
