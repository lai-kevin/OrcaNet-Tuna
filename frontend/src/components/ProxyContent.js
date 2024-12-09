import React, { useContext, useState, useEffect } from 'react';
import ProxyModal from './ProxyModal';
import { AppContext } from './AppContext';
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
import { FaRegCircleXmark } from "react-icons/fa6";
import { HiOutlineXMark } from "react-icons/hi2";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useMode } from './Mode';
import { fetchData } from '../ProxyAPI';
const ProxyContent=()=>{
  const [current, setCurrent] = useState('client');
  const [err, setErr] = useState(false)
  const {mode} = useMode();
  const {user, setUser, server, setServer,proxy, proxyPrice, proxyHistory, setProxyHistory,setTotal,setServerHistory, stop, ownHistory, setOwnHistory} = useContext(AppContext);
  const [curr, setCurr] = useState("confirm");
  const handleTabChange = (page) => {
    setCurrent(page);
  };

  useEffect(() => {
    console.log('Calling ProxyAPI fetchData...');
    fetchData()
        .then(response => {
            console.log('ProxyAPI Response:', response);
        })
        .catch(error => {
            console.error('Error fetching data from ProxyAPI:', error);
        });
}, []); // Empty dependency array to call it only once when the component mounts


  //dummy data are being randomly generated and shown to demonstrate how the UI would look like
  useEffect(() => {
    if (proxy) {
        const interval = setInterval(() => {
          generateServer();
        }, 3000); 
        return () => clearInterval(interval);
      }
}, [proxy, stop, proxyHistory]); 
useEffect(() => {
    if (server !== "--" && !err) {
        const interval = setInterval(() => {
         if((parseFloat(user.balance - server.Price)) < parseFloat(server.Price)){
            setErr(true)
            return;
         }
          generateClient();
        }, 3000); 
        return () => clearInterval(interval);
      }
}, [server, proxyHistory, user]); 
  const handleUpdate = (result)=> setProxyHistory(prevHistory => [...prevHistory, result]);
  const handleUpdate1 = (result)=> setServerHistory(prevHistory => [...prevHistory, result]);
  const handleUpdate2 = (result)=> setOwnHistory(prevHistory => [...prevHistory, result]);
  const generateServer = ()=>{
    const locations = [
        "California, USA",
        "Texas, USA",
        "Florida, USA",
        "New York, USA",
        "Illinois, USA",
        "Pennsylvania, USA",
        "Ohio, USA",
        "Georgia, USA",
        "North Carolina, USA",
        "Michigan, USA",
        "New Jersey, USA",
        "Wisconsin, USA"
    ];
    
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
    const randomLocation= locations[Math.floor(Math.random() * locations.length)];
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
        location: randomLocation,
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
        from:from,
        Type: "proxy"
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
    handleUpdate(result); // add to the whole proxy history of packets
    handleUpdate1(result); // add to server history 
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
    const to = user.walletID;
    const from = server.wallet;
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
        size: size,
        sent: `${sent} MB`,
        received: `${received} MB`,
        Spent:` ${price}`,
        Earned : 0.00, 
        bandwidth: bandwidth,
        to: to,
        from:from,
        Type: "proxy"
    }
    if ((parseFloat((user.balance - price)).toFixed(2)) < 0) {
        setErr(true);
        return;
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
    handleUpdate(result); // add to the whole proxy
    handleUpdate2(result); // add to current history
    }
    const handleClick =()=>{
        const spent = ownHistory.reduce((acc, transaction) => {
            return parseFloat(acc) + parseFloat(transaction.Spent);
          }, 0);
        let curr = {...server, end: formatTime(), status: "Disconnected", Spent: spent.toFixed(2), Earned:"--"};
        console.log(curr);
        setUser(prev => {
            const updated = {
                ...prev,
                proxied: [
                    ...prev.proxied, curr
                ]
            };
            localStorage.setItem(prev.privateKey, JSON.stringify(updated));
            return updated;
        });
        console.log(user);
        setCurr("progress")
    }
    useEffect(() => {
        let timer; 
        if (curr === "progress") {
            timer = setTimeout(() => {
                setErr(false);
                setCurr("confirm")
                setServer("--");
                setOwnHistory([]);
            }, 3000);
        }
        return () => clearTimeout(timer); 
    }, [curr]);

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
            {err && curr==="confirm" && (
                <div id="price_container">
                    <div id="price_content">
                        <h3 style={{ color: mode === "dark" ? "black" : "black" }}>Your account balance is low. You will be disconnected from the proxy server.</h3>
                        <div id="items">
                            <button id="okay1" onClick={handleClick}>Ok</button>
                        </div>
                    </div>
                </div>
            )}
            {err && curr==="progress" && (
                <div id="price_container">
                    <div id="price_content">
                        <h3>Disconnecting from proxy node...</h3>
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                     </div>
                </div>
            )}
    </div>
    )
}
const Serving = () =>{
    const {serverHistory, user, stop} = useContext(AppContext);
    const hist = Object.values(
        serverHistory.reduce((acc, item) => {
          const client = item.client;
      
          if (stop.includes(client)) {
            return acc;
          }
      
          if (!acc[client]) {
            acc[client] = {
              client: client,
              location: item.location,
              Earned: 0,
              Spent:"--",
              totalBandwidth: 0, 
              count: 0,     
              date: item.time,
              end: "---",
              status: "Connected"
            };
          }
          acc[client].Earned += parseFloat(item.Earned);
          acc[client].totalBandwidth += parseFloat(item.bandwidth);
          acc[client].count += 1;
      
          return acc;
        }, {})
      ).map(clientData => ({
        ...clientData,
        averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
        Earned: parseFloat(clientData.Earned).toFixed(2)
      }));
    const conHist = [...hist, ...user.servedHistory]; // retrieve the previously servered requests
    const [currList, setCurrList] = useState(conHist.sort((a, b) => {
        const one = new Date(a.date).getTime(); 
        const two = new Date(b.date).getTime(); 
        return two - one;
      }));
    const [sort, setSort] = useState("")
    const {mode} = useMode();
    useEffect(() => {
        const hist = Object.values(
            serverHistory.reduce((acc, item) => {
              const client = item.client;
          
              if (stop.includes(client)) {
                return acc;
              }
          
              if (!acc[client]) {
                acc[client] = {
                  client: client,
                  location: item.location,
                  Earned: 0,
                  Spent: "--",
                  totalBandwidth: 0, 
                  count: 0,     
                  date: item.time,
                  end: "---",
                  status: "Connected"
                };
              }
              acc[client].Earned += parseFloat(item.Earned);
              acc[client].totalBandwidth += parseFloat(item.bandwidth);
              acc[client].count += 1;
          
              return acc;
            }, {})
          ).map(clientData => ({
            ...clientData,
            averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
            Earned: parseFloat(clientData.Earned).toFixed(2)
          }));
        const conHist = [...hist, ...user.servedHistory]; 
        if (sort === "Latest") {
            conHist.sort((a, b) => new Date(b.date) - new Date(a.date));
          } else if (sort === "Earliest") {
            conHist.sort((a, b) => new Date(a.date) - new Date(b.date));
          }
        setCurrList(conHist);
    },[stop, serverHistory, sort]);
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = [...currList];
        if (curSort === "Latest") {
            sortedList = sortedList.sort((a, b) => {
              const one = new Date(a.date).getTime(); 
              const two = new Date(b.date).getTime(); 
              return two - one;
            });          
        }
        if (curSort === "Earliest") {
            sortedList = sortedList.sort((a, b) => {
              const one = new Date(a.date).getTime(); 
              const two = new Date(b.date).getTime(); 
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
        <table id={mode==="dark"? "proxy_data_dark": "proxy_data"}>
            <thead>
                <tr>
                <th>IP</th>
                <th>Location</th>
                <th>Status </th>
                <th>Started </th>
                <th>Ended </th>
                <th>Average Bandwidth</th>
                <th>Profit (Oracoins)</th>
                </tr>
            </thead>
            <tbody>
            {currList.map((row) => (
                <tr
                    key={row.id}
                >
                    <td>{row.client}</td>
                    <td>{row.location}</td>
                    <td>{row.status}</td>
                    <td>{row.date}</td>
                    <td>{row.end}</td>
                    <td>{row.averageBandwidth}</td>
                    <td>{row.Earned}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    </div>
    )
}
const Delete = ({setNodes}) => {
    const [current, setCurrent] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [str, setStr] = useState("")
    const {mode} = useMode();
    const{setUser, stop, proxyHistory,setStop, serverHistory} = useContext(AppContext)
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
      const conHist = Object.values(
        serverHistory.reduce((acc, item) => {
          const client = item.client;
      
          if (r.includes(client)) {
      
            if (!acc[client]) {
                acc[client] = {
                client: client,
                location: item.location,
                Earned: 0,
                Spent:"--",
                totalBandwidth: 0, 
                count: 0,     
                date: item.time,
                end: formatTime(),
                status: "Disconnected"
                };
            }
            acc[client].Earned += parseFloat(item.Earned);
            acc[client].totalBandwidth += parseFloat(item.bandwidth);
            acc[client].count += 1;
        }
          return acc;
        }, {})
      ).map(clientData => ({
        ...clientData,
        averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
        Earned: parseFloat(clientData.Earned).toFixed(2)
      }));
      
        // add all the served history to database
      setUser(prev => {
          const updated = {
              ...prev,
              servedHistory: [
                  ...prev.servedHistory, ...conHist
              ],
          };
          localStorage.setItem(prev.privateKey, JSON.stringify(updated));
          return updated;
      });
    };
  
    const handleNo = () => {
      setConfirm(false);
    };
    return (
      <div id="band_container1">
        <div id="bandModal1">
          <button id="y" onClick={exit}><HiOutlineXMark size="20" /></button>
          <div id="t">
            {!confirm &&(<h3 id="modal_title" style={{ color: mode === "dark" ? "black" : "black" }}>List of Currently Served Nodes</h3>)}
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
                <h3 style={{ color: mode === "dark" ? "black" : "black" }}> Are you sure you want to stop providing proxy service to {current.map(index => list[index].client).join(', ')}?</h3>
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
                    <table id="proxy_table">
                    <thead>
                        <tr>
                        <th style={{ color: mode === "dark" ? "black" : "black" }}>Node Location </th>          
                        <th style={{ color: mode === "dark" ? "black" : "black" }}>Average Bandwidth Usage MB/s</th>
                        </tr>
                    </thead>
                    <tbody>
                    {current.map((node) => (
                        <tr>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{node.client}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{node.avg}</td>
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
    const {serverHistory, ownHistory, stop, user, server} = useContext(AppContext);
    const sp = ownHistory.reduce((acc, transaction) => {
        return parseFloat(acc) + parseFloat(transaction.Spent)
      }, 0);
    let updatedList = [...user.proxied];
    if(server!== "--"){
        let current= {...server, end: "---", status: "Connected", Spent: sp.toFixed(2), Earned:"--"};
        updatedList = [current, ...user.proxied];
    }
    const hist = Object.values(
        serverHistory.reduce((acc, item) => {
          const client = item.client;
      
          if (stop.includes(client)) {
            return acc;
          }
      
          if (!acc[client]) {
            acc[client] = {
              client: client,
              location: item.location,
              Earned: 0,
              Spent:"--",
              totalBandwidth: 0, 
              count: 0,     
              date: item.time,
              end: "---",
              status: "Connected"
            };
          }
          acc[client].Earned += parseFloat(item.Earned);
          acc[client].totalBandwidth += parseFloat(item.bandwidth);
          acc[client].count += 1;
      
          return acc;
        }, {})
      ).map(clientData => ({
        ...clientData,
        averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
        Earned: parseFloat(clientData.Earned).toFixed(2)
      }));

    const conHist = [...hist, ...user.servedHistory];
    const allHist = [...updatedList, ...conHist];
    console.log(allHist)
    const [curr, setCurr] = useState(allHist);
    const [sort, setSort] = useState("")
    useEffect(() => {
        const updateCurr = () => {
            const sp = ownHistory.reduce((acc, transaction) => {
                return parseFloat(acc) + parseFloat(transaction.Spent)
              }, 0);
            let updatedList = [...user.proxied];
            if(server!== "--"){
                let current= {...server, end: "---", status: "Connected", Spent: sp.toFixed(2), Earned:"--"};
                updatedList = [current, ...user.proxied];
            }
            const hist = Object.values(
                serverHistory.reduce((acc, item) => {
                  const client = item.client;
              
                  if (stop.includes(client)) {
                    return acc;
                  }
              
                  if (!acc[client]) {
                    acc[client] = {
                      client: client,
                      location: item.location,
                      Earned: 0,
                      Spent:"--",
                      totalBandwidth: 0, 
                      count: 0,     
                      date: item.time,
                      end: "---",
                      status: "Connected"
                    };
                  }
                  acc[client].Earned += parseFloat(item.Earned);
                  acc[client].totalBandwidth += parseFloat(item.bandwidth);
                  acc[client].count += 1;
              
                  return acc;
                }, {})
              ).map(clientData => ({
                ...clientData,
                averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
                Earned: parseFloat(clientData.Earned).toFixed(2)
              }));
            const conHist = [...hist, ...user.servedHistory];
            const allHist = [...updatedList, ...conHist];
          if (sort === "Latest") {
            allHist.sort((a, b) => new Date(b.date) - new Date(a.date));
          } else if (sort === "Earliest") {
            allHist.sort((a, b) => new Date(a.date) - new Date(b.date));
          }
          setCurr(allHist);
        };
        updateCurr(); 
      }, [ownHistory, serverHistory, sort]); 
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sorted = [...allHist];
        if (curSort === "Latest") {
            sorted = sorted.sort((a, b) => {
              const one = new Date(a.date).getTime(); 
              const two = new Date(b.date).getTime(); 
              return two - one;
            });          
        }
        if (curSort === "Earliest") {
            sorted = sorted.sort((a, b) => {
              const one = new Date(a.date).getTime(); 
              const two = new Date(b.date).getTime(); 
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
        <div id ="table_cont1">
        <table id="proxy_data">
            <thead>
                <tr>
                <th>IP</th>
                <th>Location</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Spent (Oracoins)</th>
                <th>Earned (Orcacoins)</th>
                </tr>
            </thead>
            <tbody>
            {curr.map((row) => (
                <tr
                    key={row.id}
                >
                    <td>{row.client || row.ip}</td>
                    <td>{row.location}</td>
                    <td>{row.date}</td>
                    <td>{row.end}</td>
                    <td>{row.status === "Connected"? <FaCheck style={{color:'green'}}/>: <FaXmark style={{color: 'red'}}/> }</td>
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
const Client =()=>{
    const {server, user, setUser} = useContext(AppContext);
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
                            <h3 id="server_info"> Not Connected to Any Proxy Node </h3>
                        </div>
                        <button id="conn" onClick={handleSelected}>Initiate Connection</button>
                    </div>)}
                {server !== "--" &&(<ProxyConnected user={user} setUser={setUser}/>)}
            </div>
            {click && (<ProxyModal user={user} setUser={setUser} setClick={setClick}/>)}
        </div>
    )
}
const ProxyConnected =()=>{
    const {server, total, setTotal, user, setUser} = useContext(AppContext);
    const [open, setOpen] = useState(false)
    const {mode} = useMode();
    const [current, setCurrent] = useState("connection")
     const handleClick =() =>{
        setOpen(true)
        setTotal(0)
    }
    const handleTabChange = (page) => {
        setCurrent(page);
      };
    return(
        <div className={mode==="dark"? "top_dark":""} >
            <div id="client_top">
                <IoCheckmarkCircleOutline color="green" size="24"/>
                <h3 id= {mode==="dark"? "server_info_dark":"server_info"}>Connected to Proxy Node: {server === "--" ? "---" : server.ip} [{server.location}]</h3>
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
                <h3 id="request_title">Proxy History</h3>
                <div className="tab">
                <nav className="proxy_bar">
                <ul>
                    <li>
                    <a className={current === 'connection' ? 'current1' : ''} onClick={() => handleTabChange('connection')}>
                        Connections
                    </a>
                    </li>
                    <li>
                    <a className={current === 'request' ? 'current1' : ''} onClick={() => handleTabChange('request')}>
                        Requests
                    </a>
                    </li>
                </ul>
                </nav>
            </div>
                {current=== "request" && (<ProxyDisplayClient/>)}
                {current=== "connection" && (<Connections user={user}/>)}
            </div>
            {open && (<DisModal setOpen={setOpen}/>)}
        </div>
    )
}
const Connections = () =>{
    const {user, ownHistory, server} = useContext(AppContext);
    const spent = ownHistory.reduce((acc, transaction) => {
        return parseFloat(acc) + parseFloat(transaction.Spent);
      }, 0);
    let curr = {...server, end: "---", status: "Connected", Spent: spent.toFixed(2), Earned:"--"};
    let conHist = [curr, ...user.proxied]
    const [currList, setCurrList] = useState(conHist.sort((a, b) => {
        const one = new Date(a.date).getTime(); 
        const two = new Date(b.date).getTime(); 
        return two - one;
      }));
    const [sort, setSort] = useState("")
    const {mode} = useMode();
    useEffect(() => {
        const spent = ownHistory.reduce((acc, transaction) => {
            return parseFloat(acc) + parseFloat(transaction.Spent)
          }, 0);
        let curr = {...server, end: "---", connection: "Connected", Spent: spent.toFixed(2), Earned:"--"};
        let updatedList = [curr, ...user.proxied];
        if (sort === "Latest") {
            updatedList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            updatedList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
        setCurrList(updatedList);
    }, [ownHistory, sort]); 
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = [...currList];
        if (curSort === "Latest") {
            sortedList = sortedList.sort((a, b) => {
              const one = new Date(a.date).getTime(); 
              const two = new Date(b.date).getTime(); 
              return two - one;
            });          
        }
        if (curSort === "Earliest") {
            sortedList = sortedList.sort((a, b) => {
              const one = new Date(a.date).getTime(); 
              const two = new Date(b.date).getTime(); 
              return one - two;
            });          
        }
        setSort(event.target.value);
        setCurrList([...sortedList]);
    }
    return(
        <div id="connect_cont">
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
                <th>IP</th>
                <th>Location</th>
                <th>Time</th>
                <th>End Time</th>
                <th>Cost (Oracoins)</th>
                <th>Total Spent (Oracoins)</th>
                </tr>
            </thead>
            <tbody>
            {currList.map((row) => (
                <tr
                    key={row.id}
                >
                    <td>{row.ip}</td>
                    <td>{row.location}</td>
                    <td>{row.date}</td>
                    <td>{row.end}</td>
                    <td>{row.Price}</td>
                    <td>{row.Spent}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    </div>
    )
}
const DisModal =({setOpen})=>{
    const {user, server,setServer, setUser,ownHistory, setOwnHistory, isProgressing, setIsProgressing} = useContext(AppContext);
    const [curr, setCurr] = useState("confirm");
    const handleYes =()=>{
        const spent = ownHistory.reduce((acc, transaction) => {
            return parseFloat(acc) + parseFloat(transaction.Spent);
        }, 0);
        let currData = {...server, end: formatTime(), status: "Disconnected", Spent: spent.toFixed(2), Earned:"--"};

        setUser(prev => {
            const updated = {
                ...prev,
                proxied: [...prev.proxied, currData],
            };
            localStorage.setItem(prev.privateKey, JSON.stringify(updated));
            return updated;
        });
        setCurr("progress")
    }
    useEffect(() => {
        let timer; 
        if (curr === "progress") {
            timer = setTimeout(() => {
                setOpen(false);
                setServer("--");
                setOwnHistory([]);
            }, 3000);
        }
        return () => clearTimeout(timer); 
    }, [curr]);
    const handleNo = ()=>{
        setOpen(false)
    }
    return(
    <div id="dis_container">
      <div id="disModal">
          {curr==="confirm" && (<><h3>Are you sure you want to disconnect from {server.ip}?</h3>
          <div id="bottom_b">
            <button id="yes1" onClick={handleYes}> Yes </button>
            <button id="No1" onClick={handleNo}> No </button>
          </div>
          </>)}
          {curr==="progress" && (
                <>
                <h3>Disconnecting from proxy node...</h3>
                <div className="spinner-container">
                    <div className="spinner" />
                </div>
                </>
            )}
      </div>
    </div>
    )
}

const Server = () =>{
   const {proxy} = useContext(AppContext);
   const [open, setOpen] = useState(false);
   const [pop,setPop] = useState(false)
   const [b, setB] = useState(false)
   const [nodes, setNodes] = useState(false)
   const [current, setCurrent] = useState("connection");
   const handleTabChange = (page) => {
    setCurrent(page);
  };
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
                     <h3 id="history">Proxy History</h3>
                     <div className="tab">
                            <nav className="proxy_bar">
                            <ul>
                                <li>
                                <a className={current === 'connection' ? 'current1' : ''} onClick={() => handleTabChange('connection')}>
                                    Connections
                                </a>
                                </li>
                                <li>
                                <a className={current === 'request' ? 'current1' : ''} onClick={() => handleTabChange('request')}>
                                    Requests
                                </a>
                                </li>
                            </ul>
                            </nav>
                        </div>
                     {current === "request" && (<ProxyDisplayServer/>)}
                     {current === "connection" && (<Serving/>)}
                </div>
            </div>)}
        {pop && (<Confirmation setPop={setPop}/>)}
        {b && (<BandwidthTable setB={setB}/>)}
        {nodes && <Delete setNodes={setNodes}/> }
      </div>
   )
}
const Stats=({setB, setNodes})=>{
    const {proxyPrice, proxyHistory, serverHistory, stop} = useContext(AppContext);
    const [rev, setRev] = useState(0)
    const [conn, setConn] = useState(0)
    const [ban, setBan] = useState(0.00)
    const {mode} = useMode()
    const calculate =()=>{
        let filteredList = serverHistory.filter(item => item.client !== "None");

        let earnings = filteredList.reduce((total, item) => {
            return parseFloat(total) + parseFloat(item.Earned);
        }, 0);

        setRev(earnings.toFixed(2));
    }
    const find=()=>{
        const filtered = serverHistory.filter(i => i.client !== "None");
        const totalConnected = new Set(filtered.map(i => i.client)); 
        const s = stop.length
        setConn(totalConnected.size - s)
    }
    const band = ()=>{
        const filtered = serverHistory.filter(i => i.client !== "None" && !stop.includes(i.client));
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
    }, [serverHistory, stop]);
 
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
    const {setUser, setProxy, stop, setStop, setServerHistory, serverHistory} = useContext(AppContext);
    const [content, setContent] = useState("first");
    const {mode} = useMode();
    const handleYes=()=>{
        setContent("second")
        setProxy(prev =>!prev);
        const conHist = Object.values(
          serverHistory.reduce((acc, item) => {
            const client = item.client;
        
            if (stop.includes(client)) {
              return acc;
            }
        
            if (!acc[client]) {
              acc[client] = {
                client: client,
                location: item.location,
                Earned: 0,
                Spent:"--",
                totalBandwidth: 0, 
                count: 0,     
                date: item.time,
                end: formatTime(),
                status: "Disconnected"
              };
            }
            acc[client].Earned += parseFloat(item.Earned);
            acc[client].totalBandwidth += parseFloat(item.bandwidth);
            acc[client].count += 1;
        
            return acc;
          }, {})
        ).map(clientData => ({
          ...clientData,
          averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
        }));

          // add all the served history to database
        setUser(prev => {
            const updated = {
                ...prev,
                servedHistory: [
                    ...prev.servedHistory, ...conHist
                ],
                //servedRequests: [...prev.servedRequests, ...serverHistory]
            };
            localStorage.setItem(prev.privateKey, JSON.stringify(updated));
            return updated;
        });
        setStop([])
        setServerHistory([]); // clear the current serving history
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
               {content==="first" &&( <><h3 style={{ color: mode === "dark" ? "black" : "black" }}> Are you sure you want to end the proxy service?</h3>
                <button id="yes5" onClick={handleYes}> Yes </button>
                <button id="No5" onClick={handleNo}> No </button></>)}
                {content==="second" &&(<><h3 style={{ color: mode === "dark" ? "black" : "black" }}>You have successfully disconnected and your client nodes are notified.</h3><button id="okay"onClick={exit}>OK</button></>)}
             </div>
        </div>
    )
}
const PriceModal =({setOpen}) =>{
    const { setProxy, setproxyPrice} = useContext(AppContext);
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
                    <span style={{color: "blue", size:"20px"}}>Oracoins</span>
                </div>
                {err && (<span style={{color:"red", marginLeft:"100px"}}>{mess}</span>)}
                <div>
                <button id="conSub" type ="submit" onClick={handleConfirm}>Confirm</button>
                </div>
                <div>
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

const ProxyDisplayClient = ()=>{
    const {ownHistory,total} = useContext(AppContext);
    const [sort, setSort] = useState("")
    const [currList, setCurrList] = useState(ownHistory.filter(item => item.client === "None"));
    const {mode} = useMode();
    useEffect(() => {
        const updateCurrList = () => {
          const filteredList = ownHistory.filter(item => item.client === "None");
          if (sort === "Latest") {
            filteredList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            filteredList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
          setCurrList(filteredList);
        };
        updateCurrList(); 
      }, [ownHistory, sort]); 

    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = ownHistory.filter(item => item.client === "None");
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
const ProxyDisplayServer =()=>{
    const {serverHistory} = useContext(AppContext);
    const [currList, setCurrList] = useState(serverHistory);
    const [sort, setSort] = useState("")
    const {mode} = useMode();
    useEffect(() => {
        const updateCurrList = () => {
          const filteredList = serverHistory.filter(item => item.client !== "None");
          if (sort === "Latest") {
            filteredList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            filteredList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
          setCurrList(filteredList);
        };
        updateCurrList(); 
      }, [serverHistory, sort]); 
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sortedList = serverHistory.filter(item => item.client !== "None")
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