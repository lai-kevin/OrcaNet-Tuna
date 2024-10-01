import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GiWhaleTail } from 'react-icons/gi';
import { FaHome } from 'react-icons/fa';
import { LuFileStack } from 'react-icons/lu';
import { IoIosSettings } from 'react-icons/io';
import { useMode } from './Mode';

const Navbar = () => {
  const location = useLocation();
  const { mode, chooseMode} = useMode();
  
  const activeClass = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`sidebar ${mode === 'dark' ? 'sidebar-dark' : 'sidebar-light'}`}> 
      <div className="heading">
        <GiWhaleTail className={`${mode === 'dark' ? 'whale-dark' : 'whale-light'}`} />
        <h1 id="title">OrcaNet</h1>
      </div>
      <ul>
        <li className={activeClass('/')}>
          <NavLink to="/" >
            <div className="section">
              <FaHome className="icon" />
              <span className="link">Home</span>
            </div>
          </NavLink>
        </li>
        <li className={activeClass('/Files')}>
          <NavLink to="/Files" >
            <div className="section">
              <LuFileStack className="icon" />
              <span className="link">Files</span>
            </div>
          </NavLink>
        </li>
        <li className={activeClass('/Settings')}>
          <NavLink to="/Settings" >
            <div className="section">
              <IoIosSettings className="icon" />
              <span className="link">Settings</span>
            </div>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
