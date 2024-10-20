import React, { useContext, useState, useEffect } from 'react';
import ProxyModal from './ProxyModal';
import { AppContext } from './AppContext';
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
import { FaRegCircleXmark } from "react-icons/fa6";
import { HiOutlineXMark } from "react-icons/hi2";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useMode } from './Mode';

const ProxyContent=({user, setUser})=>{
  const [current, setCurrent] = useState('client');
  const [err, setErr] = useState(false)
  const {server, setServer,proxy, proxyPrice, setProxyHistory,setTotal, stop} = useContext(AppContext);
  const handleTabChange = (page) => {
    setCurrent(page);
  };

  //dummy data are being randomly generated and shown to demonstrate how the UI would look like
  useEffect(() => {
    if (proxy) {
        const interval = setInterval(() => {
          generateServer();
        }, 3000); 
        return () => clearInterval(interval);
      }
}, [proxy, stop]); 
useEffect(() => {
    if (server !== "--" && !err) {
        const interval = setInterval(() => {
         if((parseFloat(user.balance) - parseFloat(server.Price)) < 1){
            setErr(true)
            return
         }
          generateClient();
        }, 3000); 
        return () => clearInterval(interval);
      }
}, [server, stop]); 
  const handleUpdate =(result)=> setProxyHistory(prevHistory => [...prevHistory, result]);
  const generateServer = ()=>{
    const ip = ["192.168.2.1", "11.1.0.1", "171.16.0.1", "131.0.2.1", "243.0.113.1", "189.51.100.1"];
    const wallet= {"192.168.2.1":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", 
        "11.1.0.1": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "171.16.0.1"  :"1B4zP1eP5QGefi2DMMOTL5SLdv7Divf6a",
      "131.0.2.1": "1F2zP1ew5QGeFi2DMXXSTL5SLmv7Divf3a",
      "243.0.113.1": "1D1zP1eP5Q1efi2DM102fTL5SLmv7Divf1a",
      "189.51.100.1": "1S1zP1eP5QGefi2DMP34eL8SLmv7DivfN0"}
    const u = ["www.google.com", "www.abc.com", "www.123.com", "www.example.com", "www.example12.com"];
    const m = ["GET", "POST"]
    const stat =["Success", "Failed"]

    const randomIP = ip[Math.floor(Math.random() * ip.length)];
    const randomURL = u[Math.floor(Math.random() * u.length)];
    const randomMethod = m[Math.floor(Math.random() * m.length)];
    const randomStatus = stat[Math.floor(Math.random() * stat.length)];
    const received = (Math.random() * 10).toFixed(2); 
    const sent = randomMethod === "POST" ? (Math.random() * 3).toFixed(2) : 0; 
    const size = (parseFloat(sent) + parseFloat(received)).toFixed(2)
    const price = randomStatus === "Success" ? ((parseFloat(sent) + parseFloat(received)) * proxyPrice).toFixed(2) : 0.00;
    const time = (Math.random() * (10 - 0.1) + 0.1).toFixed(2);
    const bandwidth = (size / time);
    const from = wallet[randomIP];
    const to = user.walletID;
    function idgenerator() {
        let id = '';
        for (let i = 0; i < 64; i++) {
            id += '0123456789abcdef'.charAt(Math.floor(Math.random() * "0123456789abcdef".length));
        }
        return id;
    }
    const result ={
        id: idgenerator(),
        client: randomIP,
        Url: randomURL,
        method: randomMethod,
        time: formatTime(),
        status: randomStatus,
        size: size,
        sent: `${sent} MB`,
        received: `${received} MB`,
        Spent: 0.00,
        Earned :` ${price}`,
        bandwidth: bandwidth, 
        to: to,
        from:from
    }
    console.log(stop)
    if (stop.includes(randomIP)) {
        return;
    } 
    setUser(prev => {
        const updated = {
            ...prev,
            balance: (parseFloat(prev.balance) + parseFloat(price)).toFixed(2),
            transactions: [
                ...prev.transactions, result
            ]
        };
        localStorage.setItem(prev.privateKey, JSON.stringify(updated));
        return updated;
    });
    handleUpdate(result);
}
const generateClient = ()=>{
    const u = ["www.google.com", "www.abc.com", "www.123.com", "www.example.com", "www.example12.com"];
    const m = ["GET", "POST"]
    const stat =["Success", "Failed"]
    const wallet= {"192.168.1.1":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", 
        "10.1.0.1": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "170.16.0.1"  :"1B4zP1eP5QGefi2DMMOTL5SLdv7Divf6a",
      "191.0.2.1": "1F2zP1ew5QGeFi2DMXXSTL5SLmv7Divf3a",
      "213.0.113.1": "1D1zP1eP5Q1efi2DM102fTL5SLmv7Divf1a",
      "199.51.100.1": "1S1zP1eP5QGefi2DMP34eL8SLmv7DivfN0"}

    const randomURL = u[Math.floor(Math.random() * u.length)];
    const randomMethod = m[Math.floor(Math.random() * m.length)];
    const randomStatus = stat[Math.floor(Math.random() * stat.length)];
    const received = (Math.random() * 10).toFixed(2); 
    const sent = randomMethod === "POST" ? (Math.random() * 3).toFixed(2) : 0; 
    const size = (parseFloat(sent) + parseFloat(received)).toFixed(2);
    const price = randomStatus === "Success" ? ((parseFloat(sent) + parseFloat(received)) * server.Price).toFixed(2) : 0.00;
    const time = (Math.random() * (10 - 0.1) + 0.1).toFixed(2);
    const bandwidth = (size / time).toFixed(2)
    const to = server.location;
    const from = user.walletID;
    function idgenerator() {
        let id = '';
        for (let i = 0; i < 64; i++) {
            id += '0123456789abcdef'.charAt(Math.floor(Math.random() * "0123456789abcdef".length));
        }
        return id;
    }
    const result ={
        id: idgenerator(),
        client: "None",
        Url: randomURL,
        method: randomMethod,
        time: formatTime(),
        status: randomStatus,
        sent: `${sent} MB`,
        received: `${received} MB`,
        Spent:` ${price}`,
        Earned : 0.00, 
        bandwidth: bandwidth,
        to: to,
        from:from
    }
    if(((parseFloat(user.balance) - parseFloat(price)).toFixed(2)) < 0 ) {
        setErr(true);
        return
    }
    setTotal(prev=> (parseFloat(prev) + parseFloat(price)).toFixed(2));
    setUser(prev => {
        const updated = {
            ...prev,
            balance: (parseFloat(prev.balance) - parseFloat(price)).toFixed(2), 
            transactions: [
                ...prev.transactions, result
            ]
        };
        localStorage.setItem(prev.privateKey, JSON.stringify(updated));
        return updated;
    });
    handleUpdate(result);
    }
    const handleClick =()=>{
        setServer("--")
        setErr(false)
    }
    return(
        <div className="proxys">
            <h1 className="text">Proxy</h1>
            <div className="tabs">
                <nav className="settings_bar">
                <ul>
                    <li className={current === 'client' ? 'current' : ''}>
                    <a onClick={() => handleTabChange('client')} className="tab">
                        Proxy User
                    </a>
                    </li>
                    <li className={current === 'server' ? 'current' : ''}>
                    <a onClick={() => handleTabChange('server')} className="tab">
                        Proxy Provider
                    </a>
                    </li>
                    <li className={current === 'proxy' ? 'current' : ''}>
                    <a onClick={() => handleTabChange('proxy')} className="tab">
                        Full Proxy History
                    </a>
                    </li>
                </ul>
                </nav>
            </div>
            <div className="bottom_content">
                {current === "client" && (<Client user={user} setUser={setUser}/>)}
                {current === "server" && (<Server user={user} setUser={setUser}/>)}
                {current === "proxy" && (<History user={user}/>)}
            </div>
            {err && (
                <div>
                    <div>
                        <h3>Your account balance is low. You be disconnected from the proxy server.</h3>
                        <div id="items">
                            <button onClick={handleClick}>Ok</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
    )
}
const Delete = ({setNodes}) => {
    const [current, setCurrent] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [str, setStr] = useState("")
    const{stop, proxyHistory,setStop} = useContext(AppContext)
    const list = proxyHistory.reduce((acc, item) => {
        if (item.client !== "None" && !stop.includes(item.client) && !acc.some(existingItem => existingItem.client === item.client)) {
            acc.push(item); 
        }
        return acc; 
    }, []);
    console.log(list)
    console.log(stop)
  
    const exit = () => {
      setNodes(false);
    };
  
    const handleCheck = (index) => {
      setCurrent((prev) =>
        prev.includes(index) ? prev.filter((itemIndex) => itemIndex !== index) : [...prev, index]
      );
    };
  
    const handleDelete = () => {
      if(current.length === 0){
        return
      }
      setConfirm(true);
    };
  
    const handleYes = () => {
        const r = current.map(index => list[index].client);
      setStop((prev) => [...prev, ...r]);
      setConfirm(false);
      setCurrent([]);
      setStr("")
      setNodes(false);
    };
  
    const handleNo = () => {
      setConfirm(false);
    };
    return (
      <div id="band_container1">
        <div id="bandModal1">
          <button id="y" onClick={exit}><HiOutlineXMark size="20" /></button>
          <div id="t">
            {!confirm &&(<h3 id="modal_title">List of Currently Served Nodes</h3>)}
        </div>
          <div id="band_inner1">
            {!confirm && (
              <ul id="node_list">
                {list.map((item, index) => (
                  <li key={index}>
                    <label>
                      <input
                        type="checkbox"
                        checked={current.includes(index)}
                        onChange={() => handleCheck(index)}
                      />
                      {item.client}
                    </label>
                  </li>
                ))} 
              </ul>
            )}
            {confirm && (
              <div>
                <h3>Are you sure you want to stop providing proxy service to {current.map(index => list[index].client).join(', ')}?</h3>
                <div id="items">
                    <button id="yes2" onClick={handleYes}> Yes </button>
                    <button id="No2" onClick={handleNo}> No </button>
                </div>
              </div>
            )}
            {!confirm && <button id= "del" onClick={handleDelete}>Delete</button>}
          </div>
        </div>
      </div>
    );
  };
  
const BandwidthTable =({setB})=>{
    const {proxyHistory, stop} = useContext(AppContext)
    const [current, setCurrent] = useState([])
    const {mode}= useMode();
    useEffect(() => {
      handle();
    }, [proxyHistory, stop]);
    const handle =()=>{
        let list = proxyHistory.filter(item => item.client !== "None" && !stop.includes(item.client));
        const grouped = list.reduce((groups, item) => {
            let ip = item.client;
            if (!groups[ip]) {
                groups[ip] = [];
            }
            groups[ip].push(item);
            return groups;
        }, {});
        const averages = Object.keys(grouped).map(ip => {
            let current = grouped[ip];
            let total = current.reduce((sum, rec) => parseFloat(sum) + parseFloat(rec.bandwidth), 0);
            return{
                client: ip,
                avg: (total/current.length).toFixed(2), 
            }
        
        });
        setCurrent(averages);
    }
    const exit=()=>{
        setB(false);
    }
    return(
        <div id="band_container">
            <div id="bandModal">
            <button id="y" onClick={exit}><HiOutlineXMark size="20"/></button>
                <div id ="band_inner">
                <table id={mode==="dark"? "proxy_table_dark":"proxy_table"}>
                <thead>
                    <tr>
                    <th>Node Location </th>          
                    <th>Average Bandwidth Usage MB/s</th>
                    </tr>
                </thead>
                <tbody>
                {current.map((node) => (
                    <tr>
                        <td>{node.client}</td>
                        <td>{node.avg}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
       </div>
    </div>
    )
}
const History =()=>{
    const {proxyHistory} = useContext(AppContext);
    const [curr, setCurr] = useState(proxyHistory);
    const [sort, setSort] = useState("")
    useEffect(() => {
        const updateCurr = () => {
          let filteredList = proxyHistory
          if (sort === "Latest") {
            filteredList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            filteredList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
          setCurr(filteredList);
        };
        updateCurr(); 
      }, [proxyHistory, sort]); 
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sorted = [...proxyHistory];
        if (curSort === "Latest") {
            sorted = sorted.sort((a, b) => {
              const one = new Date(a.time).getTime(); 
              const two = new Date(b.time).getTime(); 
              return two - one;
            });          
        }
        if (curSort === "Earliest") {
            sorted = sorted.sort((a, b) => {
              const one = new Date(a.time).getTime(); 
              const two = new Date(b.time).getTime(); 
              return one - two;
            });          
        }
        setSort(event.target.value);
        setCurr([...sorted]);
    }
    return(
        <div id="history_container">
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
                <th>Client</th>
                <th>URL</th>
                <th>Method</th>
                <th>Time</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Received</th>
                <th>Cost (Oracoins)</th>
                <th>Earned (Orcacoins)</th>
                </tr>
            </thead>
            <tbody>
            {curr.map((row) => (
                <tr
                    key={row.id}
                >
                    <td>{row.client ==="None" ? "---": row.client}</td>
                    <td>{row.Url}</td>
                    <td>{row.method}</td>
                    <td>{row.time}</td>
                    <td>{row.status === "Success"? <FaCheck style={{color:'green'}}/>: <FaXmark style={{color: 'red'}}/> }</td>
                    <td>{row.sent}</td>
                    <td>{row.received}</td>
                    <td>{row.Spent}</td>
                    <td>{row.Earned}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    </div>
    </div>
 )
}
const Client =({user, setUser})=>{
    const {peers} = useContext(AppContext);
    const {server} = useContext(AppContext);
    const {mode} = useMode();
    const [click, setClick] = useState(false)
    const handleSelected=()=>{
        setClick(true);
    }
    return(
        <div id="client">
            <div className ={mode==="dark"? "top_info_dark":"top_info"}>
                {server === "--" && (
                    <div>
                        <div className = "top_title">
                            <FaRegCircleXmark color="red" size="24"/>
                            <h3 id="server_info"> Not Connected to Any Proxy Servers </h3>
                        </div>
                        <button id="conn" onClick={handleSelected}>Initiate Connection</button>
                    </div>)}
                {server !== "--" &&(<ProxyConnected user={user} setUser={setUser}/>)}
            </div>
            {click && (<ProxyModal user={user} setUser={setUser} setClick={setClick}/>)}
        </div>
    )
}
const ProxyConnected =({user, setUser})=>{
    const {server, total, setTotal} = useContext(AppContext);
    const [open, setOpen] = useState(false)
    const {mode} = useMode();
     const handleClick =() =>{
        setOpen(true)
        setTotal(0)
    }
    return(
        <div className={mode==="dark"? "top_dark":""} >
            <div id="client_top">
                <IoCheckmarkCircleOutline color="green" size="24"/>
                <h3 id= {mode==="dark"? "server_info_dark":"server_info"}>Connected to Proxy Server: {server === "--" ? "---" : server.location} </h3>
                <button id ="disconnect" onClick={handleClick}> Disconnect</button>
            </div>
                <div id="client_info">
                    <div className="box">
                        <h3> Wallet Balance: {user.balance} Oracoins </h3>
                    </div>
                    <div className="box">
                        <h3> Total Spent: {total} Oracoins</h3>
                    </div>
                    <div className="box">
                        <h3> Amount Charged Per MB: {server.Price} Oracoins</h3>
                    </div>
                </div>
            <div id="bottom_client">
                <h3 id="request_title">Proxy Requests History</h3>
                <ProxyDisplayClient user={user} setUser={setUser}/>
            </div>
            {open && (<DisModal setOpen={setOpen}/>)}
        </div>
    )
}
const DisModal =({setOpen})=>{
    const {server,setServer} = useContext(AppContext);
    const handleYes =()=>{
        setServer("--")
        setOpen(false)
    }
    const handleNo = ()=>{
        setOpen(false)
    }
    return(
    <div id="dis_container">
      <div id="disModal">
          <h3>Are you sure you want to disconnect from {server.location}?</h3>
          <div id="bottom_b">
            <button id="yes1" onClick={handleYes}> Yes </button>
            <button id="No1" onClick={handleNo}> No </button>
          </div>
      </div>
    </div>
    )
}

const Server = ({user,setUser}) =>{
   const {proxy, setProxy, proxyPrice} = useContext(AppContext);
   const [open, setOpen] = useState(false);
   const [pop,setPop] = useState(false)
   const [b, setB] = useState(false)
   const [nodes, setNodes] = useState(false)
    const handleProxy = () => {
    if (!proxy){
        setOpen(true)
    }
    else{
        setPop(true);
    }
};
   return(
      <div id="server">
        <div id="top_b">
            <div id ="inner_b">
                <h3>Provide Proxy Service</h3>
                <label className="sw">
                <input type="checkbox" 
                    checked={proxy} 
                    onChange={handleProxy} ></input>
                <span className="sl"></span>
                </label>
            </div>
        </div>
        {open && (<PriceModal setOpen={setOpen}/>)}
        {!open && proxy && (
            <div>
                <Stats setB={setB}setNodes={setNodes}/>
                <div id="extra">
                     <h3 id="history">Proxy Service History</h3>
                     <ProxyDisplayServer setUser={setUser}/>
                </div>
            </div>)}
        {pop && (<Confirmation setPop={setPop}/>)}
        {b && (<BandwidthTable setB={setB}/>)}
        {nodes && <Delete setNodes={setNodes}/> }
      </div>
   )
}
const Stats=({setB, setNodes})=>{
    const {proxy, setProxy, proxyPrice, proxyHistory, stop} = useContext(AppContext);
    const [rev, setRev] = useState(0)
    const [conn, setConn] = useState(0)
    const [ban, setBan] = useState(0.00)
    const {mode} = useMode()
    const calculate =()=>{
        let filteredList = proxyHistory.filter(item => item.client !== "None");

        let earnings = filteredList.reduce((total, item) => {
            return parseFloat(total) + parseFloat(item.Earned);
        }, 0);

        setRev(earnings.toFixed(2));
    }
    const find=()=>{
        const filtered = proxyHistory.filter(i => i.client !== "None");
        const totalConnected = new Set(filtered.map(i => i.client)); 
        const s = stop.length
        setConn(totalConnected.size - s)
    }
    const band = ()=>{
        const filtered = proxyHistory.filter(i => i.client !== "None" && !stop.includes(i.client));
        let usage = filtered.reduce((total, item) => {
            const x= parseFloat(total) + parseFloat(item.bandwidth);
            console.log(x)
            return x
        }, 0);
        setBan((parseFloat(usage)/ parseFloat(filtered.length)).toFixed(2))
    }
    useEffect(() => {
        calculate();
        find();
        band();
    }, [proxyHistory, stop]);
 
    return(
        <div className = "dashboard">
            <div className={mode==="dark"? "box_dark": "box"}>
                <h3 className = "box_title">Price Per MB</h3>
                <span className='span'>{proxyPrice} Orcacoins</span>
            </div>
            <div className={mode==="dark"? "box_dark": "box"}>
                <h3 className ="box_title">Serving</h3>
                <span className='span'>{conn} Peer Nodes </span>
                <div>
                  <button className="button" onClick={()=>{setNodes(true)}}>Disconnect</button>
                </div>
            </div>
            <div className={mode==="dark"? "box_dark": "box"}>
                <h3 className ="box_title">Total Revenue Earned</h3>
                <span className='span'>{rev} Oracoins </span>
            </div>
            <div className={mode==="dark"? "box_dark": "box"}>
                <h3 className ="box_title"> Average Bandwidth</h3>
                <span className='span' >{ban} MB/s </span>
                <button className="button"onClick={()=>setB(true)}>Bandwidth Usage Per Node</button>
            </div>

        </div>
    )
}
const Confirmation =({setPop})=>{
    const {proxy, setProxy} = useContext(AppContext);
    const [content, setContent] = useState("first")
    const handleYes=()=>{
        setContent("second")
        setProxy(prev =>!prev);
    }
    const handleNo = ()=>{
        setPop(false);
    }
    const exit=()=>{
        setProxy(false)
        setPop(false)
    }
    return(
        <div id="confirm_container">
            <div id="confirm_content">
               {content==="first" &&( <><h3> Are you sure you want to end the proxy service?</h3>
                <button id="yes5" onClick={handleYes}> Yes </button>
                <button id="No5" onClick={handleNo}> No </button></>)}
                {content==="second" &&(<><h3>You have successfully disconnected and your client nodes are notified.</h3><button id="okay"onClick={exit}>OK</button></>)}
             </div>
        </div>
    )
}
const PriceModal =({setOpen}) =>{
    const {proxy, setProxy, setproxyPrice} = useContext(AppContext);
    const [term, setTerm] = useState("")
    const [err, setErr] = useState(false)
    const[mess, setMess] = useState("")
    const {mode} = useMode();
    const exit = ()=>{
        setTerm(0)
        setOpen(false)
    }
    const handleChange=(e)=>{
        setErr(false)
        setMess("")
        setTerm(e.target.value)
    }
    const handleConfirm = (e)=>{
        e.preventDefault();
        if(term.trim() === ""){
            setErr(true)
            setMess("^This field can't be empty");
            return
        }
        if (/^\d+(\.\d+)?$/.test(term)){
            setproxyPrice(parseFloat(term));
            setProxy(true);
            setOpen(false);
        }
        else{
           setErr(true)
           setMess("^This field must be a numerical value");
        }
    }
    return(
        <div id="price_container">
            <div id="price_content">
                <button id="x" onClick={exit}><HiOutlineXMark size="20"/></button>
                <h3 id={mode==="dark"? "price_dark":"price"}>Please set a price for proxy service</h3>
                <div id="price_inner">
                    <input id="price_input" type="text" placeholder="Enter a price ..." value={term} onChange={handleChange} required ></input>
                    <button id="conSub" type ="submit" onClick={handleConfirm}>Confirm</button>
                </div>
                <div>
                    {err && (<span>{mess}</span>)}
                </div>
            </div>
           
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

const ProxyDisplayClient = ({user, setUser})=>{
    const {proxyHistory, setProxyHistory, server, total, setTotal} = useContext(AppContext);
    const [sort, setSort] = useState("")
    const [currList, setCurrList] = useState(proxyHistory.filter(item => item.client === "None"));
    const {mode} = useMode();
    useEffect(() => {
        const updateCurrList = () => {
          const filteredList = proxyHistory.filter(item => item.client === "None");
          if (sort === "Latest") {
            filteredList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            filteredList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
          setCurrList(filteredList);
        };
        updateCurrList(); 
      }, [proxyHistory, sort]); 

    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = proxyHistory.filter(item => item.client === "None");
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
        setCurrList(sortedList);
    }
    console.log(currList);
    console.log(total);
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
            <table id={mode==="dark"? "proxy_data_dark": "proxy_data"}>
                <thead>
                    <tr>
                    <th>URL</th>
                    <th>Method</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Received</th>
                    <th>Cost (Oracoins)</th>
                    </tr>
                </thead>
                <tbody>
                {currList.map((row) => (
                    <tr
                        key={row.id}
                    >
                        <td>{row.Url}</td>
                        <td>{row.method}</td>
                        <td>{row.time}</td>
                        <td>{row.status === "Success"? <FaCheck style={{color:'green'}}/>: <FaXmark style={{color: 'red'}}/> }</td>
                        <td>{row.sent}</td>
                        <td>{row.received}</td>
                        <td>{row.Spent}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </div>
    )
}
const ProxyDisplayServer =({user, setUser})=>{
    const {proxy, proxyHistory, setProxyHistory, proxyPrice} = useContext(AppContext);
    const [currList, setCurrList] = useState(proxyHistory.filter(item => item.client !== "None"));
    const [sort, setSort] = useState("")
    const {mode} = useMode();
    useEffect(() => {
        const updateCurrList = () => {
          const filteredList = proxyHistory.filter(item => item.client !== "None");
          if (sort === "Latest") {
            filteredList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            filteredList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
          setCurrList(filteredList);
        };
        updateCurrList(); 
      }, [proxyHistory, sort]); 
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = proxyHistory.filter(item => item.client !== "None")
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
        setCurrList([...sortedList]); 
    }
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
            <table id= {mode==="dark"? "proxy_data_dark": "proxy_data"}>
                <thead>
                    <tr>
                    <th>Client IP</th>
                    <th>URL</th>
                    <th>Method</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Received</th>
                    <th>Profit (OrcaCoins)</th>
                    </tr>
                </thead>
                <tbody>
                {currList.map((row) => (
                    <tr
                        key={row.id}
                    >
                        <td>{row.client}</td>
                        <td>{row.Url}</td>
                        <td>{row.method}</td>
                        <td>{row.time}</td>
                        <td>{row.status === "Success"? <FaCheck style={{color:'green'}}/>: <FaXmark style={{color: 'red'}}/> }</td>
                        <td>{row.sent}</td>
                        <td>{row.received}</td>
                        <td>{row.Earned}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </div>
    )
}
export default ProxyContent;