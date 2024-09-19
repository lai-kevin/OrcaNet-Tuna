import React, { useState } from 'react';
import { GiDolphin } from "react-icons/gi";
import InfoBox from './InfoBox';
const AccountContent = () => {
    return(
     <div className = "account">
        <InfoBox key="profile" content= {<Profile/>}/>
        <InfoBox key="balance" content= {<Balance/>}/>
     </div>
    )
};
const Profile = ()=>{
    return(
        <div id="profile">
            <h3 id="profile_title">Wallet Address</h3>
            <p>0x d500fb92 ac8d9428 3fffde5b 07e8f624 6ad4e772</p>
            </div> 
    )
};
const Balance = ()=>{
    return(
        <>
        <div id="balance">
            <h3 id="balance_title">Balance</h3>
            <span id = "coins">200</span>
            <span id = "type">OrcaCoins</span>
        </div>
        </>
    )
}
export default AccountContent;