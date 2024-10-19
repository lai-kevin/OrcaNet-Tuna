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
        {type: "folder",name: "studio ghibli movies",hashId: "Zxczv123kcbxvh14boadab",size: "100 MB", providers: [{id: userhash1, price: 3, timestamp: randomTimestamp(), downloads: 100},{id: userhash2 , price: 5, timestamp: randomTimestamp(), downloads: 200},{id: userhash3, price: 3.5, timestamp: randomTimestamp(), downloads: 300}]},
        {type: "mp3",name: "Shook Ones PT II.mp3",hashId: "Asdasdxc5nksdhbvshba2315jhd",size: "124 MB", providers: [{id: userhash2, price: 3, timestamp: randomTimestamp(), downloads: 10},{id: userhash3, price: 7, timestamp: randomTimestamp(), downloads: 26},{id: userhash4, price: 5, timestamp: randomTimestamp(), downloads: 3}, {id: userhash5, price: 53, timestamp: randomTimestamp(), downloads: 22}, {id: userhash6, price: 20, timestamp: randomTimestamp(), downloads: 50}] },
    ]
    let peers = [
        { id: 0, location: "192.168.1.1", Port: 8080, Price: 3 },
        { id: 1, location: "10.0.0.1", Port: 8081, Price: 5 },
        { id: 2, location: "172.16.0.1", Port: 8082, Price: 8 },
        { id: 3, location: "192.0.2.1", Port: 8083, Price: 2 },
        { id: 4, location: "203.0.113.1", Port: 8084, Price: 7 },
        { id: 5, location: "198.51.100.1", Port: 8085, Price: 5 },
        { id: 6, location: "192.168.1.100", Port: 8086, Price: 5 },
        { id: 7, location: "10.0.1.1", Port: 8087, Price: 9 },
        { id: 8, location: "172.16.1.1", Port: 8088, Price: 10 },
        { id: 9, location: "192.168.2.1", Port: 8089, Price: 6 },
    ];
    let proxyData = [
        {
            client: "192.168.1.10",
            Url: "www.google.com",
            method: "GET",
            time: "2024-10-16 12:00:00",
            status: "Success",
            size: "1.2 MB",
            sent: "0 KB",
            received: "1.2 MB",
        },
        {
            client: "192.168.1.12",
            Url: "www.forms.com/posts",
            method: "POST",
            time: "2024-10-16 12:10:00",
            status: "Success",
            size: "120 KB",
            sent: "80 KB",
            received: "120 KB",
          }
    ]

    let sampleUpload = {
        type: "folder",
        name: "simpleGamecontroller.ino",
        hashId: "b86f8e8cd90e0eaa5942d5141a56614601857b65871f21789444746061017df9",
        size: "20 MB",
        price: 200,
        downloaders: [userhash1,userhash2], //Just a list of users downloading to demo what the ui would look like if we want to remove an upload with people downloading

    }

    const [dummyFiles,setDummyFiles] = useState(sampleFiles);
    const [searchResultsFound,setSearchResultsFound] = useState(false);
    const [fileToDownload,setFileToDownload] = useState("");
    const [fileToRemove,setFileToRemove] = useState(null);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([sampleUpload]); //currently storing apps "uploads" here in this global context for demo purposes as there is no real data
    const [downloads, setDownloads] = useState([]);
    const [proxy, setProxy] = useState(true);
    const [server, setServer] = useState("--")
    const [proxyHistory, setProxyHistory] = useState(proxyData);
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
            dummyFiles, setDummyFiles,
            peers
            }}
            >
            {props.children}
        </AppContext.Provider>
    )
 }


 