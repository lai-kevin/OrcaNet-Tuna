import { NavLink } from "react-router-dom";
import { GiWhaleTail } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { LuFileStack } from "react-icons/lu";
import { IoIosSettings } from "react-icons/io";
import React, { useState } from 'react';
const Navbar = ()=> {
    const [active, setActive] = useState('Home');
    const handleLink = (page) => {
        setActive(page);
      };
    return(
        <nav className= "sidebar"> 
        <div className="heading">
           <GiWhaleTail className = "whale"/>
           <h1 id="title"> OrcaNet </h1>
        </div>
        <ul>
                <li className={active === 'Home' ? 'active' : ''}>
                <NavLink to="/" onClick={() => handleLink('Home')}>
                   <div className="section">
                    <FaHome className="icon" />
                    <span className="link">Home</span>
                    </div>
                </NavLink>
                </li>
                <li className={active === 'Files' ? 'active' : ''} >
                    <NavLink to="/Files" onClick={() => handleLink('Files')}>
                     <div className="section">
                        <LuFileStack className="icon" />
                        <span className="link">Files</span>
                     </div>
                    </NavLink>
                </li>
                <li className={active === 'Settings' ? 'active' : ''}>
                    <NavLink to="/Settings" onClick={() => handleLink('Settings')}>
                       <div className="section">
                       <IoIosSettings className="icon" />
                       <span className="link">Settings</span>
                       </div>
                    </NavLink>
                </li>
             </ul>
        </nav>
    )
}
export default Navbar;