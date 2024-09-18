import React, { useState } from 'react';
import InfoBox from './InfoBox';
const ConfigContent = () => {
    const boxes = [
        { id: 1, content: <NetworkForm/>}
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
export default ConfigContent;