import React from 'react';

import LockScreenProvider from "./src/LockScreenProvider";
import Child from "./src/Child";

export default function App() {
  return (
    <LockScreenProvider>
      <Child />
    </LockScreenProvider>
  );
}
