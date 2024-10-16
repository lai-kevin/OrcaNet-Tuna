import { useContext } from "react";
import { AppContext } from "./AppContext";

const ProxyModal=({row, setRow, pass, setOpen, user, setUser})=>{
    return(
    <div id="proxy_container">
      <div id="proxyModal">
        {!pass && <Cancel setOpen={setOpen} setRow={setRow}/>}
        {pass && (<Options row={row} setRow={setRow} setOpen={setOpen}user={user} setUser={setUser}/>)}
      </div>
    </div>
    )
}
const Cancel=({setOpen, setRow})=>{
    const handleClick=()=>{
        setRow(null)
        setOpen(false)
    }
    return(
        <div id="cancel">
            <h3>Your account does not have enough balance. Please try again later.</h3>
            <button onClick={handleClick} >OK</button>
        </div>
    )
}
const Options = ({row, setRow, setOpen, user, setUser}) =>{
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
        setOpen(false)
    }
    const handleNo = ()=>{
        setRow(null)
        setOpen(false)

    }
    return(
        <div id="confirmation">
            <h3>Are you sure you want to perform a proxy connection with a cost of {row.Price} OrcaCoins?</h3>
            <div id="buttons">
                <button id="yes" onClick={handleYes}> Yes </button>
                <button id="No"onClick={handleNo}> No </button>
            </div>
        </div>
    )

}
export default ProxyModal;