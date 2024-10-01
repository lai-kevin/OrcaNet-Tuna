import React, { useState, useContext} from 'react';
import InfoBox from './InfoBox';
import { Mode } from './Mode';
const ConfigContent = ({ mode, chooseMode }) => {
    const boxes = [
        { id: 1, content: <NetworkForm/>},
        { id: 2, content: <Theme mode = {mode} chooseMode = {chooseMode}/>}
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
const Theme =({mode, chooseMode})=>{
  return(
      <div id = "theme">
        <h3 id = "theme_title">Theme</h3>
        <div id = "check" >
          <label for="checkbox" id = "mode_title"> Dark Mode:</label> 
          <input type="checkbox" id="check_box"
          checked={mode === 'dark'} 
          onChange={chooseMode} 
          />
      </div>
     </div>
  )
}
export default ConfigContent;