import { GiWhaleTail } from 'react-icons/gi';
import { useState, useEffect, useContext } from 'react';
import { Rings } from 'react-loader-spinner';
import bs58check from 'bs58check'
import { FaRegCopy } from 'react-icons/fa';
import { useMode } from './Mode';
import { AppContext } from './AppContext';
import { GoDownload } from "react-icons/go";
import * as Wallet from '../WalletAPI';

const bip39 = require('bip39');
const { HDKey } = require('ethereum-cryptography/hdkey');
const hash = require('hash.js')

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
                <GiWhaleTail style={{fontSize: '120px', color:"blue", marginLeft: '500px'}}/>
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
    const {mode} = useMode();
    const [err, setErr] = useState({message: "", present:false})
    const verify=(e)=>{
        e.preventDefault();
        let p = phrase.trim();
        if (p === ""){
            setErr({message:"^Field can't be empty", present:true});
            return
        }
        let pk=""
        Object.keys(localStorage).some(key => {
            const item = JSON.parse(localStorage.getItem(key));
            if(item.phrase === phrase){
                pk=item.privateKey;
                return true;
            }
            return false;
        });
        if(pk===""){
            setErr({message: "Account not found", present:true})
        }
        else{
            setKey(pk);
            setCurr("success");
        }
    }
    const handleInput=(e)=>{
        setPhrase(e.target.value);
        if (err.present) {
            setErr({ message: "", present: false });
        }
    }
    const change =()=>{
        setPage("login");
    }
    const handleCopy = (item) => {
        navigator.clipboard.writeText(item)
    };
    return(
        <div id = "recover_page">
        <h2 id="head" style={{ color: mode === "dark" ? "black" : "black" }}>Recover</h2>
        {curr ==="recover" && (<>
            <form onSubmit={verify}>
            <input type="text" id="phrase" value={phrase} onChange={handleInput} placeholder='Enter 12-word phrase'></input><br></br>
            {err.present && (<p id="err1">{err.message}</p>)}
            </form>
            <button type="submit" id="button" onClick={verify} > Recover</button>
            <div id="bottom_buttons">
                <button type="submit" id="button3" onClick={()=>setPage("login")}> Login</button>
                <button type="submit" id="button4" onClick={()=>setPage("register")}> Register</button>
            </div>
            </>
         )}
         {curr==="success" &&(
            <div>
                <h3 id="key_info_title">Your private key: <button type="button" id="copy" onClick={()=>handleCopy(key)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button></h3><br></br>
                <span id="info_key">{key}</span>
                <button type="submit" id="button1" onClick={change}>Go to Login</button>
            </div>
         )}
       </div>
    )
}
const Login=({handleRegPage, setPage})=>{
    const [input, setInput] = useState("")
    const [verify, setVerify] = useState(false)
    const [get, setGet] = useState(false)
    const [e, setE] = useState("Loggin In")
    const [restart, setRestart] = useState(false)
    const {mode} = useMode();
    const [err, setErr] = useState({message: "", present:false})
    const {rem, setRem, user, setUser} = useContext(AppContext);
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
            Wallet.reenter()
            .then((result) => {
                const userData ={
                    walletID: result.miningAddress,
                    balance: result.balance, 
                    transactions:[],
                    fileHistory:[],
                    servedHistory:[], // the clients that it served before  
                    proxied:[], // the peers that user proxied
                };
                setUser(userData);
                setRem(checked);
                setGet(false)
            })
            .catch(() => {
                setE("Session Expired")
                localStorage.removeItem("rem");
                setRestart(true)
            });
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
            const userData ={
                walletID: result.miningAddress,
                balance: result.balance, 
                transactions:[],
                fileHistory:[],
                servedHistory:[], // the clients that it served before  
                proxied:[], // the peers that user proxied
                mode: "light"
            };
            if(rem){
                localStorage.setItem("rem", true);
            }
            else{
                localStorage.setItem("rem", false);
            }
            setUser(userData);
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
            {/* <a onClick={()=>setPage('recover')}id="recover">Forgot key?</a> */}
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
    const[pass, setPass] = useState("")
    const {mode} = useMode();
    const {setUser} = useContext(AppContext);
    const handleSwitch = (p)=>{
        setCurrent(p);
        Wallet.generate().then((result) => {
            const userData ={
                walletID: result.miningAddress,
                balance: 0, // for demo purposes
                transactions:[],
                fileHistory:[],
                servedHistory:[], // the clients that it served before  
                proxied:[], // the peers that user proxied
            };
            const addr = result.miningAddress;
            localStorage.setItem(addr, "light")
            setPass(result.password)
            setData(userData)
        })
        .catch((error) => {
            setCurrent("first")
            setErr({message:"Wallet Already Exists. Please Login.", present:true});
        });
    }
    useEffect(() => {
        if (data) {
            setCurrent('fourth');
        }
    }, [data]);
    const handleCopy = (item) => {
        navigator.clipboard.writeText(item)
    };

    // this is just a temperary way we are generating the keys. All these will be generated by the crypto wallet API
    // const setUpKey = async() => {
    //     // const phrase = bip39.generateMnemonic(128);
    //     // const seed = bip39.mnemonicToSeedSync(phrase);
    //     setCurrent('third')
    //     setTimeout(()=>{
    //         // const childKey = HDKey.fromMasterSeed(seed).derive("m/44'/0'/0'");
    //         // const privateKey = Array.from(childKey.privateKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
    //         // const publicKey = Array.from(childKey.publicKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
    //         // const sha = hash.sha256().update(childKey.publicKey).digest();
    //         // const publicKeyHash = hash.ripemd160().update(sha).digest();  
    //         // const pub = Buffer.from(publicKeyHash, 'hex');
    //         // const payload = Buffer.concat([Buffer.from([0x00]), pub]);
    //         // const id = bs58check.encode(payload);
    //         const userData ={
    //             // privateKey: privateKey,
    //             // phrase:phrase,
    //             // publicKey: publicKey,
    //             // publicKeyHash: publicKeyHash,
    //             walletID: id,
    //             balance: 100, // for demo purposes
    //             transactions:[],
    //             fileHistory:[],
    //             servedHistory:[], // the clients that it served before  
    //             proxied:[], // the peers that user proxied
    //             mode: "light"
    //         };
    //         setData(userData);
    //         // localStorage.setItem(privateKey, JSON.stringify(userData));
    // }, 3000)
    // };
    
    const save = () => {
        const content = `Wallet Address:\t${data.walletID}\nKey: ${data.key}`;
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
    // const handleClick1=()=>{
    //     setErr({message: "", present:false, type:""})
    //     setPage("register")
    // }
    return(
        <div>
            {current === "first" &&
            (<div className = "register_page">
                <h3 className="welcome" style={{ color: mode === "dark" ? "black" : "black" }}>Let's Set Up Your Crypto Wallet!</h3>
                <button id="log_button" onClick={() => handleSwitch("second")}> Continue</button>
                <p className ="redirect1" style={{ color: mode === "dark" ? "black" : "black" }}>Have an account? <a id="signup" onClick={handleLoginPage}>Login</a></p>
                </div>
            )}
            {current === "second" &&
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
                <div id = "container1">
                    <div id="content1">
                        <h3>{err.message}</h3>
                        <button onClick={handleClick1}> OK </button>
                    </div>
               </div>
            )} */}
            {current === "fourth" && (
                <div className = "register_page">
                <button id= "save" onClick={save}><GoDownload size={18}/>Save Credentials</button>
                <div className='info_container'>
                    <ul className='info_list'>
                        <li style={{ color: mode === "dark" ? "black" : "black" }}>Wallet Address:  <button type="button" id="copy" onClick={()=>handleCopy(data.walletID)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br><span id="w">{data.walletID}</span></li>
                        <li style={{ color: mode === "dark" ? "black" : "black" }}>Password:  <button type="button" id="copy" onClick={()=>handleCopy(pass)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br> <span id="private_key">{pass}</span></li>
                    </ul>
                    <button id="log" onClick={() => setUser(data)}> Login </button>
                </div>
            </div>
            )}
        </div>
    )
}
export default Entry;