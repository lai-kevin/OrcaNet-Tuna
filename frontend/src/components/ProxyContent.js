import React, { useContext, useState, useEffect } from 'react';
import ProxyModal from './ProxyModal';
import { AppContext } from './AppContext';
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
const ProxyContent=({user, setUser})=>{
  const [current, setCurrent] = useState('client'); 
  const handleTabChange = (page) => {
    setCurrent(page);
  };
    return(
        <div className="proxys">
            <h1 className="text">Proxy</h1>
            <div className="tabs">
                <nav className="settings_bar">
                <ul>
                    <li className={current === 'client' ? 'current' : ''}>
                    <a onClick={() => handleTabChange('client')} className="tab">
                        Client
                    </a>
                    </li>
                    <li className={current === 'server' ? 'current' : ''}>
                    <a onClick={() => handleTabChange('server')} className="tab">
                        Server
                    </a>
                    </li>
                </ul>
                </nav>
            </div>
            <div className="bottom_content">
                {current === "client" && (<Client user={user} setUser={setUser}/>)}
                {current === "server" && (<Server user={user}/>)}
            </div>
    </div>
    )
}
const Client =({user, setUser})=>{
    const {peers} = useContext(AppContext);
    const {server} = useContext(AppContext);
    const [row, setRow] = useState(server=="--" ? null: server.id)
    const [pass, setPass] = useState(false)
    const [open, setOpen] = useState(false)
    const [same, setSame] = useState(false)
    const handleRow = (id)=>{
        setRow(id);
    }
    const check = () => {
        if(row === null){
            return
        }
        if(server.id === row){
            setSame(true)
            return
        }
        setPass(100 >= peers[row].Price);
        setOpen(true);
    };
    const handleClick=()=>{
        setSame(false)
    }
    return(
        <div id="client">
            <div id="top_info">
                <h3 id="server_info">Connected to Proxy Server: {server === "--" ? "---": server.location} </h3>
                <h3>Port: {server === "--" ? "---":server.Port}</h3>
            </div>
            <div id ="table_container">
            <table id="proxy_table">
                <thead>
                    <tr>
                    <th>Location</th>
                    <th>Port</th>
                    <th>Price (OrcaCoins)</th>
                    </tr>
                </thead>
                <tbody>
                {peers.map((node) => (
                    <tr
                        key={node.id}
                        onClick={() => handleRow(node.id)}
                        style={{
                            backgroundColor: row === node.id ? '#d3d3d3' : 'white', 
                            cursor: 'pointer',
                        }}
                    >
                        <td>{node.location}</td>
                        <td>{node.Port}</td>
                        <td>{node.Price}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button id="confirm" onClick={check}>Confirm</button>
            {same && (
                 <div id="err_modal">
                 <div id="err_content">
                     <h3>You are already connected to this node.</h3>
                     <button className ="ok_button" onClick={handleClick} >OK</button>
                 </div>
                  </div>)}
            <NetworkForm setRow={setRow} setPass={setPass} setOpen={setOpen} user={user}/>
            </div>
            {open && <ProxyModal row={peers[row]} setRow={setRow} pass ={pass} setOpen={setOpen} user={user} setUser={setUser}/>}
        </div>
    )
}
const NetworkForm = ({setRow, setPass, setOpen}) => {
    const [ip, setIp] = useState('');
    const [port, setPort] = useState('');
    const {peers} = useContext(AppContext);
    const [err, setErr] =useState(false);
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(ip)
      console.log(port)
      console.log(peers)
      const matchedRow = peers.find((peer) => peer.location === ip && peer.Port === parseInt(port, 10));
      console.log(matchedRow)
      if (matchedRow) {
        setRow(matchedRow.id)
        setPass(true)
        setOpen(true)
        setIp("");
       setPort("");
      } else {
        setErr(true);
      }
    };
    const handleClick=()=>{
        setErr(false)
        setIp("");
        setPort("");
    }
    return (
      <div id="form">
        <form className= "network_form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="ip">IP Address: </label>
            <input className= "network_input" type="text" id="ip" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Enter IP Address" required minLength="1"/>
            <label id="port_label" htmlFor="port">Port Number: </label>
            <input className= "network_input" type="text" id="port" value={port} onChange={(e) => setPort(e.target.value)} placeholder="Enter Port Number" required minLength="1"/>
          </div>
          <button type="submit" id="connect_button">Connect</button>
        </form>
        {err && (

            <div id="err_modal">
                <div id="err_content">
                    <h3>Cannot find this node. Please try again</h3>
                    <button className ="ok_button" onClick={handleClick} >OK</button>
                </div>
        </div>)}
      </div>
    );
  };
  const Server = () =>{
   const {proxy} = useContext(AppContext);
   return(
      <div id="server">
        {!proxy && (
            <div id ="warning">
                <h3>Your proxy server settings have been turned off.</h3>
                <h3>To turn it on, go to configurations in Settings Page.</h3>
            </div>
        )}
        {proxy && (<ProxyDisplay/>)}
      </div>
   )
  }
const formatTime = () => {
    const curr = new Date();
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0'); 
    const d = String(curr.getDate()).padStart(2, '0');
    const hr = String(curr.getHours()).padStart(2, '0');
    const min = String(curr.getMinutes()).padStart(2, '0');
    const sec = String(curr.getSeconds()).padStart(2, '0');
    
    return `${y}-${m}-${d} ${hr}:${min}:${sec}`;
  };

const ProxyDisplay =()=>{
    const {proxy,proxyHistory, setProxyHistory} = useContext(AppContext);
    const [sort, setSort] = useState("")
    useEffect(() => {
        if (proxy) {
            const interval = setInterval(() => {
              generate();
            }, 5000); 
            return () => clearInterval(interval);
          }
    }, [proxy]); 
      const generate = ()=>{
        const ip = ["192.168.1.1", "10.1.0.1", "170.16.0.1", "191.0.2.1", "213.0.113.1", "199.51.100.1"];
        const u = ["www.google.com", "www.abc.com", "www.123.com", "www.example.com", "www.example12.com"];
        const m = ["GET", "POST"]
        const stat =["Success", "Failed"]
    
        const randomIP = ip[Math.floor(Math.random() * ip.length)];
        const randomURL = u[Math.floor(Math.random() * u.length)];
        const randomMethod = m[Math.floor(Math.random() * m.length)];
        const randomStatus = stat[Math.floor(Math.random() * stat.length)];
        const size = (Math.random() * 3).toFixed(2); 
        const received = (Math.random() * 100).toFixed(2); 
        const sent = randomMethod === "POST" ? (Math.random() * 3).toFixed(2) : 0; 
        
        const result ={
            client: randomIP,
            Url: randomURL,
            method: randomMethod,
            time: formatTime(),
            status: randomStatus,
            size: size,
            sent: `${sent} KB`,
            received: `${received} MB`,
        }
        setProxyHistory(prevHistory => [...prevHistory, result]);
    }
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = proxyHistory;
        if (curSort === "Latest") {
            sortedList = sortedList.sort((a, b) => {
              const one = new Date(a.time).getTime(); 
              const two = new Date(b.time).getTime(); 
              return two - one;
            });          
        }
        if (curSort === "Earliest") {
            sortedList = sortedList.sort((a, b) => {
              const one = new Date(a.time).getTime(); 
              const two = new Date(b.time).getTime(); 
              return one - two;
            });          
        }
        setSort(event.target.value);
        setProxyHistory([...sortedList]); 
    }
    console.log(proxyHistory);
    return(
        <div id="server_cont">
            <div className= "sort-container1">
                <p className="sort-label1">Sort By: </p>
                <select className="sort-select" value={sort} onChange={handleSort}>
                    <option value="" disabled>Select an option</option>
                    <option value="Latest">Newest</option>
                    <option value="Earliest">Earliest</option>
                </select>
            </div>
            <div id ="table_cont">
            <table id="proxy_data">
                <thead>
                    <tr>
                    <th>Client IP</th>
                    <th>URL</th>
                    <th>Method</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Data Sent</th>
                    <th>Data Received</th>
                    </tr>
                </thead>
                <tbody>
                {proxyHistory.map((row) => (
                    <tr
                        key={row.id}
                    >
                        <td>{row.client}</td>
                        <td>{row.Url}</td>
                        <td>{row.method}</td>
                        <td>{row.time}</td>
                        <td>{row.status === "Success"? <FaCheck style={{color:'green'}}/>: <FaXmark style={{color: 'red'}}/> }</td>
                        <td>{row.size}</td>
                        <td>{row.sent}</td>
                        <td>{row.received}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </div>
    )
}
export default ProxyContent;