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
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <h4>Network Connection</h4>
      <form className= "network_form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ip">IP Address: </label>
          <input className= "network_input" type="text" id="ip" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Enter IP Address"/>
          <label htmlFor="port">Port Number: </label>
          <input className= "network_input" type="text" id="port" value={port} onChange={(e) => setPort(e.target.value)} placeholder="Enter Port Number"/>
        </div>
        <button type="submit" id="connect_button">Connect</button>
      </form>
    </div>
  );
};
export default ConfigContent;