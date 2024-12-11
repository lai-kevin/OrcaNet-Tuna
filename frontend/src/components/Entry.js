import { GiWhaleTail } from 'react-icons/gi';
import { useState, useEffect, useContext } from 'react';
import { Rings } from 'react-loader-spinner';
import { FaRegCopy } from 'react-icons/fa';
import { useMode } from './Mode';
import { AppContext } from './AppContext';
import { GoDownload } from "react-icons/go";
import * as Wallet from '../WalletAPI';

const startDocker = async (id) => {
    try {
      const output = await window.electron.ipcRenderer.invoke('start-docker', id);
      console.log(output);
    } catch (error) {
      console.error('Error:', error);
    }
};
const Entry = () =>{
    const [page, setPage] = useState('login')
    const[effect, setEffect] = useState(false);
    const {mode} = useMode();
    const handleLoginPage=()=>{
        setEffect(true)
        setTimeout(() => {
            setPage('login'); 
            setEffect(false); 
        }, 300); 
    }
    const handleRegPage=()=>{
        setEffect(true)
        setTimeout(() => {
            setPage('register'); 
            setEffect(false); 
        }, 300); 
    }
    return(
        <div className="login">
            <div id="title_container">
                <GiWhaleTail style={{fontSize: '120px', color:"blue"}}/>
                <h1 id ="title" style={{ color: mode === "dark" ? "black" : "black" }}>OrcaNet</h1>
            </div>
            {page ==="recover" && <Recover setPage ={setPage}/>}
            {(page === "login" || page ==="register") && <>
            <div className="inner_container">
                <h2 id="head" style={{ color: mode === "dark" ? "black" : "black" }}>{page === "login" ? "Login" : "Register"}</h2>
                <div className="options">
                    <div className="highlight" style={{ left: page === 'login' ? '0%' : '50%' }} />
                    <a id="inner_button1" onClick={handleLoginPage}>Login</a>
                    <a id="inner_button2" onClick={handleRegPage}>Register</a>
                </div>
            <div id="contents">
                <div className={`effect ${effect ? (page === 'register' ? 'right' : 'left') : ''}`}>
                    {page === 'login' && <Login handleRegPage={handleRegPage} setPage ={setPage}/>}
                </div>
                <div className={`effect ${effect ? (page === 'login' ? 'right' : 'left') : ''}`}>
                    {page === 'register' && <Register handleLoginPage={handleLoginPage}  setPage={setPage}/>}
                </div>
            </div>
            </div>
            </>}
        </div>
    )
}
const Recover = ({setPage})=>{
    const[curr, setCurr] = useState("recover")
    const[phrase, setPhrase] = useState("")
    const[key,setKey] = useState("")
    const [confirm, setConfirm] = useState(false)
    const {mode} = useMode();
    const handleYes=()=>{
        Wallet.deleteAccount().then((result)=>{
            localStorage.clear();
            setCurr("success")
        })
        .catch((error)=>{
           setCurr("Error")
        })
    }
    const handleNo=()=>{
        setConfirm(false)
    }
    const change =()=>{
        setPage("login");
    }
    const handleCopy = (item) => {
        navigator.clipboard.writeText(item)
    };
    return(
        <div id = "recover_page">
        <h2 id="head" style={{ color: mode === "dark" ? "black" : "black" }}>Delete Account</h2>
        {curr ==="recover" && (<>
            <button type="submit" id="button" onClick={()=>setConfirm(true)} > Delete</button>
            <div id="bottom_buttons">
                <button type="submit" id="button3" onClick={()=>setPage("login")}> Login</button>
                <button type="submit" id="button4" onClick={()=>setPage("register")}> Register</button>
            </div>
            </>
         )}
         {confirm &&(
                <div id = "container1">
                    <div id="content3">
                        <h3>Are you sure you want to delete your account? You will lose all your coins.</h3>
                        <div id="items">
                            <button id="yes2" onClick={handleYes}> Yes </button>
                            <button id="No2" onClick={handleNo}> No </button>
                        </div>
                </div>
               </div>
         )}
          {curr=== "Error" &&(
                <div id = "container1">
                    <div id="content3">
                        <h3>Error encountered when deleting account. Please try again.</h3>
                        <div id="items">
                            <button onClick={()=> {setCurr("recover"); setConfirm(false)}} className= "ok_button1"> OK </button>
                        </div>
                </div>
               </div>
         )}
         {curr==="success" &&(
            <div id = "container1">
            <div id="content3">
                <h3>Account deleted successfully. You can register a new account now.</h3>
                <div id="items">
                    <button onClick={()=>setPage("register")} className= "ok_button1"> OK </button>
                </div>
            </div>
         </div>
         )}
       </div>
    )
}
const Login=({handleRegPage, setPage})=>{
    const [input, setInput] = useState("")
    const [verify, setVerify] = useState(false)
    const [get, setGet] = useState(false)
    const [e, setE] = useState("Logging In")
    const [restart, setRestart] = useState(false)
    const {mode} = useMode();
    const [err, setErr] = useState({message: "", present:false})
    const {rem, setRem, user, setUser, setEnter, enter} = useContext(AppContext);
    const handleInput=(e)=>{
        setInput(e.target.value);
        if (err.present) {
            setErr({ message: "", present: false });
        }
    }
    useEffect(() => {
        const checked = localStorage.getItem('rem') === 'true';
        if (checked) {
            setGet(true)
            setTimeout(() => {
                Wallet.reenter()
                .then((result) => {
                    startDocker(localStorage.getItem("id"))
                    const storedData = localStorage.getItem(result.miningAddress);
                    let served = []
                    let prox = []
                    if (storedData){
                        const parsedData = JSON.parse(storedData);
                        served = parsedData.servedHistory;
                        prox = parsedData.proxied;
                    }
                    const userData ={
                        walletID: result.miningAddress,
                        peer: localStorage.getItem("id"),
                        balance: result.balance, 
                        transactions: result.transactions!==null ? result.transactions : [],
                        fileHistory:[],
                        servedHistory: served,
                        proxied: prox,
                        mode: localStorage.getItem("mode")
                    };
                    setUser(userData);
                    setEnter(true);
                    setRem(checked);
                    setGet(false)
                })
                .catch(() => {
                    setE("Session Expired")
                    localStorage.removeItem("rem");
                    setRestart(true)
                });
                
            }, 10000);
        } else {
            localStorage.removeItem("rem");
      }
      }, []);
    const check = (e)=>{
        e.preventDefault();
        setVerify(true)
        const key = input.trim();
        if (key == ""){
            setVerify(false)
            setErr({message:"^Field can't be empty", present:true});
            return
        }
        Wallet.enter({password: key, rem: rem}).then((result) => {
            setVerify(false);
            startDocker(localStorage.getItem("id"))
            const storedData = localStorage.getItem(result.miningAddress);
            let served = []
            let prox = []
            if (storedData){
                const parsedData = JSON.parse(storedData);
                served = parsedData.servedHistory;
                prox = parsedData.proxied;
            }
            const userData ={
                walletID: result.miningAddress,
                peer: localStorage.getItem("id"),
                balance: result.balance, 
                transactions: result.transactions!==null ? result.transactions : [],
                fileHistory:[],
                servedHistory: served,
                proxied: prox,
                mode: localStorage.getItem("mode")
            };
            if(rem){
                localStorage.setItem("rem", true);
            }
            else{
                localStorage.setItem("rem", false);
            }
            setUser(userData);
            setEnter(true);
          })
          .catch((error) => {
            setVerify(false)
            setErr({message:"^Invalid Key", present:true}); 
        });
    }
    const handleClick =()=>{
        setGet(false)
        setRestart(false)
    }
    return(
        <div id = "login_page">
         <form onSubmit={check}>
            <input type="text" id="key" value={input} onChange={handleInput} placeholder='Enter Password'></input><br></br>
            {err.present && (<p id="err">{err.message}</p>)}
            <input type="checkbox" id="remember" checked={rem} onChange={() => setRem(!rem)}/> Remember Me
            <a onClick={()=>setPage('recover')}id="recover">Forgot key?</a>
         </form>
         <button type="submit" id="log_button" onClick={check}> Login</button>
         <p className ="redirect" style={{ color: mode === "dark" ? "black" : "black" }}>Don't have an account? <a id="signup" onClick={handleRegPage}>Signup</a></p>
         {verify &&(
                <div id = "container1">
                    <div id="content1">
                        <h3>Verifying...</h3>
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                </div>
               </div>
         )}
         {get &&(
                <div id = "container1">
                    <div id="content1">
                        <h3>{e}</h3>
                        {!restart && (<div className="spinner-container">
                            <div className="spinner" />
                        </div>)}
                        {restart &&(<><button onClick={handleClick} className= "ok_button1"> OK </button></>)}
                </div>
               </div>
         )}
        </div>
    )
}
const Register=({handleLoginPage, setPage})=>{
    const[current, setCurrent] = useState("first")
    const[data, setData] = useState(null)
    const[err, setErr] = useState({message: "", present:false, type:""})
    const[e, setE] = useState({message: "", present:false, type:""})
    const[pass, setPass] = useState("")
    const {mode} = useMode();
    const {setUser, setEnter} = useContext(AppContext);
    const [input, setInput] = useState("")
    const[id, setId] = useState("")
    const handleInput=(e)=>{
        setInput(e.target.value);
        if (err.present) {
            setE({ message: "", present: false });
        }
    }
    useEffect(() => {
        if (data) {
            setCurrent('fourth');
        }
    }, [data]);
    const handleCopy = (item) => {
        navigator.clipboard.writeText(item)
    };

    const save = () => {
        const content = `Wallet Address:\t${data.walletID}\nKey: ${pass}`;
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.download = "LoginCredentials.txt";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const handleClick = ()=>{
        setErr({message: "", present:false, type:""})
        setPage("login")
    }
    const handleConfirm=(e)=>{
        e.preventDefault();
        const key = input.trim();
        if (key == ""){
            setE({message:"^Field can't be empty", present:true});
            return
        }
        if(key.length!==9) {
            setE({message:"^Field must be 9 digits long", present:true});
            return
        }
        else if (!(/^\d+$/.test(key))) {
            setE({message:"^Field must be all digits", present:true});
            return
        }

        // pass all the checks
        setId(key)
        startDocker(key)
        setCurrent("third")
        Wallet.generate().then((result) => {
            const userData ={
                walletID: result.miningAddress,
                peer: key,
                balance: 0, // for demo purposes
                transactions:[],
                fileHistory:[],
                servedHistory:[], // the clients that it served before  
                proxied:[], // the peers that user proxied
                mode: "light"
            };
            localStorage.setItem("mode", "light")
            localStorage.setItem("id", key)
            setPass(result.password)
            setData(userData)
        })
        .catch((error) => {
            setCurrent("first")
            setErr({message:"Wallet Already Exists. Please Login.", present:true});
        });
    }
    return(
        <div>
            {current === "first" &&
            (<div className = "register_page">
                <h3 className="welcome" style={{ color: mode === "dark" ? "black" : "black" }}>Let's Set Up Your Crypto Wallet!</h3>
                <button id="log_button" onClick={() => setCurrent("second")}> Continue</button>
                <p className ="redirect1" style={{ color: mode === "dark" ? "black" : "black" }}>Have an account? <a id="signup" onClick={handleLoginPage}>Login</a></p>
                </div>
            )}
            {current === "second" &&
            (<div className = "register_page">
                <div id="input_field">
                <label id = "sbu">Enter your SBU ID:</label>
                <input type="text" id="key" value={input} onChange={handleInput} placeholder='SBU ID'></input>
                </div>
                {e.present && (<p id="err">{e.message}</p>)}
                <button id="log_button" onClick={handleConfirm}> Continue</button>
                </div>
            )}
            {current === "third" &&
            (<div className = "register_page">
                <h3 className="welcome2" style={{ color: mode === "dark" ? "black" : "black" }}>Generating your wallet...</h3>
                <div className='loading_container'>
                     <Rings id="loading"/>
                </div>
                </div>
            )}
            {err.present && (
                <div id = "container2">
                    <div id="content2">
                        <h3>{err.message}</h3>
                        <button onClick={handleClick} className= "ok_button1"> OK </button>
                    </div>
               </div>
            )}
            {/* {err.present && err.type== "2" (
                <div 
                id = "container1">
                    <div id="content1">
                        <h3>{err.message}</h3>
                        <button onClick={handleClick1}> OK </button>
                    </div>
               </div>
            )} */}
            {current === "fourth" && (
                <div className = "register_page">
                <div id="b">
                <button id= "save" onClick={save}><GoDownload size={18}/>Save Credentials</button>
                </div>
                <div className='info_container'>
                    <ul className='info_list'>
                        <li style={{ color: mode === "dark" ? "black" : "black" }}>Wallet Address:  <button type="button" id="copy" onClick={()=>handleCopy(data.walletID)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br><span id="w">{data.walletID}</span></li>
                        <li style={{ color: mode === "dark" ? "black" : "black" }}>Password:  <button type="button" id="copy" onClick={()=>handleCopy(pass)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br> <span id="private_key">{pass}</span></li>
                    </ul>
                    <button id="log" onClick={() => {setUser(data); setEnter(true);}}> Login </button>
                </div>
            </div>
            )}
        </div>
    )
}
export default Entry;