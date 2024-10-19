import React, { useState, useRef, useEffect} from 'react';
import InfoBox from './InfoBox';
import orca from './images/orca.jpg'
import QRCode from 'react-qr-code';
import { FaRegCopy } from "react-icons/fa";
import { FaQrcode } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
const AccountContent = ({user, mode}) => {
    return(
     <div className = "account">
        <InfoBox key="profile" content= {<Profile user={user} mode={mode}/>}/>
        <InfoBox key="transaction" content= {<Transaction user={user} mode={mode}/>}/>
     </div>
    )
};
const Profile = ({user, mode})=>{
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
                <h4 id ="wID">Wallet ID: </h4>
                <span id="number">{user.walletID}</span>
                <button type="button" id = {mode ==="dark"? "copy_button_dark": "copy_button"} onClick={handleCopy}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button>
                <button type="button" id = {mode ==="dark"? "copy_button_dark": "copy_button"} ref={profile} onClick={handleQr}><FaQrcode  style={{ width: '100%', height: '100%', background: 'transparent'}}/></button>
                {qr === "open" && (<QRCode id="qr" value={user.walletID}></QRCode>)}
            </div>
            <div id="profile_bottom">
                <h4 id ="wID">Balance: </h4>
                <span id = "coins">{user.balance}</span>
                <span id = "type">OrcaCoins</span>
            </div>
        </div>
    )
}

const Transaction=({user, mode})=> {
    const info =[{ID:'3b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', From: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN', To:"1H8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", Time: "1728532467", Status: 'Pending', FileSize: "1MB", Type:"down", Amount:"0.25"},
        {ID:'4b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', From: '1B2zP1eP5QGefi2DMPTfTL5SLmv7DivfN', To:"1P8LxkY5N4B5H2qFsR8UQEN8pMxPLd3BR", Time: "1628531467", Status: 'Completed', FileSize: "2MB", Type:"up", Amount:"2.25"}
    ]
    return(
        <div className={mode ==="dark"? "transaction": "transaction"}>
            <h2 id="transaction_title">Transaction History</h2>
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
                <th>Amount (OrcaCoins)</th>
            </tr>
        </thead>
        <tbody>
            {info.map((item, index) => (
                <tr key={index}>
                    <td>{item.ID}</td>
                    <td>{user.walletID}</td>
                    <td>{item.To}</td>
                    <td>{item.Time}</td>
                    <td>{item.Status}</td>
                    <td>{item.Type === "up"? <FaArrowUp style={{color:'green'}}/>: <FaArrowDown style={{color: 'red'}}/> }</td>
                    <td>{item.FileSize}</td>
                    <td>{item.Amount}</td>
                </tr>
            ))}   
    </tbody>
</table>
        </div>
    )
}
export default AccountContent;