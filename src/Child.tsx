import { StatusBar } from 'expo-status-bar';
import React, {useCallback, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useIsLocked} from "./LockScreenProvider";

export default function Child() {
  const isLocked = useIsLocked();
  const [count, setCount] = useState(0);
  const countUp = useCallback(() => setCount(count + 1), [count]);
  return (
    <View style={styles.container}>
      <Text style={styles.counter}>{isLocked ? "*" : count}</Text>
      <Button title="Press" onPress={countUp} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: "30%"
  },
  counter: {
    fontSize: 48,
  },
});
