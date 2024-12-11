import { useContext, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import { HiOutlineXMark } from "react-icons/hi2";
import { useMode } from './Mode';

const ProxyModal=({setClick})=>{
    const {server, user, setUser} = useContext(AppContext);
    const {peers} = useContext(AppContext);
    const [row, setRow] = useState(server==="--" ? null: server.id)
    const [content, setContent] = useState("select")
    const {mode} = useMode();
    console.log(row);
    return (
    <div id="proxy_container">
      <div id="proxyModal">
        {content === "select" && (<ProxyTable row={row} setRow={setRow} setContent={setContent} setClick={setClick}/>)}
        {content === "pass" && (<Options row={peers[row]} setRow={setRow} setClick={setClick} setContent={setContent}/>)}
        {content === "failed" && (<Cancel setClick={setClick} setRow={setRow} content={content} setContent={setContent}/>)}
        {content === "noMatch" && (<Cancel setClick={setClick} setRow={setRow} content={content} setContent={setContent}/>)}
      </div>
    </div>
)
}
const ProxyTable =({row, setRow, setContent, setClick})=>{
    const {peers, user} = useContext(AppContext);
    const [search, setSearch] = useState("")
    const {mode} = useMode();
    const handleChange=(e)=>{
        setSearch(e.target.value)
    }
    const handleEnter = (event) => {
        if (event.key === 'Enter') {
          handleSearch();
        }
      };
    const handleSearch = ()=>{
       let matchedRow = peers.find((peer) => peer.location === search);
       console.log(matchedRow);
       if (matchedRow){
          setRow(matchedRow.id)
          setContent("pass")
          setSearch("")
       }
       else{
         setContent("noMatch")
         setSearch("")
       }
        
    }
    const handleRow = (id)=>{
        setRow(id);
    }
    const check = () => {
        if(row === null){
            return
        }
        setContent(user.balance >= peers[row].Price ? "pass": "failed");
    };
    const exit = ()=>{
        setRow(null)
        setClick(false)
    }
    return(
        <>
        <div id="top_section">
         <button id="x" onClick={exit}><HiOutlineXMark size="20"/></button>
         <div id = "search_layer">
            <input id="location" type="text" placeholder="Search by Location ..." value={search} onChange={handleChange} onKeyDown={handleEnter}></input>
            <button id="sbutton" onClick={handleSearch}>Search</button>
         </div>
         </div>
        <div>
            <h3 id="peer_title" style={{ color: mode === "dark" ? "black" : "black" }} >Select A Peer Node To Proxy</h3>
        </div>
        <div id ="table_container">
        <table id="proxy_table">
            <thead>
                <tr>
                <th style={{ color: mode === "dark" ? "black" : "black" }}>IP</th>  
                <th style={{ color: mode === "dark" ? "black" : "black" }}>Location</th>          
                <th style={{ color: mode === "dark" ? "black" : "black" }}>Price (OrcaCoins)</th>
                </tr>
            </thead>
            <tbody>
            {peers.map((node) => (
                <tr
                    key={node.id}
                    onClick={() => handleRow(node.id)}
                    style={{

                        backgroundColor: row === node.id ? '#d3d3d3' : 'white', 
                        cursor: 'pointer',
                    }}
                >
                    <td style={{ color: mode === "dark" ? "black" : "black" }}>{node.ip}</td>
                    <td style={{ color: mode === "dark" ? "black" : "black" }}>{node.location}</td>
                    <td style={{ color: mode === "dark" ? "black" : "black" }}>{node.Price}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    <div id="button_container">
       <button id="confirm" onClick={check}>Select</button>
    </div>
    </>
    )
}
const Cancel=({setClick, setRow, content, setContent})=>{
    const {mode} = useMode();
    const handleClick=()=>{
        setRow(null)
        setClick(false)
    }
    const handleOther=()=>{
        setRow(null)
        setContent("select")
    }
    return(
        <div id="cancel">
            {content === "failed" && (
                <>
                <h3 style={{ color: mode === "dark" ? "black" : "black" }}> Your account does not have enough balance. Please try again later.</h3>
                <button className="ok" onClick={handleClick} >OK</button>
                </>)}
            {content === "noMatch" && (
            <>
            <h3 style={{ color: mode === "dark" ? "black" : "black" }}>The node is not found. Please try again.</h3>
            <button className="ok"onClick={handleOther} >OK</button>
            </>)}
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
const Options = ({row, setRow, setClick, setContent}) =>{
    const {setServer, setUser} = useContext(AppContext);
    const [curr, setCurr] = useState("confirm")
    let info = { ...row, date: formatTime()};
    const {mode} = useMode();
    const handleYes = ()=>{
        setCurr("third");
    }
    const handleNo = ()=>{
        setRow(null)
        setContent("select")
    }
    const handleClick1 = ()=>{
        setClick(false); 
        setServer(info);
    }
    // useEffect(() => {
    //     let timer; 
    //     if (curr === "progress") {
    //         timer = setTimeout(() => {
    //             setClick(false); 
    //             setServer(info);
    //         }, 3000);
    //     }
    //     return () => clearTimeout(timer); 
    // }, [curr]);
    return(
        <div id="confirmation">
            {curr==="confirm" && (<><h3 style={{ color: mode === "dark" ? "black" : "black" }}>Are you sure you want to perform a proxy connection with a cost of {row.Price} OrcaCoins per MB?</h3>
            <div id="buttons">
                <button id="yes" onClick={handleYes}> Yes </button>
                <button id="No" onClick={handleNo}> No </button>
            </div></>)}
            {/* {curr==="progress" && (
                <>
                <h3>Connecting to proxy node...</h3>
                <div className="spinner-container">
                    <div className="spinner" />
                </div>
                </>
            )} */}
            {curr==="third" && (
                <div id = "container1">
                <div id="content3">
                    <h3 style={{ color: "black"}}>Please connect to proxy manually. Click OK when successfully configured.</h3>
                    <button onClick={handleClick1} className= "ok_button1"> OK </button>
                </div>
                </div>
            )}
        </div>
    )

}
export default ProxyModal;