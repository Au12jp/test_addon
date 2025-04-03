// @ts-check
/**
 * @fileoverview DPManager は、対象オブジェクトの DynamicProperty の取得・設定・削除などの共通処理を提供するベースクラスです。
 */

import { Entity, Player, ItemStack, World } from "@minecraft/server";

export class DPManager {
  /**
   * @param {World | Entity | Player | ItemStack} target - DynamicProperty を操作する対象オブジェクト
   */
  constructor(target) {
    this.target = target;
  }

  /**
   * 指定されたkeyにvalueをセットします。
   * @param {string} key - DynamicPropertyのキー
   * @param {string | number | boolean | Array<any> | object} value - セットするデータ
   * @returns {boolean} 成功時はtrue、失敗時はfalse
   */
  set(key, value) {
    try {
      this.validateKey(key);
      if (value === undefined) {
        throw new Error(
          "valueはstring | number | boolean | Array | object型である必要があります。"
        );
      }
      let toStore = value;
      if (Array.isArray(value) || typeof value === "object") {
        toStore = JSON.stringify(value);
      }
      this.target.setDynamicProperty(key, toStore);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * 指定されたkeyの値を取得します。
   * @param {string} key - DynamicPropertyのキー
   * @returns {string | number | boolean | Array<any> | object | undefined} 取得したデータ
   */
  get(key) {
    this.validateKey(key);
    let data = this.target.getDynamicProperty(key);
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        // JSONパースに失敗した場合はそのまま文字列として返す
      }
    }
    return data;
  }

  /**
   * 指定されたkeyの値を削除します。
   * @param {string} key - DynamicPropertyのキー
   */
  remove(key) {
    this.validateKey(key);
    this.target.setDynamicProperty(key, undefined);
  }

  /**
   * 対象に設定されているすべてのDynamicPropertyのキーを返します。
   * @returns {string[]} キーの配列
   */
  getAllKeys() {
    return this.target.getDynamicPropertyIds();
  }

  /**
   * 対象に設定されているDynamicPropertyの総バイト数を返します。
   * @returns {number} バイト数
   */
  getTotalByte() {
    return this.target.getDynamicPropertyTotalByteCount();
  }

  /**
   * 指定されたkeyが存在するかを返します。
   * @param {string} key - DynamicPropertyのキー
   * @returns {boolean} 存在する場合はtrue、存在しない場合はfalse
   */
  hasKey(key) {
    this.validateKey(key);
    return this.getAllKeys().includes(key);
  }

  /**
   * キーが文字列であることを検証します。
   * @param {string} key - DynamicPropertyのキー
   */
  validateKey(key) {
    if (typeof key !== "string") {
      throw new Error("keyはstring型である必要があります。");
    }
  }

  /**
   * 文字列のバイトサイズを計算します。
   * @param {string} str - 文字列
   * @returns {number} バイトサイズ
   */
  getByteSize(str) {
    let byteSize = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode <= 0x7f) {
        byteSize += 1;
      } else if (charCode <= 0x7ff) {
        byteSize += 2;
      } else if (charCode <= 0xffff) {
        byteSize += 3;
      } else {
        byteSize += 4;
      }
    }
    return byteSize;
  }

  /**
   * 配列を指定したバイトサイズ毎に分割します。
   * @param {Array<any>} value - 分割対象の配列
   * @param {number} [maxBytes=32767] - 最大バイトサイズ
   * @returns {Array<Array<any>>} 分割後の配列
   */
  splitArrayByByteSize(value, maxBytes = 32767) {
    const result = [];
    let currentChunk = [];
    let currentSize = 0;
    for (const item of value) {
      let itemData;
      if (typeof item === "string") {
        itemData = item;
      } else if (typeof item === "number" || typeof item === "boolean") {
        itemData = String(item);
      } else {
        itemData = JSON.stringify(item);
      }
      const itemSize = this.getByteSize(itemData);
      if (currentSize + itemSize > maxBytes) {
        result.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }
      currentChunk.push(item);
      currentSize += itemSize;
    }
    if (currentChunk.length > 0) {
      result.push(currentChunk);
    }
    return result;
  }
}
