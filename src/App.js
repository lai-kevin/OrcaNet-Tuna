import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./stylesheets/App.css";
import MainPage from "./components/MainPage.js"
import Home from './components/Home';
import Files from './components/Files';
import Settings from './components/Settings';
import { ModeProvider } from "./components/Mode.js";
import { useEffect, useState} from "react";
import Entry from "./components/Entry.js";
import { Buffer } from "buffer";
window.Buffer = Buffer;
function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    document.title = "OrcaNet Desktop App";
  }, []);
  useEffect(() => {
    window.electronAppReady = true;
}, []);
  return (
    <ModeProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={user ? <MainPage user={user} setUser={setUser}/> : <Entry user={user} setUser={setUser} />}>
        <Route index element={<Home user={user} />} /> 
        <Route path="Files" element={<Files user={user}/>} />
        <Route path="Settings" element={<Settings user={user}/>} />
      </Route>
    </Routes>
  </BrowserRouter>
  </ModeProvider>
  );
}

export default App;
