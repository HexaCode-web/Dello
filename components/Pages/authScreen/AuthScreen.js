import React, { useState } from "react";
import Greeting from "./components/Greeting";
import Signup from "./components/Signup";
import SignIn from "./components/SingIn";
export default function authScreen() {
  const [activePage, setActivePage] = useState("main");

  return (
    <>
      {activePage === "main" && <Greeting setActivePage={setActivePage} />}
      {activePage === "SignUp" && <Signup setActivePage={setActivePage} />}
      {activePage === "SignIn" && <SignIn setActivePage={setActivePage} />}
    </>
  );
}
