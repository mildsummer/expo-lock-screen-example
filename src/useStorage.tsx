import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * useStateのようなI/FでAsyncStorageを使用するhook
 * @param {string} key Storageに保存するためのキー
 * @param {string} initialValue 初期値
 */
export default function useStorage(key: string, initialValue: string): [string, Dispatch<SetStateAction<string>>] {
  const keyRef = useRef<string>(key);
  const [value, _set] = useState<string>(initialValue);

  // 最初にAsyncStorageから取得
  useEffect(() => {
    AsyncStorage.getItem(key, (error, result) => {
      if (result !== null) {
        _set(result);
      }
    });
  }, [key]);

  // 値をセットする関数
  // AsyncStorageにも反映
  const set = useCallback((newValue: string) => {
    _set(newValue);
    AsyncStorage.setItem(key, newValue);
  }, [key]);

  // 念のため、keyが変わった場合に元のkeyのvalueを削除
  useEffect(() => {
    if (keyRef.current !== key) {
      AsyncStorage.removeItem(key);
    }
    keyRef.current = key;
  }, [keyRef, key]);

  return [value, set];
}