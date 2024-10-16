import React, { createContext, useState } from "react";


export const AppContext = createContext();

//This will pretty much encapsulate some of the global stuff that i think all the components might need
//hopefully this should make it easier to retrieve state vars later on without prop drilling 

export function AppContextProvider(props){

    let dummyFiles = [
        {type: "folder",name: "studio ghibli movies",hashId: "Zxczv123kcbxvh14boadab",size: "100 GB"},
        {type: "mp3",name: "Shook Ones PT II.mp3",hashId: "Asdasdxc5nksdhbvshba2315jhd",size: "124MB"},
    ]
    const [searchResultsFound,setSearchResultsFound] = useState(false);
    const [fileToDownload,setFileToDownload] = useState("");
    const [downloadOpen, setDownloadOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]); //currently storing apps "uploads" here in this global context for demo purposes as there is no real data
    const [downloads, setDownloads] = useState([]);
    return(
        <AppContext.Provider value = {
            {
            searchResultsFound,setSearchResultsFound,
            fileToDownload,setFileToDownload,
            downloadOpen, setDownloadOpen,
            downloads, setDownloads,
            uploadHistory, setUploadHistory,
            dummyFiles
            }}
            >
            {props.children}
        </AppContext.Provider>
    )
 }