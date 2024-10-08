import React, { useState, useContext} from 'react';
import InfoBox from './InfoBox';
import { Mode } from './Mode';
import { CiLight } from "react-icons/ci";
import { CiDark } from "react-icons/ci";
const ConfigContent = ({ mode, chooseLight, chooseDark }) => {
    const boxes = [
        { id: 1, content: <NetworkForm/>},
        { id: 2, content: <Theme mode = {mode} chooseLight = {chooseLight} chooseDark = {chooseDark}/>}
      ];
    return(
        <div>
        {boxes.map((box) => (
            <InfoBox key={box.id} content={box.content} />
        ))}
        </div>
       )
};

const NetworkForm = () => {
  const [api, setApi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div id = "network">
      <h3 id = "network_title">API Connection</h3>
      <form className= "network_form" onSubmit={handleSubmit}>
        <div id = "api_config">
          <label htmlFor="api" id = "api_title"> API URL: </label>
          <input className= "network_input" type="text" id="api" value={api} onChange={(e) => setApi(e.target.value)} placeholder="Enter API Address"/>
        </div>
        <button type="submit" id="connect_button">Connect</button>
      </form>
    </div>
  );
};
const Theme =({mode, chooseLight, chooseDark})=>{
  return(
      <div id = "theme">
        <h3 id = "theme_title">Theme</h3>
        <div id = "check" >
          <button type = "button" id="light_button" onClick={chooseLight} style={{
          border: `5px solid ${mode === 'light' ? '#5B9BD5' : 'transparent'}`}}><CiLight style={{ color: 'black', fontSize: '30px' }} /></button>
          <button type = "button" id="dark_button" onClick={chooseDark}  style={{
          border: `5px solid ${mode === 'dark' ? '#5B9BD5' : 'transparent'}`}}><CiDark style={{ color: 'black', fontSize: '30px' }} /></button>
          <div id="labels">
            <p id="light_title">Light</p>
            <p id ="dark_title">Dark</p>
          </div>
      </div>
     </div>
  )
}
export default ConfigContent;