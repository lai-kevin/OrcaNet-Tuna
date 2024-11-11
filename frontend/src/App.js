import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./stylesheets/App.css";
import MainPage from "./components/MainPage.js";
import Home from './components/Home';
import Files from './components/Files';
import Settings from './components/Settings';
import { ModeProvider } from "./components/Mode.js";
import { useEffect, useContext } from "react";
import Entry from "./components/Entry.js";
import { Buffer } from "buffer";
import { AppContextProvider, AppContext } from "./components/AppContext.js";
import ProxyContent from "./components/ProxyContent.js";

window.Buffer = Buffer;

function AppRoutes() {
  const { user } = useContext(AppContext); 

  return (
    <Routes>
      <Route path="/" element={user ? <MainPage /> : <Entry />}>
        <Route index element={<Home />} /> 
        <Route path="Files" element={<Files />} />
        <Route path="Proxy" element={<ProxyContent />} />
        <Route path="Settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.title = "OrcaNet Desktop App";
  }, []);

  useEffect(() => {
    window.electronAppReady = true;
  }, []);

  return (
    <AppContextProvider>
      <ModeProvider>
        <BrowserRouter>
          <AppRoutes /> 
        </BrowserRouter>
      </ModeProvider>
    </AppContextProvider>
  );
}

export default App;
