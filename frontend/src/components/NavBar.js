import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GiWhaleTail } from 'react-icons/gi';
import { FaHome } from 'react-icons/fa';
import { LuFileStack } from 'react-icons/lu';
import { IoIosSettings } from 'react-icons/io';
import { SiEnvoyproxy } from "react-icons/si";
import { useMode } from './Mode';

const Navbar = () => {
  const loc = useLocation();
  const { mode, chooseMode} = useMode();
  
  return (
    <nav className={`sidebar ${mode === 'dark' ? 'sidebar-dark' : 'sidebar-light'}`}> 
      <div className="heading">
        <GiWhaleTail className={`${mode === 'dark' ? 'whale-dark' : 'whale-light'}`} />
        <h1 id="title1">OrcaNet</h1>
      </div>
      <ul>
        <li className={(loc.pathname === '/' || loc.pathname === '/Home') ? 'active' : ''}>
          <NavLink to="/" >
            <div className="section">
              <FaHome className="icon" />
              <span className="link">Home</span>
            </div>
          </NavLink>
        </li>
        <li className={loc.pathname === '/Files' ? 'active' : ''}>
          <NavLink to="/Files" >
            <div className="section">
              <LuFileStack className="icon" />
              <span className="link">Files</span>
            </div>
          </NavLink>
        </li>
        <li className={loc.pathname === '/Proxy' ? 'active' : ''}>
          <NavLink to="/Proxy" >
            <div className="section">
              <SiEnvoyproxy className="icon" />
              <span className="link">Proxy</span>
            </div>
          </NavLink>
        </li>
        <li className={loc.pathname === '/Settings' ? 'active' : ''}>
          <NavLink to="/Settings" >
            <div className="section">
              <IoIosSettings className="icon" />
              <span className="link">Account</span>
            </div>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
