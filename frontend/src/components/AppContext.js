import React, { createContext, useState } from "react";


export const AppContext = createContext();

//This will pretty much encapsulate some of the global stuff that i think all the components might need
//hopefully this should make it easier to retrieve state vars later on without prop drilling 

export function AppContextProvider(props){
    let userhash1 = "9738a15ccc6cbc6c84e2617ad445944f2aa126dd7363ce8e9b5da6567b15e44d"
    let userhash2 = "707d683a8bae94497ff89ef9c55d2eef9607b58a6831cecc34f83ff340dd81c9"
    let userhash3 =  "b01ad20e4de4055c2b4f6d11a424bf940aaa309a85d27a749e1c8d8d53f4ac39"
    let userhash4 =  "e15b9c444a533a11cc3562d57454f079577d4ab804ddf3550520209d5f6bee3f"
    let userhash5 = "e2430b344783b96f397102992add6b7a77506243e85ce3c008e55e130cc8a3f2"
    let userhash6 = "45c3e83c84f24c215bd9e59c56537f1371a2d1dd0e44afcfd219587a284cdb45"

    function randomTimestamp() {
        const end = new Date();
        const start = new Date(2023,0,1);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      }

      let sampleFiles = [
        {type: "folder",name: "studio ghibli movies",hashId: "Zxczv123kcbxvh14boadab",size: "100 MB", providers: [{id: userhash1, price: 3, timestamp: randomTimestamp(), downloads: 100, status:"offline" },{id: userhash2 , price: 5, timestamp: randomTimestamp(), downloads: 200, status:"online"},{id: userhash3, price: 3.5, timestamp: randomTimestamp(), downloads: 300, status:"online"}]},
        {type: "mp3",name: "Shook Ones PT II.mp3",hashId: "Asdasdxc5nksdhbvshba2315jhd",size: "124 MB", providers: [{id: userhash2, price: 3, timestamp: randomTimestamp(), downloads: 10, status:"offline"},{id: userhash3, price: 7, timestamp: randomTimestamp(), downloads: 26, status:"offline"},{id: userhash4, price: 5, timestamp: randomTimestamp(), downloads: 3, status:"online"}, {id: userhash5, price: 53, timestamp: randomTimestamp(), downloads: 22, status:"online"}, {id: userhash6, price: 20, timestamp: randomTimestamp(), downloads: 50, status:"offline"}] },
    ]
    
    let sampleUpload = {
        type: "folder",
        name: "simpleGamecontroller.ino",
        hashId: "b86f8e8cd90e0eaa5942d5141a56614601857b65871f21789444746061017df9",
        size: "20 MB",
        price: 200,
        downloaders: [userhash1,userhash2], //Just a list of users downloading to demo what the ui would look like if we want to remove an upload with people downloading
        timestamp: randomTimestamp()
    }

    let peers = [
        { id: 0, location: "142.168.1.1", Price: 1, wallet:"1FfmbHfnpaZjKFvyi1okTjJJusN455paPH" },
        { id: 1, location: "15.0.0.1", Price: 2 , wallet:"1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v"},
        { id: 2, location: "122.16.0.1", Price: 1 , wallet:"1BoatSLRHtKNngkdXEeobR76b53LETtpyT"},
        { id: 3, location: "102.0.2.1", Price: 3 , wallet:"1Ez69SnzzmePmZX3WpEzMKTrcBF2gpNQ55"},
        { id: 4, location: "203.0.113.1", Price: 0.5 , wallet:"1PzP1eP5QGefi2DMPTfTL5SLmv7DivfNa"},
        { id: 5, location: "198.51.100.1", Price: 0.5, wallet:"1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp" },
        { id: 6, location: "191.168.1.100",  Price: 4, wallet:"1A8JiWcwvpY7tAopUkSnGuEYHmzGYfZPiq" },
        { id: 7, location: "14.0.1.1",  Price: 2, wallet:"1dice97ECuByXAvqXpaYzSaQuPVvrtmz6" },
        { id: 8, location: "182.16.1.1",  Price: 3 , wallet:"1G5RHZgLA9ppp8SEpGG58CRvzYHsYuTfAy"},
        { id: 9, location: "162.168.2.1", Price: 1, wallet:"1LuckyR1fFHEsXYyx5QK4UFzv3PEAepPMK"},
    ];

    const [dummyFiles,setDummyFiles] = useState(sampleFiles);
    const [searchResultsFound,setSearchResultsFound] = useState(false);
    const [fileToDownload,setFileToDownload] = useState("");
    const [fileToRemove,setFileToRemove] = useState(null);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([sampleUpload]); //currently storing apps "uploads" here in this global context for demo purposes as there is no real data
    const [downloads, setDownloads] = useState([]);
    const [proxy, setProxy] = useState(false);
    const [server, setServer] = useState("--")
    const [proxyHistory, setProxyHistory] = useState([]);
    const [total, setTotal] = useState(0);
    const [proxyPrice, setproxyPrice] = useState(0)
    const [serverHistory, setServerHistory] = useState([])
    const [stop, setStop] = useState([])
    return(
        <AppContext.Provider value = {
            {
            searchResultsFound,setSearchResultsFound,
            fileToDownload,setFileToDownload,
            fileToRemove,setFileToRemove,
            downloadOpen, setDownloadOpen,
            downloads, setDownloads,
            uploadHistory, setUploadHistory,
            proxy, setProxy,
            server, setServer,
            proxyHistory, setProxyHistory,
            total, setTotal,
            proxyPrice, setproxyPrice,
            serverHistory, setServerHistory,
            stop, setStop,
            dummyFiles, setDummyFiles,
            peers
            }}
            >
            {props.children}
        </AppContext.Provider>
    )
 }


 