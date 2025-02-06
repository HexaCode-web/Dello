import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./components/redux/store";
import Home from "./Home";
import * as SystemUI from "expo-system-ui";

export default function App() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000000"); // Set to your preferred color
  }, []);

  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
}
