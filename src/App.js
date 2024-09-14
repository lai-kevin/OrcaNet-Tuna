import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./stylesheets/App.css";
import MainPage from "./components/MainPage.js"
import Home from './components/Home';
import Files from './components/Files';
import Settings from './components/Settings';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainPage />}>
        <Route index element={<Home />} /> 
        <Route path="Files" element={<Files />} />
        <Route path="Settings" element={<Settings />} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
