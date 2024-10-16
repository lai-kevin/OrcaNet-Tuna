import { GiWhaleTail } from 'react-icons/gi';
import { useState, useEffect } from 'react';
import { Rings } from 'react-loader-spinner';
import bs58check from 'bs58check'
import { FaRegCopy } from 'react-icons/fa';
const bip39 = require('bip39');
const { HDKey } = require('ethereum-cryptography/hdkey');
const hash = require('hash.js')

const Entry = ({user, setUser}) =>{
    const [page, setPage] = useState('login')
    const[effect, setEffect] = useState(false);
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
                <h1 id ="title">OrcaNet</h1>
            </div>
            {page ==="recover" && <Recover setPage ={setPage}/>}
            {(page === "login" || page ==="register") && <>
            <div className="inner_container">
                <h2 id="head">{page === "login" ? "Login" : "Register"}</h2>
                <div className="options">
                    <div className="highlight" style={{ left: page === 'login' ? '0%' : '50%' }} />
                    <a id="inner_button1" onClick={handleLoginPage}>Login</a>
                    <a id="inner_button2" onClick={handleRegPage}>Register</a>
                </div>
            <div id="contents">
                <div className={`effect ${effect ? (page === 'register' ? 'right' : 'left') : ''}`}>
                    {page === 'login' && <Login handleRegPage={handleRegPage} user={user} setUser={setUser} setPage ={setPage}/>}
                </div>
                <div className={`effect ${effect ? (page === 'login' ? 'right' : 'left') : ''}`}>
                    {page === 'register' && <Register handleLoginPage={handleLoginPage} user={user} setPage={setPage}/>}
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
        <h2 id="head">Recover</h2>
        {curr ==="recover" && (<>
            <form onSubmit={verify}>
            <input type="text" id="phrase" value={phrase} onChange={handleInput} placeholder='Enter 12-word phrase'></input><br></br>
            {err.present && (<p id="err1">{err.message}</p>)}
            </form>
            <button type="submit" id="button" onClick={verify}> Recover</button>
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
const Login=({handleRegPage, user, setUser, setPage})=>{
    const [input, setInput] = useState("")
    const [err, setErr] = useState({message: "", present:false})
    const handleInput=(e)=>{
        setInput(e.target.value);
        if (err.present) {
            setErr({ message: "", present: false });
        }
    }
    const check = (e)=>{
        e.preventDefault();
        const key = input.trim();
        if (key == ""){
            setErr({message:"^Field can't be empty", present:true});
            return
        }
        let result = localStorage.getItem(key);
        if (result == null){
            setErr({message:"^Invalid Key", present:true});
        }
        else{
            let data = JSON.parse(result)
            setUser(data);
        }
    }
    return(
        <div id = "login_page">
         <form onSubmit={check}>
            <input type="text" id="key" value={input} onChange={handleInput} placeholder='Enter Private Key'></input><br></br>
            {err.present && (<p id="err">{err.message}</p>)}
            <a onClick={()=>setPage('recover')}id="recover">Forgot key?</a>
         </form>
         <button type="submit" id="log_button" onClick={check}> Login</button>
         <p className ="redirect">Don't have an account? <a id="signup" onClick={handleRegPage}>Signup</a></p>
        </div>

    )
}
const Register=({handleLoginPage, user, setPage})=>{
    const[current, setCurrent] = useState("first")
    const[data, setData] = useState(null)
    const handleSwitch = (p)=>{
        setCurrent(p);
        setTimeout(() => {
           setUpKey();
        }, 3000); 
    }
    useEffect(() => {
        if (data) {
            setCurrent('fourth');
        }
    }, [data]);
    const handleCopy = (item) => {
        navigator.clipboard.writeText(item)
    };
    const setUpKey = async() => {
        const phrase = bip39.generateMnemonic(128);
        const seed = bip39.mnemonicToSeedSync(phrase);
        setCurrent('third')
        setTimeout(()=>{
            const childKey = HDKey.fromMasterSeed(seed).derive("m/44'/0'/0'");
            const privateKey = Array.from(childKey.privateKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
            const publicKey = Array.from(childKey.publicKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
            const sha = hash.sha256().update(childKey.publicKey).digest();
            const publicKeyHash = hash.ripemd160().update(sha).digest();  
            const pub = Buffer.from(publicKeyHash, 'hex');
            const payload = Buffer.concat([Buffer.from([0x00]), pub]);
            const id = bs58check.encode(payload);
            const userData ={
                privateKey: privateKey,
                phrase:phrase,
                publicKey: publicKey,
                publicKeyHash: publicKeyHash,
                walletID: id,
                balance: 100,
                transactions:[],
                fileHistory:[]
            };
            setData(userData);
            localStorage.setItem(privateKey, JSON.stringify(userData));
    }, 3000)
    };
    return(
        <div>
            {current === "first" &&
            (<div className = "register_page">
                <h3 className="welcome">Let's Set Up Your Crypto Wallet!</h3>
                <button id="log_button" onClick={() => handleSwitch("second")}> Continue</button>
                <p className ="redirect1">Have an account? <a id="signup" onClick={handleLoginPage}>Login</a></p>
                </div>
            )}
            {current === "second" &&
            (<div className = "register_page">
                <h3 className="welcome2">Generating your 12-word phrase...</h3>
                <div className='loading_container'>
                     <Rings id="loading"/>
                </div>
                </div>
            )}
            {current === "third" &&
            (<div className= "register_page">
                <h3 className="welcome3">Generating your private and public key...</h3>
                <div className='loading_container'>
                     <Rings id="loading" />
                </div>
                </div>
            )}
            {current === "fourth" && (
                <div className = "register_page">
                <h3 id="welcome1">Please save these info:</h3>
                <div className='info_container'>
                    <ul className='info_list'>
                        <li><span id="phrase_title">Recovery phrase:</span> <button type="button" id="copy" onClick={()=>handleCopy(data.phrase)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button> <br></br><span className="recover_phrase">{data.phrase.split(" ").slice(0, 6).join(" ")}</span><br></br>
                        <span className="recover_phrase">{data.phrase.split(" ").slice(5, 12).join(" ")}</span>
                        </li>
                        <li>Private key:  <button type="button" id="copy" onClick={()=>handleCopy(data.privateKey)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br> <span id="private_key">{data.privateKey}</span></li>
                        <li>Public key:  <button type="button" id="copy" onClick={()=>handleCopy(data.publicKey)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br><span id="public_key">{data.publicKey}</span></li>
                        <li>Wallet ID:  <button type="button" id="copy" onClick={()=>handleCopy(data.walletID)}><FaRegCopy style={{ width: '100%', height: '100%', background: 'transparent'}}/></button><br></br><span id="w">{data.walletID}</span></li>
                    </ul>
                </div>
            </div>
            )}
        </div>
    )
}
export default Entry;