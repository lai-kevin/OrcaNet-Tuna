import React, { useState, useRef, useEffect, useContext} from 'react';
import InfoBox from './InfoBox';
import orca from './images/orca.jpg'
import QRCode from 'react-qr-code';
import { FaRegCopy } from "react-icons/fa";
import { FaQrcode } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { SiEnvoyproxy } from "react-icons/si";
import { HiOutlineXMark } from "react-icons/hi2";
import { GiMining } from "react-icons/gi";
import { FaCoins } from "react-icons/fa";
import { AppContext } from './AppContext';
import * as Wallet from "../WalletAPI"
import { getUpdatesFromGoNode } from '../RpcAPI';
const AccountContent = ({mode}) => {
    return(
     <div className = "account">
        <InfoBox key="profile" content= {<Profile mode={mode}/>}/>
        <InfoBox key="transaction" content= {<Transaction mode={mode}/>}/>
     </div>
    )
};
const Profile = ({mode})=>{
    const {user, setUser, mining} = useContext(AppContext);
    const [qr, setQr] = useState("close")
    const [open, setOpen] = useState(false)
    const [view, setView] = useState(false)
    const handleQr = ()=>{
        setQr(prevState =>(prevState === "open" ? "close": "open"))
    }
    const handleCopy = () => {
        navigator.clipboard.writeText(user.walletID)
    };
    const profile = useRef(null);
    const out = (e)=>{
        if (profile.current && !profile.current.contains(e.target)) {
            console.log("outside");
            console.log(qr);
            setQr("close"); 
        }
    }
    useEffect(() => {
        document.addEventListener('mousedown', out);
        return () => {
            document.removeEventListener('mousedown', out);
        };
    }, []);
    console.log(mining)
    useEffect(() => {
        const fetchBalance = async () => {
          try {
            const bal = await Wallet.balance();
            const fileShareStartupState = await getUpdatesFromGoNode([]);//set peer id here for now
            const peer_Id = fileShareStartupState.result.peer_id;
            setUser((prev) => {
                return { ...prev, balance: bal.balance, peerId: peer_Id};
              });
          } catch (error) {
            console.error("Failed to fetch balance:", error); 
          }
        };
        fetchBalance(); 
      }, []);
    return(
        <div className='profile'>
            <h3 id="profile_title">Wallet</h3>
            <div className ="profile_container">
                <div className="profile_pic">
                    <img src={orca} alt="orca" style={{ width: '108%', height: '108%', background: 'white',  borderRadius: '80px', marginLeft:"-7px", marginTop:"-7px"}}/>
                </div>
                <h4 id ="wID" >Wallet Address: </h4>
                <span id="number" style={{ color: mode === "dark" ? "white" : "black" }}>{user.walletID}</span>
                <button type="button" id = {mode ==="dark"? "copy_button_dark": "copy_button"} onClick={handleCopy}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button>
                <button type="button" id = {mode ==="dark"? "copy_button_dark": "copy_button"} ref={profile} onClick={handleQr}><FaQrcode  style={{ width: '100%', height: '100%', background: 'transparent'}}/></button>
                {qr === "open" && (<QRCode id="qr" value={user.walletID}></QRCode>)}
            </div>
            <div id="profile_bottom">
                <h4 id ="wID">Balance: </h4>
                <span id = "coins" style={{ color: mode === "dark" ? "white" : "black" }}>{user.balance}</span>
                <span id = "type" style={{ color: mode === "dark" ? "white" : "black" }}>OrcaCoins</span>
                {!mining && (<button type="button" id ="mine" onClick={()=>setOpen(true)}> Mine Coins </button>)}
                {mining && (<button type="button" id ="mine1" onClick={()=>setView(true)}> View Mining Progress </button>)}
                <br/>
            </div>        
            <div id='profile_peerid'>
            <h4 id ="wID" >Peer ID: <span id="number" style={{ color: mode === "dark" ? "white" : "black" }}>{user.peerId}</span></h4>
            </div>
            {open && (<MineMenu setOpen={setOpen}/>)}
            {view && (<Progress setView = {setView}/>)}
        </div>
    )
}
const MineMenu=({setOpen})=>{
    const [curr, setCurr] = useState("first")
    const[amount, setAmount] = useState("")
    const [mess, setMess] = useState("")
    const[err, setErr] = useState(false)
    const {setMining, setBlocks, setTime} = useContext(AppContext)
    const exit = () => {
        setOpen(false);
    };
    const handleInput=(e)=>{
        setAmount(e.target.value);
        if(err){
            setErr(false)
        }
    }
    const handleConfirm = (e)=>{
        e.preventDefault();
        if(amount.trim() === ""){
            setErr(true)
            setMess("^This field can't be empty");
            return
        }
        if (/^\d+$/.test(amount)) {
            setErr(false);
            setMess(""); 
            const actual = parseInt(amount, 10);

            setBlocks(actual)

            // intitate the mining process
            setCurr("second")
            setMining(true)

            // save the time started mining
            setTime(new Date())
            const timeoutId = setTimeout(() => {
                setCurr("third");
            }, 10000);

            Wallet.mine(actual).then(()=>{
                setMining(false)
                setBlocks(0)
                setTime("")
                setAmount("")
            })
            .catch((error)=>{
               setTimeout(() => {
                clearTimeout(timeoutId);
                setCurr("error"); 
                setTime("")
                setAmount("")
                setBlocks(0)
                }, 2000);
            })
        } else {
            setErr(true);
            setMess("^This field must be a whole number");
        }
    }
    const handleClick =()=>{
        setCurr("first")
        setMining(false)
    }
    const handleClick1 =()=>{
        setOpen(false)
    }
    return(
        <div id = "container1">
            <div id="content4">
                {curr==="first" &&(<><button id="x1" onClick={exit}><HiOutlineXMark size="20"/></button>
                <h3 style={{ color: "black"}}>How many blocks would you like to mine?</h3>
                <input type="text" id="amount" value={amount} onChange={handleInput} placeholder='Enter an amount'></input>
                <span style={{color: "blue", size:"20px", marginLeft:"10px"}}>Blocks</span>
                <button id="con" type ="submit" onClick={handleConfirm}>Confirm</button>
                {err && (<p style={{color:"red", marginLeft:"100px"}}>{mess}</p>)}
                </>)}
                {curr==="error" &&(
                    <>
                    <h3 style={{ color: "black"}}> Error encountered in mining. Please try again.</h3>
                    <button onClick={handleClick} className= "ok_button1"> OK </button>
                    </>
                )}
                {curr==="second" && (
                    <>
                    <h3 style={{ color: "black"}}>Starting Mining Process...</h3>
                    <div className="spinner-container">
                        <div className="spinner" />
                    </div>
                    </>
                )}
                {curr==="third" && (
                    <>
                        <h3 style={{ color: "black"}}>Mining Process successfully started in background</h3>
                        <button onClick={handleClick1} className= "ok_button1"> OK </button>
                    </>
                )}
            </div>
        </div>
    )
}
const Box = ({stat, info, c, mode}) => {
    return (
      <div className={`${mode === 'dark' ? 'box-dark' : 'box-light'}`}>
        <p className="info" style={{ color: "black"}}>{info}</p>
        <h3 className="stat" style={{color:"black"}} >{stat}</h3>
      </div>
    );
};
const Progress =({setView})=>{
    const {time, blocks, mining} = useContext(AppContext)
    const [elasped, setElasped] = useState("00:00:00")
    const [cpu, setCpu]= useState("0.0%")
    const exit = () => {
        setView(false);
    };
    useEffect(() => {
        setElasped(calculate());
        const interval = setInterval(() => {
            setElasped(calculate());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const fetchusage = async () => {
            try {
                const response = await Wallet.track();  
                const data = await response.usage
                setCpu(data);  
            } catch (error) {
                setCpu("0.0%"); 
            }
        };
        fetchusage();
        const interval = setInterval(fetchusage, 500);  
        return () => clearInterval(interval);
    }, []);
    const calculate =()=>{
        let x = Date.now()
        let y = time
        let diff = x - y
        let seconds = Math.floor(diff / 1000) % 60;
        let minutes = Math.floor(diff / (1000 * 60)) % 60;
        let hours = Math.floor(diff / (1000 * 60 * 60));

        let result = [ String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'),String(seconds).padStart(2, '0'),].join(':');
        return result
    }
    const handleClick =()=>{
        setView(false)
    }
    return(
        <div id = "container1">
            <div id="content4">
               {mining &&(<>
                <button id="x1" onClick={exit}><HiOutlineXMark size="20"/></button>
                    <h3 style={{ color: "black"}}>Current Mining status</h3>
                    <div>
                        <Box style={{ color: "black"}} info = {"Time Elasped"} stat = {elasped}></Box>
                        <Box style={{ color: "black"}} info = {"Num of blocks requested"} stat = {blocks}></Box>
                        <Box style={{ color: "black"}} info = {"CPU usage"} stat = {cpu}></Box>
                    </div>
                </>)}
                {!mining && (
                    <>
                        <h3>Finished Mining</h3>
                        <button onClick={handleClick} className= "ok_button1"> OK </button>
                    </>
                )}
            </div>
        </div>
    )
}
const Transaction = ({mode})=>{
    const {user, setUser, downloadTxids} = useContext(AppContext);
    const [click, setClick] = useState(false);
    const [trans, setTrans] = useState(user.transactions)
    const info =[{txid:'3b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1H8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Pending', size: "1MB", Type:"down", Spent:"0.25", Earned:0},
        {txid:'4b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1B2zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1P8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Completed', size: "2MB", Type:"up", Spent: 0, Earned:"2.25"}
    ]
    useEffect(() => {
        const fetchtransaction = async () => {
            try {
                const response = await Wallet.retrieve();
                //IN PROGRESS COMMENT OUT IF CREATES PROBLEMS
                response.forEach( transaction => {
                    if(downloadTxids.has(transaction.txid))
                        transaction.category = 'Downloads';
                });
                //IN PROGRESS ^
                console.log(response.transactions)
                setUser(prev => {
                    const updated = {
                        ...prev,
                        transactions: response.transactions!==null ? response.transactions : []
                    };
                    return updated;
                });
                setTrans(response.transactions!==null ? response.transactions : [])
            } catch (error) {}
        };
        fetchtransaction();
        const interval = setInterval(fetchtransaction, 20000);  
        return () => clearInterval(interval);
    }, []);
    useEffect(() =>{
        const fetchtransaction = async () => {
            try {
                const response = await Wallet.retrieve();
                //IN PROGRESS COMMENT OUT IF CREATES PROBLEMS
                response.forEach( transaction => {
                    if(downloadTxids.has(transaction.txid))
                        transaction.category = 'Downloads';
                });
                //IN PROGRESS ^
                console.log(response.transactions)
                setUser(prev => {
                    const updated = {
                        ...prev,
                        transactions: response.transactions!==null ? response.transactions : []
                    };
                    return updated;
                });
                setTrans(response.transactions!==null ? response.transactions : [])
            } catch (error) {}
        };
        fetchtransaction();
    }, [click]);
    console.log(trans)
    let current = [ ...info, ...trans]
    console.log(current)
    const download = () => {
        const fields =["txid", "from", "to", "time", "status", "size", "Type", "Spent", "Earned"]
        const names =["TXID", "From", "To", "Time", "Status", "Size", "Type", "Spent", "Earned"]
        const headers = names.join(",") + "\n";
        const rows = current.map(row =>
            fields.map(field => {
              if (field === "status") {
                // Default status to "Completed" if missing
                return row[field] ?? "Completed";
              } else if (field === "Spent") {
                const amount = row["amount"];
                if (amount !== undefined) {
                  return amount < 0 ? Math.abs(amount) : "---"; 
                }
              } else if (field === "Earned") {
                const amount = row["amount"];
                if (amount !== undefined) {
                  return amount > 0 ? Math.abs(amount) :"---"; 
                }
              }
              else if (field === "From"){
                return row["address"] ? row["category"] === "receive": row["category"] === "generate" ?  "---" : user.walletID;
              }
              else if (field === "To"){
                return row["address"] ? row["category"] === "spent": row["category"] === "generate" ?  "---" : user.walletID;
             }
              return row[field] ?? "---";
            }).join(",")
          ).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const link = document.createElement("a");
        link.download = "Transaction Data.csv";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      };
    return(
        <div className={mode ==="dark"? "transaction": "transaction"}>
            <div id="trans_container">
                <h2 id="transaction_title">Transaction History</h2>
                <div id="button_layer">
                    <button id ="view"onClick={()=>{setClick(true)}}> View </button>
                    <button id="download" onClick={download}> Download </button>
                </div>
            </div>
            {click && (<TransactionTable user={user} mode={mode} setClick={setClick}/>)}
        </div>
    )
}
const TransactionTable=({mode, setClick})=> {
    const {user, setUser,downloadTxids} = useContext(AppContext);
    const [trans, setTrans] = useState(user.transactions)
    const info =[{txid:'3b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1H8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Pending', size: "1MB", Type:"Download", Spent:"0.25", Earned:0},
        {txid:'4b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1B2zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1P8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Completed', size: "2MB", Type:"Upload", Spent: 0, Earned:"2.25"}
    ]
    let current = [ ...info, ...trans]
    console.log(current);
    const [sort, setSort] = useState("")
    const [curr, setCurr] = useState(current);
    const exit = () => {
        setClick(false);
    };
    useEffect(() => {
        const fetchtransaction = async () => {
            try {
                const response = await Wallet.retrieve();
                //IN PROGRESS COMMENT OUT IF CREATES PROBLEMS
                response.forEach( transaction => {
                    if(downloadTxids.has(transaction.txid))
                        transaction.category = 'Downloads';
                });
                //IN PROGRESS COMMENT OUT IF CREATES PROBLEMS ^
                setUser(prev => {
                    const updated = {
                        ...prev,
                        transactions: response.transactions!==null ? response.transactions : []
                    };
                    return updated;
                });
                setTrans(response.transactions!==null ? response.transactions : [])
            } catch (error) {}
        };
        fetchtransaction();
        const interval = setInterval(fetchtransaction, 20000);  
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const updateCurr = () => {
          let current = [ ...info, ...trans]
          let filteredList = current
          if (sort === "Latest") {
            filteredList.sort((a, b) => new Date(b.time) - new Date(a.time));
          } else if (sort === "Earliest") {
            filteredList.sort((a, b) => new Date(a.time) - new Date(b.time));
          }
          setCurr(filteredList);
        };
        updateCurr(); 
      }, [user, sort]); 
    const handleSort = (event) => {
        let curSort = event.target.value;
        let sorted = [...current];
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
        <div className={mode ==="dark"? "transaction": "transaction"} id="band_container3" >
            <div id ="bandModal3">
                <div id = "top_layer">
                    <button id="y" onClick={exit}><HiOutlineXMark size="20" /></button>
                    <h2 id="transaction_title" style={{ color: mode === "dark" ? "black" : "black" }}>Transaction History</h2>
                    <div className= "sort-container1">
                        <p className="sort-label1" style={{ color: mode === "dark" ? "black" : "black" }}>Sort By: </p>
                        <select className="sort-select" value={sort} onChange={handleSort}>
                            <option value="" disabled>Select an option</option>
                            <option value="Latest">Newest</option>
                            <option value="Earliest">Earliest</option>
                        </select>
                    </div>
                </div>
            <div id="bottom_table">
            <table id="transaction_table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>File Size</th>
                        <th>Earned(OrcaCoins)</th>
                        <th>Spent(OrcaCoins)</th>
                    </tr>
                </thead>
                <tbody>
                    {curr.map((item, index) => (
                        <tr key={index}>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.txid}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.from || "---"}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.to || "---"}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.time}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.status || "Completed"}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.Type === "Upload" ? (
                                    <FaArrowUp style={{ color: "green" }} />
                                ) : item.Type === "Download" ? (
                                    <FaArrowDown style={{ color: "red" }} />
                                ) : item.Type === "Proxy" ? (
                                    <SiEnvoyproxy style={{ color: "grey" }} />
                                ) : item.category === "generate" ? (
                                    <GiMining style={{ color: "black" }} />
                                ): <FaCoins style={{ color: "black" }} />}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.size || "---"}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.amount > 0 ? item.amount : "---"}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.amount < 0 ? Math.abs(item.amount) : "---"}</td>
                        </tr>
                    ))}   
            </tbody>
        </table>
        </div>
        </div>
        </div>
    )
}
export default AccountContent;