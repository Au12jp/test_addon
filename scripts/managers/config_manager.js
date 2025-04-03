// @ts-check
/**
 * @fileoverview ConfigManager は、管理者がシステム設定をフォームで変更できるようにするクラスです。
 */

import { loadGlobalConfig, saveGlobalConfig } from "../config.js";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { FormUtils } from "../utils/form_utils.js";

export class ConfigManager {
  /**
   * 管理者用設定変更フォームを表示します
   * @param {import("@minecraft/server").Player} player
   */
  static openConfigForm(player) {
    const globalConfig = loadGlobalConfig();
    const form = new ModalFormData().title("設定変更フォーム");
    // 各テキストフィールドでシステム・ボーナス・譲渡・通貨設定を編集
    form.textField(
      "システム (updateTicks,sellMult,vipDiscount,flashDiscount)",
      "例:1200,0.8,0.9,0.7",
      `${globalConfig.systemConfig.MARKET_UPDATE_TICKS},${globalConfig.systemConfig.SELL_MULTIPLIER},${globalConfig.systemConfig.VIP_DISCOUNT_FACTOR},${globalConfig.systemConfig.flashSaleDiscount}`
    );
    form.textField(
      "ボーナス (dailyBonus, cooldown)",
      "例:100,86400000",
      `${globalConfig.bonusConfig.dailyBonus},${globalConfig.bonusConfig.bonusCooldown}`
    );
    form.textField(
      "譲渡 (maxTransfer)",
      "例:200",
      `${globalConfig.transferConfig.maxTransfer}`
    );
    form.textField(
      "通貨 (startingBalance)",
      "例:500",
      `${globalConfig.currencyConfig.startingBalance}`
    );
    form.submitButton("保存");

    FormUtils.formBusy(player, form).then((response) => {
      if (response.canceled) return;
      try {
        /** @type {ModalFormResponse} */
        const modalResponse = response;
        const formValues = modalResponse.formValues;
        if (!formValues) {
          player.sendMessage("フォームの入力値が取得できませんでした。");
          return;
        }
        // 各値を文字列として取得する
        const systemLine = String(formValues[0]);
        const bonusLine = String(formValues[1]);
        const transferLine = String(formValues[2]);
        const currencyLine = String(formValues[3]);

        const [updateTicks, sellMult, vipDiscount, flashDiscount] = systemLine
          .split(",")
          .map((n) => Number(n.trim()));
        const [dailyBonus, bonusCooldown] = bonusLine
          .split(",")
          .map((n) => Number(n.trim()));
        const maxTransfer = Number(transferLine.trim());
        const startingBalance = Number(currencyLine.trim());

        if (
          [
            updateTicks,
            sellMult,
            vipDiscount,
            flashDiscount,
            dailyBonus,
            bonusCooldown,
            maxTransfer,
            startingBalance,
          ].some((v) => isNaN(v))
        ) {
          player.sendMessage("数値に変換できない入力がありました。");
          return;
        }

        const newGlobalConfig = {
          ...globalConfig,
          systemConfig: {
            ...globalConfig.systemConfig,
            MARKET_UPDATE_TICKS: updateTicks,
            SELL_MULTIPLIER: sellMult,
            VIP_DISCOUNT_FACTOR: vipDiscount,
            flashSaleDiscount: flashDiscount,
          },
          bonusConfig: {
            ...globalConfig.bonusConfig,
            dailyBonus,
            bonusCooldown,
          },
          transferConfig: {
            ...globalConfig.transferConfig,
            maxTransfer,
          },
          currencyConfig: {
            ...globalConfig.currencyConfig,
            startingBalance,
          },
        };
        saveGlobalConfig(newGlobalConfig);
        player.sendMessage("設定が更新されました。");
      } catch (err) {
        player.sendMessage(`エラー: ${err}`);
      }
    });
  }
}
