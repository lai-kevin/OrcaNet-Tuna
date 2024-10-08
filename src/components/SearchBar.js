import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useState, useRef, useEffect } from "react";
import { NavLink} from 'react-router-dom';
const SearchBar = ({user, setUser}) => {
    const [open, setOpen] = useState("close")
    const menu = useRef(null);
    const handleDropDown = () =>{
        setOpen(prevState => (prevState ==="open" ? 'close' : 'open' ))
    }
    return(
      <div className="">
      <div className="header">
        <div id="searchContainer">
        <form id="search">
         <div id="searchWrapper">
          <label htmlFor="searchInput">
            <input type="search" placeholder="Browse..." id="searchInput"></input>
          </label>
          <button type="submit" id="findButton">
                <FaSearch />
          </button>
          </div>
        </form>
        </div>
        <button type="button" id="profile_button" onClick={handleDropDown}><CgProfile id="profile_pic"/></button>
        </div>
        {open === "open" && <DropMenu handleDropDown={handleDropDown} user={user}/>}
        </div>
        );
};
export const DropMenu = ({handleDropDown, user, setUser})=>{
  const menu = useRef(null);
  const outside = (e)=>{
    if (menu.current && !menu.current.contains(e.target)) {
      handleDropDown(); 
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', outside);
  });
    return(
      <div ref={menu} className="menu">
        <div className="wallet_info">
          <p id="wallet_label">Wallet ID:</p>
          <p id ="actual_id">{user.walletID}</p>
          </div>
        <ul className= "menu_list">
        <NavLink to="/Settings"> View Profile</NavLink>
        <a href="/" id="log_out" onclick={()=>setUser(null)}>Log Out</a>
        </ul>
      </div>
    )
}
export default SearchBar;