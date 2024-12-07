import axios from "axios";


//create wallet
 export const generate = async() =>{
    try{
        const req = await axios.post("http://localhost:8080/createWallet", {})
        console.log(req.data)
        return req.data
    }
    catch(error){
        console.log(error)
        throw error
    }
};
// login
export const enter = async({password, rem}) =>{
    try{
        console.log(password, rem)
        const req = await axios.post("http://localhost:8080/login", {
            "password": password,
            "rememberMe": rem
        }, {withCredentials: "include"})
        console.log(req.data)
        return req.data
    }
    catch(error){
        throw error
    }
};
// get wallet address
export const address = async() =>{
    try{
        const req = await axios.get("http://localhost:8080/getMiningAddress")
        return req.data
    }
    catch(error){
        throw error
    }
};

// get wallet balance
export const balance = async() =>{
    try{
        const req = await axios.get("http://localhost:8080/getBalance")
        return req.data
    }
    catch(error){
        throw error
    }
};

// Mine coins

export const mine = async(coins) =>{
    try{
        console.log(coins)
        const req = await axios.post("http://localhost:8080/mine", {
            num_blocks: coins
        })
        return req.data
    }
    catch(error){
        throw error
    }
};

// send money
export const send = async(addr, num) =>{
    try{
        const req = await axios.post("http://localhost:8080/sendToAddress", {
            address: addr,
            amount: num
        })
        return req.data
    }
    catch(error){
        throw error
    }
};

// retrieve transaction history
export const retrieve = async() =>{
    try{
        const req = await axios.get("http://localhost:8080/getTransactionHistory")
        return req.data
    }
    catch(error){
        throw error
    }
};

//logOut
export const logOut = async() =>{
    try{
        const req = await axios.get("http://localhost:8080/logout")
        return req.data
    }
    catch(error){
        throw error
    }
};

//retreive the session data 
export const reenter = async(key) =>{
    try{
        const token = localStorage.getItem("currentUser");
        const req = await axios.get("http://localhost:8080/retrieveInfo", {withCredentials: "include"}
        )
        return req.data
    }
    catch(error){
        throw error
    }
};

// delete account 
export const deleteAccount = async(key) =>{
    try{
        const req = await axios.get("http://localhost:8080/deleteWallet")
        return req.data
    }
    catch(error){
        throw error
    }
};

//track cpu
export const track = async() =>{
    try{
        const req = await axios.get("http://localhost:8080/track")
        return req.data
    }
    catch(error){
        throw error
    }
};
