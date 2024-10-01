import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./stylesheets/App.css";
import MainPage from "./components/MainPage.js"
import Home from './components/Home';
import Files from './components/Files';
import Settings from './components/Settings';
import { ModeProvider } from "./components/Mode.js";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    document.title = "OrcaNet Desktop App";
  }, []);

  return (
    <ModeProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainPage />}>
        <Route index element={<Home />} /> 
        <Route path="Files" element={<Files />} />
        <Route path="Settings" element={<Settings />} />
      </Route>
    </Routes>
  </BrowserRouter>
  </ModeProvider>
  );
}

export default App;
