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
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { AppContext } from './AppContext';
const AccountContent = ({mode}) => {
    return(
     <div className = "account">
        <InfoBox key="profile" content= {<Profile mode={mode}/>}/>
        <InfoBox key="transaction" content= {<Transaction mode={mode}/>}/>
     </div>
    )
};
const Profile = ({mode})=>{
    const {user} = useContext(AppContext);
    const [qr, setQr] = useState("close")
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
            </div>
        </div>
    )
}
const Transaction = ({mode})=>{
    const {user} = useContext(AppContext);
    const [click, setClick] = useState(false);
    const info =[{id:'3b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1H8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Pending', size: "1MB", Type:"down", Spent:"0.25", Earned:0},
        {id:'4b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1B2zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1P8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Completed', size: "2MB", Type:"up", Spent: 0, Earned:"2.25"}
    ]
    let current = [ ...info, ...user.transactions]
    const download = () => {
        const fields =["id", "from", "to", "time", "status", "size", "Type", "Spent", "Earned"]
        const names =["TXID", "From", "To", "Time", "Status", "Size", "Type", "Spent", "Earned"]
        const headers = names.join(",") + "\n";
        const rows = current.map(row => 
            fields.map(field => row[field]).join(",")
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
    const {user} = useContext(AppContext);
    const info =[{id:'3b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1H8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Pending', size: "1MB", Type:"down", Spent:"0.25", Earned:0},
        {id:'4b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', from: '1B2zP1eP5QGefi2DMPTfTL5SLmv7DivfN', to:"1P8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", time: "2024-10-19 14:59:10", status: 'Completed', size: "2MB", Type:"up", Spent: 0, Earned:"2.25"}
    ]
    let current = [ ...info, ...user.transactions]
    console.log(current);
    const [sort, setSort] = useState("")
    const [curr, setCurr] = useState(current);
    const exit = () => {
        setClick(false);
    };
    useEffect(() => {
        const updateCurr = () => {
          let current = [ ...info, ...user.transactions]
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
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.id}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.from}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.to}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.time}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.status}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.Type === "up" ? (<FaArrowUp style={{ color: 'green' }} />) : item.Type === "down" ? (<FaArrowDown style={{ color: 'red' }} />) : (<SiEnvoyproxy style={{ color: 'grey' }} />)}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.size}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.Earned === 0 ? "---": item.Earned}</td>
                            <td style={{ color: mode === "dark" ? "black" : "black" }}>{item.Spent=== 0 ?"---" : item.Spent}</td>
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