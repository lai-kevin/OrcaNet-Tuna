import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useLocation} from 'react-router-dom';
import { AppContext } from "./AppContext";
const SearchBar = ({user, setUser}) => {
    const { setSearchResultsFound, setFileToDownload, dummyFiles, setDownloadOpen } = useContext(AppContext);
    const [open, setOpen] = useState("close");
    const [searchInput, setSearchInput] = useState("");
    const menu = useRef(null);
    const location = useLocation();

    const handleSearch = (event) => {
      // if (event.key === "Enter") {
        // console.log(event.target.value); //can still extract info like this
        event.preventDefault(); // Prevent the default form submission behavior i hate forms ;-; 
        let fullSearchText = searchInput;
        let file = dummyFiles.find((file) => file.hashId === fullSearchText);
        event.target.value = ""; // this should clear it after clicking
        // setSearchInput("");
        setSearchResultsFound(true);
        if(file !== undefined){
          setFileToDownload(file);
          // setDownloadOpen(true);
        }
      // }
    }

    const handleDropDown = () =>{
        setOpen(prevState => (prevState ==="open" ? 'close' : 'open' ))
    }

    //Styling kinda sus removing the searchbar might require some moving
    return(
      <div className="">
        <div className="header">
          <div id="searchContainer">
          {/* <form id="search">
            <div id="searchWrapper">
              <label htmlFor="searchInput">
              <input type="search" placeholder="Browse..." id="searchInput" onChange={(event)=>{setSearchInput(event.target.value)}} disabled = {location.pathname !== "/Files"}></input>
              </label>
              <button type="submit" id="findButton" onClick = {handleSearch} disabled = {location.pathname !== "/Files"}>
                  <FaSearch />
              </button>
            </div>
          </form> */}
          </div>
          <button type="button" id="profile_button" onClick={handleDropDown}><CgProfile id="profile_pic"/></button>
          {open === "open" && <DropMenu handleDropDown={handleDropDown} user={user} setUser={setUser}/>}
        </div>
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
        <NavLink to="/" id="log_out" onClick={()=>setUser(null)}>Log Out</NavLink>
        </ul>
      </div>
    )
}
export default SearchBar;