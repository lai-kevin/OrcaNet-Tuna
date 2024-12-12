import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useLocation} from 'react-router-dom';
import { AppContext } from "./AppContext";
import { useMode } from './Mode';
import * as Wallet from "../WalletAPI"

const stopDocker = async () => {
  try {
    const output = await window.electron.ipcRenderer.invoke('stop-docker');
    console.log(output);
  } catch (error) {
    console.error('Error:', error);
  }
};
const SearchBar = () => {
    const { user, setUser, setSearchResultsFound, setFileToDownload, dummyFiles, setDownloadOpen } = useContext(AppContext);
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
          </div>
          <button type="button" id="profile_button" onClick={handleDropDown}><CgProfile id="profile_pic"/></button>
          {open === "open" && <DropMenu handleDropDown={handleDropDown}/>}
        </div>
      </div>
        );
};
export const DropMenu = ({handleDropDown})=>{
  const menu = useRef(null);
  const {user, stop, proxy, server, setUser, setServer, setProxy, setTotal, setStop, setproxyPrice, setRem, serverHistory, ownHistory, setProxyHistory, setOwnHistory, setServerHistory, setTime, setMining, setBlocks} = useContext(AppContext);
  const {mode, chooseLight} = useMode();
  const [open, setOpen] = useState(false)
  const outside = (e)=>{
    if (menu.current && !menu.current.contains(e.target)) {
      handleDropDown(); 
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', outside);
  });
  const handleLogOut =()=>{
    if(server!=="--" || proxy){
      setOpen(true)
      return
    }
    setServer("--")
    setTotal(0)
    setStop([])
    setproxyPrice(0)
    setProxy(false)
    setUser(null)
    setRem(false)
    setProxyHistory([])
    setOwnHistory([])
    setServerHistory([])
    stopDocker();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rem');
    localStorage.removeItem('time');
    Wallet.logOut()
    .then(() => {
        console.log("Logged out successfully");
        setTime("")
        setMining(false)
        setBlocks(0)
    })
    .catch((error) => {
        console.log(error.message);
    });
    }
    return(
      <div ref={menu} className="menu">
        <div className="wallet_info">
          <p id="wallet_label">Wallet Address:</p>
          <p id ="actual_id" style={{ color: mode === "dark" ? "black" : "black" }}>{user.walletID}</p>
          </div>
        <ul className= "menu_list">
        <NavLink to="/Settings" onClick={()=>{setOpen(false)}}> View Profile</NavLink>
        <NavLink to="/" id="log_out" onClick={handleLogOut}>Log Out</NavLink>
        </ul>
       {open && (<Exit setOpen={setOpen}/>)}
      </div>
    )
}
const formatTime = () => {
  const curr = new Date();
  const y = curr.getFullYear();
  const m = String(curr.getMonth() + 1).padStart(2, '0'); 
  const d = String(curr.getDate()).padStart(2, '0');
  const hr = String(curr.getHours()).padStart(2, '0');
  const min = String(curr.getMinutes()).padStart(2, '0');
  const sec = String(curr.getSeconds()).padStart(2, '0');
  
  return `${y}-${m}-${d} ${hr}:${min}:${sec}`;
};
const Exit =({setOpen})=>{
  const {user, stop, proxy, server, setUser, setServer, setProxy, setTotal, setStop, setproxyPrice, setRem, serverHistory, ownHistory, setProxyHistory, setOwnHistory, setServerHistory, setTime, setMining, setBlocks} = useContext(AppContext);
  const handleYes =()=>{
    const hist = Object.values(
      serverHistory.reduce((acc, item) => {
        const client = item.client;
        if (stop.includes(client)) {
          return acc;
        }
        if (!acc[client]) {
          acc[client] = {
            client: client,
            location: item.location,
            Earned: 0,
            Spent:"--",
            totalBandwidth: 0, 
            count: 0,     
            date: item.time,
            end: "---",
            status: "Connected"
          };
        }
        acc[client].Earned += parseFloat(item.Earned).toFixed(2);
        acc[client].totalBandwidth += parseFloat(item.bandwidth);
        acc[client].count += 1;
    
        return acc;
      }, {})
    ).map(clientData => ({
      ...clientData,
      averageBandwidth: (clientData.totalBandwidth / clientData.count).toFixed(2),
    }));
    const spent = ownHistory.reduce((acc, transaction) => {
      return parseFloat(acc) + parseFloat(transaction.Spent);
    }, 0);
    let curr = {...server, end: formatTime(), Spent: spent.toFixed(2), Earned:"--"};
    const prev = JSON.parse(localStorage.getItem(user.walletID));
    
    // update the server requests history and served peers
    const updated = {
          ...prev,
          //servedRequests: [...prev.servedRequests, ...serverHistory], 
          servedHistory: [...prev.servedHistory, ...hist],
          proxied: [...prev.proxied, curr],
          //proxyRequests: [...prev.proxyRequests, ownHistory]
    };
    localStorage.setItem(prev.walletID, JSON.stringify(updated));
    setOpen(false)
    setServer("--")
    setTotal(0)
    setStop([])
    setproxyPrice(0)
    setProxy(false)
    setUser(null)
    setRem(false)
    setProxyHistory([])
    setOwnHistory([])
    setServerHistory([])
    stopDocker();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rem');
    localStorage.removeItem('time');
    Wallet.logOut()
    .then(() => {
        console.log("Logged out successfully");
        setTime("")
        setMining(false)
        setBlocks(0)
    })
    .catch((error) => {
        console.log(error.message);
    });
    }
  const handleNo =()=>{
    setOpen(false);
  }
  return (
      <div id="dis_container">
        <div id="disModal">
            <h3>There are still proxy service running. Logging out will terminate them.</h3>
            <h3>Do you still want to proceed to logout?</h3>
            <div id="bottom_b">
              <button id="yes1" onClick={handleYes}> Yes </button>
              <button id="No1" onClick={handleNo}> No </button>
            </div>
        </div>
      </div>
      )
}
export default SearchBar;