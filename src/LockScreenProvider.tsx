/**
 * LockScreenProvider
 * 一定時間操作していないときにロック画面を表示する
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal, Text, ViewStyle, StyleSheet, View, TextStyle, TouchableOpacity } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

// props
// 型定義部
interface Props {
  children: React.ReactElement;
  timeout?: number;
}

// styles
// 型定義部
interface Styles {
  modal: ViewStyle;
  title: TextStyle;
  button: ViewStyle;
  buttonTitle: TextStyle;
  wrapper: ViewStyle;
}

// スタイリング
const styles: Styles = StyleSheet.create<Styles>({
  modal: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)"
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    lineHeight: 20 * 1.4,
    color: "#FFFFFF",
    textAlign: "center",
  },
  button: {
    padding: 12,
  },
  buttonTitle: {
    fontSize: 20,
    color: "#007aff",
  },
  wrapper: {
    flex: 1,
    width: "100%"
  },
});

/**
 * デフォルトのタイムアウト時間（ms）
 */
const DEFAULT_TIMEOUT = 3000;

/**
 * useIsLocked
 * 下階層でロック状態を参照できるようにContext化する
 * （ロック状態のモーダルを半透明にしつつ、ロック状態ではユーザ状態を非表示にするなど）
 * [Context]
  */
const LockScreenContext = React.createContext<boolean>(false);
export function useIsLocked() {
  return useContext(LockScreenContext);
}

/**
 * LockScreenProvider
 * [Context Provider]
 */
function LockScreenProvider({ children, timeout = DEFAULT_TIMEOUT }): React.FunctionComponent<Props> {
  // setTimeoutで返る値を保持
  // (stateだとsetの際にrenderされてしまうがその必要が無いものはrefを使用）
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ロック状態
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // センサーや生体認証データが無いために認証ができない場合の処理
  const fallbackAuthentication = useCallback(() => {
    setIsLocked(false); // 仮でそのままロック解除する
  }, []);

  // ロック/ロック解除処理（memo化）
  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      fallbackAuthentication();
      return;
    }
    const { success, error } = await LocalAuthentication.authenticateAsync({
      promptMessage: "ロック画面を解除します",
    });
    if (success) {
      setIsLocked(false);
    } else if (error !== "user_cancel") {
      fallbackAuthentication();
    }
  }, [fallbackAuthentication]);

  // タイマー処理を更新する（memo化）
  // タッチ操作時に連続で呼ばれる
  const updateTimer = useCallback(() => {
    if (isLocked) {
      return;
    }
    // 既存のタイマーをクリア
    clearTimeout(timerRef.current);
    // タイマーを再セット
    timerRef.current = setTimeout(lock, timeout);
  }, [isLocked, timerRef, lock, timeout]);

  // ロック解除時にタイマー処理を更新
  // 条件からして初期表示時にも呼ばれる
  useEffect(() => {
    if (!isLocked) {
      updateTimer();
    }
  }, [isLocked, updateTimer]);

  return (
    <LockScreenContext.Provider value={isLocked}>
      <View
        style={styles.wrapper}
        onTouchStart={updateTimer}
        onTouchMove={updateTimer}
        onTouchEnd={updateTimer}
      >
        <Modal visible={isLocked} transparent>
          <View style={styles.modal}>
            <Text style={styles.title}>
              しばらく操作されていないため{"\n"}
              画面がロックされています
            </Text>
            <TouchableOpacity onPress={unlock} style={styles.button}>
              <Text style={styles.buttonTitle}>ロックを解除する</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        {children}
      </View>
    </LockScreenContext.Provider>
  );
}

export default React.memo(LockScreenProvider);