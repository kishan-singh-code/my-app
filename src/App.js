import "./App.css";
import Navbar from "./components/Navbar";
import Textarea from "./components/Textarea";
import React, { useState } from "react";

function App() {
  const [mode, setMode] = useState("light");
  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "#122f47";
    } else {
      setMode("light");
      document.body.style.backgroundColor = "white";
    }
  };
  return (
    <>
      <Navbar titel="Just Chlling" mode={mode} toggleMode={toggleMode} />

      <Textarea mode={mode} />
    </>
  );
}

export default App;
