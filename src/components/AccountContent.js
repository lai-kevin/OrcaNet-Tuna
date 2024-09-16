import React, { useState } from 'react';
import { FcBusinessman } from "react-icons/fc";
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
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    return(
        <div className='profile'>
        <div className="profile_pic">
            <FcBusinessman />
        </div>
        <form className="account_info">
        <div className='name_container'>
        <div id="first_name">
          <label htmlFor="first_name" className = "label">First Name </label><br></br>
          <input type="text" className="up" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Bill" />
          </div>
          <div id="last_name">
          <label htmlFor="first_name" className = "label">Last Name </label><br></br>
          <input type="text" className="up" value={last} onChange={(e) => setLast(e.target.value)} placeholder="Smith"/>
          </div>
        </div>
          <div id="mail">
          <label htmlFor="email">Email </label><br></br>
          <input type="text" className="bottom" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="abc@abc.com"/>
          </div>
          <div id="pass">
          <label htmlFor="password">Password</label><br></br>
          <input type="text" className="bottom" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="............"/>
          </div>
          <button type="submit" id="save_button">Save</button>
        </form>
        </div>
    )
};
const Balance = ()=>{
    return(
        <div id="balance">
            <h3 id="balance_title">Account Balance</h3>
            <input id="balance_value" type="text" className="balance" value="200" readonly />
            <span id="coin">Orcacoins</span>
        </div>
    )
}
export default AccountContent;