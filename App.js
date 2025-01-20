import { Provider } from "react-redux";
import { store } from "./components/redux/store";
import Home from "./Home";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
//wrapping the project with provider here
export default function App() {
  console.log(process.env);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000000"); // Set to your preferred color
  }, []);
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
}
