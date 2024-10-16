import React, { useState, useRef, useEffect} from 'react';
import InfoBox from './InfoBox';
import orca from './images/orca.jpg'
import QRCode from 'react-qr-code';
import { FaRegCopy } from "react-icons/fa";
import { FaQrcode } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
const AccountContent = ({user}) => {
    return(
     <div className = "account">
        <InfoBox key="profile" content= {<Profile user={user}/>}/>
        <InfoBox key="transaction" content= {<Transaction/>}/>
     </div>
    )
};
const Profile = ({user})=>{
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
                    <img src={orca} alt="orca" style={{ width: '100%', height: '100%', background: 'transparent',  borderRadius: '50px'}}/>
                </div>
                <h4 id ="wID">Wallet ID: </h4>
                <span id="number">{user.walletID}</span>
                <button type="button" id="copy_button" onClick={handleCopy}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button>
                <button type="button" id="copy_button" ref={profile} onClick={handleQr}><FaQrcode  style={{ width: '100%', height: '100%', background: 'transparent'}}/></button>
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
const Transaction =()=> {
    const info =[{ID:'3b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', Status: 'up', File: "image.png", FileSize: "1MB", Type:"Upload", Amount:"6.25"},
        {ID:'4b3c30a72f4e48b916cb4cc9de063dbf2a3b75c1c68a7dcd7a930cb35b2dfbc4', Status: 'down', File: "picture.png", FileSize: "2MB", Type:"Download", Amount:"--"}
    ]

    return(
        <div className='transaction'>
            <h2 id="transaction_title">Transaction History</h2>
            <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Status</th>
                <th>File</th>
                <th>File Size</th>
                <th>Type</th>
                <th>Amount (OrcaCoins)</th>
            </tr>
        </thead>
        <tbody>
            {info.map((item, index) => (
                <tr key={index}>
                    <td>{item.ID}</td>
                    <td>{item.Status === "up"? <FaArrowUp style={{color:'green'}}/>: <FaArrowDown style={{color: 'red'}}/> }</td>
                    <td>{item.File}</td>
                    <td>{item.FileSize}</td>
                    <td>{item.Type}</td>
                    <td>{item.Amount}</td>
                </tr>
            ))}   
    </tbody>
</table>
        </div>
    )
}
export default AccountContent;