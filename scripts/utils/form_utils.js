// @ts-check
/**
 * @fileoverview FormUtils は、フォーム表示処理の待機ユーティリティです。
 */

import * as UI from "@minecraft/server-ui";

export class FormUtils {
  /**
   * プレイヤーが他のフォームを表示中の場合、フォームが開くまで再試行します。
   * @param {import("@minecraft/server").Player} player
   * @param {UI.ActionFormData | UI.ModalFormData | UI.MessageFormData} form
   * @returns {Promise<UI.ActionFormResponse | UI.ModalFormResponse | UI.MessageFormResponse>}
   */
  static async formBusy(player, form) {
    return new Promise((resolve) => {
      const run = async () => {
        const response = await form.show(player);
        if (
          response.canceled &&
          response.cancelationReason === UI.FormCancelationReason.UserBusy
        ) {
          run();
        } else {
          resolve(response);
        }
      };
      run();
    });
  }
}
