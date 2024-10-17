import React, { createContext, useState } from "react";


export const AppContext = createContext();

//This will pretty much encapsulate some of the global stuff that i think all the components might need
//hopefully this should make it easier to retrieve state vars later on without prop drilling 

export function AppContextProvider(props){

    let dummyFiles = [
        {type: "folder",name: "studio ghibli movies",hashId: "Zxczv123kcbxvh14boadab",size: "100 GB"},
        {type: "mp3",name: "Shook Ones PT II.mp3",hashId: "Asdasdxc5nksdhbvshba2315jhd",size: "124MB"},
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
    const [searchResultsFound,setSearchResultsFound] = useState(false);
    const [fileToDownload,setFileToDownload] = useState("");
    const [fileToRemove,setFileToRemove] = useState(null);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]); //currently storing apps "uploads" here in this global context for demo purposes as there is no real data
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
            dummyFiles,
            peers
            }}
            >
            {props.children}
        </AppContext.Provider>
    )
 }