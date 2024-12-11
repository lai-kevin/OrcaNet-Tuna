import { AppContext } from "./AppContext";
import { useContext, useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import * as Wallet from '../WalletAPI';
const Home = () => {
  const {enter, setEnter, setMining, setTime, setBlocks} = useContext(AppContext)
  const [curr, setCurr] = useState("")
  const [exit, setExit] = useState(enter)
  console.log(exit)
  const handleClick =()=>{
    setEnter(false);
    setCurr("second")
    setMining(true)
    setBlocks(2)
    setTime(new Date())

    console.log("came here")
    const timeoutId = setTimeout(() => {
      setCurr("third");
    }, 15000);
    setTimeout(()=>{
      Wallet.mine(2).then((response)=>{
        console.log(response)
        console.log("done with 2 blocks")
        setMining(false)
        setBlocks(0)
        setTime("")
    })
    .catch((error)=>{
        clearTimeout(timeoutId);
        setCurr("error"); 
        setTime("")
        setBlocks(0)
        setMining(false)
    })
    }, 6000)
  }
  const handleClick1=()=>{
    setEnter(false);
    setExit(false)
    setCurr("")
  }
  const handleClick2=()=>{
    setEnter(false);
    setExit(false)
    setCurr("")
  }
  return (
    <div className="home">
          <>
          <h1 className = "text">Home</h1>
          <div>
            <Dashboard/>
          </div> 
          </>
      {enter && exit && (
         <div id = "container1">
         <div id="content3">
             <h3 style={{ color: "black"}}>Welcome to OrcaNet! Two blocks will be mined in the background.</h3>
             <div id="items">
                 <button onClick={handleClick} className= "ok_button1"> OK </button>
             </div>
         </div>
      </div>
       )}
       {curr==="error" &&(
          <div id = "container1">
            <div id="content3">
                <h3 style={{ color: "black"}}>Error encountered in mining. Please try mining again.</h3>
                <button onClick={handleClick2} className= "ok_button1"> OK </button>
            </div>
          </div>
        )}
       {curr==="second" && (
            <div id = "container1">
              <div id="content3">
              <h3 style={{ color: "black"}}>Starting Mining Process...</h3>
              <div className="spinner-container">
                  <div className="spinner" />
              </div>
            </div>
         </div>
        )}
        {curr==="third" && (
            <div id = "container1">
              <div id="content3">
                <h3 style={{ color: "black"}}>Mining Process successfully started in background</h3>
                <button onClick={handleClick1} className= "ok_button1"> OK </button>
              </div>
            </div>
        )}
    </div>

  )
};

export default Home;