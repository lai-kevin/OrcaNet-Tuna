import { useContext, useState } from "react";
import { AppContext } from "./AppContext";
import { HiOutlineXMark } from "react-icons/hi2";
import { useMode } from './Mode';

const ProxyModal=({user, setUser, setClick})=>{
    const {server} = useContext(AppContext);
    const {peers} = useContext(AppContext);
    const [row, setRow] = useState(server=="--" ? null: server.id)
    const [content, setContent] = useState("select")
    const {mode} = useMode();
    console.log(row);
    return (
    <div id={mode==="dark"? "proxy_container_dark":"proxy_container"}>
      <div id={mode==="dark"? "proxyModal_dark":"proxyModal"}>
        {content === "select" && (<ProxyTable row={row} setRow={setRow} setContent={setContent} setClick={setClick}/>)}
        {content === "pass" && (<Options row={peers[row]} setRow={setRow} user={user} setUser={setUser} setClick={setClick} setContent={setContent}/>)}
        {content === "failed" && (<Cancel setClick={setClick} setRow={setRow} content={content} setContent={setContent}/>)}
        {content === "noMatch" && (<Cancel setClick={setClick} setRow={setRow} content={content} setContent={setContent}/>)}
      </div>
    </div>
)
}
const ProxyTable =({row, setRow, setContent, setClick})=>{
    const {peers} = useContext(AppContext);
    const [search, setSearch] = useState("")
    const {mode}= useMode();
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
        setContent(100 >= peers[row].Price ? "pass": "failed");
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
            <h3 id="peer_title">Select A Peer Node To Proxy</h3>
        </div>
        <div id ="table_container">
        <table id={mode==="dark"?"proxy_table_dark":"proxy_table"}>
            <thead>
                <tr>
                <th>Location</th>          
                <th>Price (OrcaCoins)</th>
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
                    <td>{node.location}</td>
                    <td>{node.Price}</td>
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
                <h3>Your account does not have enough balance. Please try again later.</h3>
                <button className="ok" onClick={handleClick} >OK</button>
                </>)}
            {content === "noMatch" && (
            <>
            <h3>The node is not found. Please try again.</h3>
            <button className="ok"onClick={handleOther} >OK</button>
            </>)}
        </div>
    )
}
const Options = ({row, setRow, setClick, user, setUser, setContent}) =>{
    const {setServer} = useContext(AppContext);
    const handleYes = ()=>{
        setServer(row);
        setUser(prev => {
            const updated = {
                ...prev,
                balance: prev.balance - row.Price
            };
            localStorage.setItem(prev.privateKey, JSON.stringify(updated));
            return updated;
        });
        setClick(false)
    }
    const handleNo = ()=>{
        setRow(null)
        setContent("select")
    }
    return(
        <div id="confirmation">
            <h3>Are you sure you want to perform a proxy connection with a cost of {row.Price} OrcaCoins per MB?</h3>
            <div id="buttons">
                <button id="yes" onClick={handleYes}> Yes </button>
                <button id="No" onClick={handleNo}> No </button>
            </div>
        </div>
    )

}
export default ProxyModal;