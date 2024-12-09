import { LuFile } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuFileImage } from "react-icons/lu";
import { LuPlay } from "react-icons/lu";
import { MdOutlineCancel } from "react-icons/md";
import { LuPause } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { NavLink, useLocation} from 'react-router-dom';
import { GiInfo } from "react-icons/gi";


import { useContext, useEffect, useState, useRef } from 'react';
import FileModal from "./FileModal";
import TabSelectHorizontal from "./Tabs";
import { LuUpload } from "react-icons/lu";
import { AppContext } from "./AppContext";
import DownloadModal from "./DownloadModal";
import CancelUploadModal from "./UploadModal";
import DownloadFinishedPopUp from "./PopUp";
import {getFileMetaDataRPC, getFileProviders, getFileProvidersWMetaData, getHistory, uploadFileRPC} from "../RpcAPI"

const bip39 = require('bip39');
const { HDKey } = require('ethereum-cryptography/hdkey');

function randomTimestamp() {
  const end = new Date();
  const start = new Date(2023,0,1);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


const Files = () => {
  let sampleData = [{type: "image",name: "Screenshot 2025-02-18 211342",hashId: "zxcasd2lajnf5aoiuanfna1kjzx",size: "1 MB",timestamp: randomTimestamp()},
    {type: "image",name: "my_social_security_number.png",hashId: "as13dncx,jvkbvskh4sf",size: "1 MB", timestamp: randomTimestamp() },
    {type: "pdf",name: "tuna_recipes.pdf",hashId: "ascn123kcadsxvh14boadab",size: "124 MB",timestamp: randomTimestamp() },
    {type: "folder",name: "homework",hashId: "ascn123kcbxvh14boadab",size: "1MB",timestamp: randomTimestamp()},
    {type: "mp3",name: "Lo_Siento_BB:/.mp3",hashId: "zxc5nksdhbvshba2315jhd",size: "124 MB",timestamp: randomTimestamp() },
    {type: "text",name: "lyrics_for_my_next_mixtape.txt",hashId: "as1dzxc1239zxczvsfsfsd",size: "1 MB",timestamp: randomTimestamp()},
    {type: "folder",name: "node_modules",hashId: "12zxaweqr3zc25zca;/';45",size: "50 MB", timestamp: randomTimestamp()}
  ];

  const location = useLocation();


  const {user, searchResultsFound,uploadHistory,setUploadHistory,downloads,setDownloads,setFileToRemove,fileToRemove,  setSearchResultsFound, setFileToDownload, dummyFiles,setDummyFiles} = useContext(AppContext);
  const [downloadHistory, setDownloadHistory] = useState([]);// move to a global app context in the future?
  // const [proxyHistory, setProxyHistory] = useState([]);this should probably somewhere else now that we know what it is

  const [fileToUpload, setFileToUpload] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("");
  const [activeTab, setActiveTab] = useState("Downloads");
  const [searchInput, setSearchInput] = useState("");
  const [popUpOpen,setPopUpOpen] = useState(false);
  const [downloadFinished, setDownloadFinished] = useState(false); //set to true for demo purposes


  const handleProvideFile = async () => {
    const shareResponse = await uploadFileRPC([{file_path: fileToUpload.name, price: fileToUpload.price}]);
    console.log(shareResponse);
    
  }
  const handleGetFileMetaData = async (hashId) => {
    //gets providers
    const fileMetaData = await getFileProvidersWMetaData([{"file_hash" : hashId}]);
    if(fileMetaData.success === false){
      //Success is a key in the return object
      //do our error here
    }
    setSearchResultsFound(true);
    if(fileMetaData !== undefined){
      setFileToDownload(fileMetaData);
    }
  }
  const handleSettingHistory = async () =>{
    //leave it open to extracting other history we might want to render
    let curUserHistory = await getHistory([]);
    let downloadHistory = curUserHistory.result.download_history;
    setDownloadHistory(downloadHistory);//can try inserting the Time Sent as needed from the requested files list


  }
  //UseEffect hook to re request download history when switching tabs
  useEffect(()=>{
    //make a request and set the download history as needed
    if(activeTab === "Downloads"){
      handleSettingHistory();
    }
    //make cases for the rest
  },[activeTab]);


  //UseEffect hook that currently deals with adding the "upload" to the list of uploads in the global context once a fileToUpload has been selected
  //uploads list is used by Files.js to render cards of uploads
  //No real format for this just filler hash key generated, name, and size for display purposes
  useEffect(()=>{
    if(fileToUpload != null){
      const phrase = bip39.generateMnemonic(128);
      const seed = bip39.mnemonicToSeedSync(phrase);
      const childKey = HDKey.fromMasterSeed(seed).derive("m/44'/0'/0'");
      const privateKey = Array.from(childKey.privateKey).map(byte => byte.toString(16).padStart(2, '0')).join('');

      //new file and dummt file no longer have correct information pertaining to files
      //TODO remove once loading history is done
      let newFile = {
        type: "file",
        name: fileToUpload.name,
        hashId: privateKey,
        size: (fileToUpload.size / (1024 * 1024)).toFixed(2) + " MB",
        price: fileToUpload.price,
        timestamp: fileToUpload.timestamp
      } 
      let fileForDummyFiles = {
        type: "file",
        name: fileToUpload.name,
        hashId: privateKey,
        size: (fileToUpload.size / (1024 * 1024)).toFixed(2) + " MB",
        providers: [{id: user.walletID, price: fileToUpload.price, timestamp: new Date(), downloads: 0 , status: "online"}]
      }
      handleProvideFile();

      //This might not be needed anymore we should make a call to get history to rerender uploads
      
      setUploadHistory([...uploadHistory,newFile]);
      setDummyFiles([...dummyFiles, fileForDummyFiles]);
      setFileToUpload(null);
    }

  },[fileToUpload]);
  

  const handlePopUp = () => {
    setPopUpOpen(prevState => (prevState ===true ? false : true ))

  }

  const handleUpvote = () =>{
    setDownloadFinished(false);
    //Add Backend Functionality to increment a persons upvote count and factor into reputation
  }
  const handleDownvote = () => {
    setDownloadFinished(false)
    //Add Backend Functionality to decrement a persons upvote count and factor into reputation
  }
  const handleDismissPopUp = () => {
    setDownloadFinished(false); // just dismiss/abstain from rating
  }

  const handleSearch = (event) => {
      event.preventDefault(); // Prevent the default form submission behavior i hate forms ;-; 
      let fullSearchText = searchInput;
      handleGetFileMetaData(fullSearchText);

      // let file = dummyFiles.find((file) => file.hashId === fullSearchText);
      event.target.value = ""; // this should clear it after clicking
      
  }

  const handleSort = (event) => {
    let curSort = event.target.value;
    
    let sortedList;
    if(activeTab === "Downloads"){
      sortedList = downloadHistory;
    }
    if(activeTab === "Uploads"){
      sortedList = uploadHistory;
    }
    if(activeTab === "Current Downloads"){
      // sortedList = proxyHistory;
      sortedList = downloads;
    }
    if (curSort === "A-Z"){
      sortedList = sortedList.sort((a, b) =>{
        const nameA = a.name.toUpperCase(); 
        const nameB = b.name.toUpperCase(); 
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        // names must be equal
        return 0;
      }
    );
    }
    if(curSort === "Z-A"){
      sortedList = sortedList.sort((a, b) =>{
        const nameA = a.name.toUpperCase(); 
        const nameB = b.name.toUpperCase(); 
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }
      
        // names must be equal
        return 0;
      }
    );
    }
    if(curSort === "Newest"){
      sortedList = sortedList.sort((a,b) => {
        const DateA = a.timestamp.getTime();
        const DateB = b.timestamp.getTime();

        if(DateA < DateB){
          return 1;
        }
        if(DateA > DateB){
          return -1;
        }
        return 0;
      });
    }
    if(curSort === "Earliest"){
      sortedList = sortedList.sort((a,b) => {
        const DateA = a.timestamp.getTime();
        const DateB = b.timestamp.getTime();

        if(DateA < DateB){
          return -1;
        }
        if(DateA > DateB){
          return 1;
        }
        return 0;
      });
    }
    setSort(event.target.value);
    if(activeTab === "Downloads"){
      setDownloadHistory([...sortedList]);
    }
    if(activeTab === "Uploads"){
      setUploadHistory([...sortedList]);
    }
    if(activeTab === "Current Downloads"){
      // setProxyHistory([...sortedList]); move somewhere else
      setDownloads([...sortedList]);
    }
  }

  

  //update with a stop sharing button resume sharing
  const FileCard = ({type,name,hashId,size,price, downloaders,timestamp}) => {
    let FileIcon = LuFile; //image , folder, .pdf/.txt/everything else 
    if(type === "image"){ 
      FileIcon = LuFileImage;
    }
    if(type === "folder"){
      FileIcon = LuFolder;
    }

    const HandleRemoveUpload = () =>{
      setFileToRemove({name,hashId,price,downloaders});
    }

    if(activeTab === "Uploads"){
      return(
        <div className = "fileCard" onClick={HandleRemoveUpload} style={{cursor: 'pointer'}}>
          <div style = {{display: 'flex', alignItems: "center" }}><FileIcon style={{ width: '40%', height: '40%' }}/> </div>
          <div>
            <p>{name}</p>
            <p style = {{color: "#9b9b9b"}} >{hashId}</p>
          </div>
          <div>{size}  <p style = {{color: "#9b9b9b"}}>{"DateFiller"}</p></div>
        </div>
  
      );
    }
    return(
      <div className = "fileCard">
        <div style = {{display: 'flex', alignItems: "center"}}><FileIcon style={{ width: '40%', height: '40%' }}/> </div>
        <div>
          <p>{name}</p>
          <p style = {{color: "#9b9b9b"}} >{hashId}</p>
        </div>
        <div> {size} <p style = {{color: "#9b9b9b"}}>{"DateFiller"}</p></div>
      </div>

    );

  }
  

  const FileCardDownload = ({type,name,hashId,size,status,index,progress}) =>{
    //Variation of file cards meant for displaying files downloading
    //additional rendering for pause, resume, and cancel buttons based on status of download
    let FileIcon = LuFile; //image , folder, .pdf/.txt/everything else 

    //OMG this is disgusting but its quick maybe I will move the cards to their own file
    const handlePause = () => {
      let updatedDownloads = downloads.map((download) => download.hashId === hashId ? {...download, status: "paused"}: download);
      setDownloads([...updatedDownloads]);
    }
    const handleResume = () => {
      const updatedDownloads = downloads.map((download) => download.hashId === hashId ? {...download, status: "downloading"}: {...download,status : "paused"});
      setDownloads([...updatedDownloads]);
    }
    const handleCancel = () => {
      const updatedDownloads = downloads.filter((download) => download.hashId !== hashId);
      setDownloads([...updatedDownloads]);
    }


    if(type === "image"){ 
      FileIcon = LuFileImage;
    }
    if(type === "folder"){
      FileIcon = LuFolder;
    }
    let buttons = <></>;
    if(status === "downloading"){
      buttons = <div> <button className="primary_button" onClick={handleCancel}><MdOutlineCancel/></button> <button className="primary_button" onClick={handlePause}><LuPause/></button> </div>
    }
    if(status === "paused"){
      buttons = <div> <button className="primary_button" onClick={handleCancel}><MdOutlineCancel/></button> <button className="primary_button" onClick={handleResume}><LuPlay/></button> </div>
    }
    //Might need to take into account possible key confliction when rendering if lets say a person queues the same file for download again
    let progressBarColor = status === "paused" ? "#9b9b9b" : "#4CAF50";
    return(
      <div className = "fileCard">
        <div style = {{display: 'flex', alignItems: "center"}}><FileIcon style={{ width: '40%', height: '40%' }}/> </div>
        <div>
          <p>{name}</p>
          <p style = {{color: "#9b9b9b"}} >{hashId}</p>
          <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{width: `${progress}%`, backgroundColor: progressBarColor }}
          ></div>
        </div>
        </div>
        <div>{size} <> {buttons}</></div>
        
      </div>

    );
  }

  const generateFileItems = () =>{

    switch(activeTab){
      case "Downloads":
        return downloadHistory.map(file =>{
          return(
            <FileCard
              key = {file.FileHash}
              type = {file.FileMetaData.FileExtension}
              name = {file.FileMetaData.FileName}
              hashId = {file.FileHash}
              size = {file.FileMetaData.FileSize}
              timestamp={new Date()}
            />
          )
        });
       
      
      case "Uploads":
        return uploadHistory.map(file =>{
          return(
            <FileCard
              key = {file.hashId}
              type = {file.type}
              name = {file.name}
              hashId = {file.hashId}
              size = {file.size}
              price = {file.price}
              downloaders={file.downloaders}
              timestamp={file.timestamp}
            />
          )
        });

      case "Current Downloads":
        return downloads.map(file =>{
          return(
            <FileCardDownload
              key = {file.status + file.hashId}
              type = {file.type}
              name = {file.name}
              hashId = {file.hashId}
              size = {file.size}
              status = {file.status}
              progress={file.progress}
            />
          )
        });
      default:
        return downloadHistory.map(file =>{
          return(
            <FileCard
              key = {file.hashId}
              type = {file.type}
              name = {file.name}
              hashId = {file.hashId}
              size = {file.size}
              timestamp={file.timestamp}
            />
          )
        });
    }    
  }

    return (
      <>
        <DownloadFinishedPopUp
          isOpen = {downloadFinished}
          message = {<>
            The file: tuna_recipes.pdf has completed downloading.<br />
            Would you like to rate this transaction?
          </>}
          onClose = {handleDismissPopUp}
          onButton1Click = {handleUpvote}
          onButton2Click = {handleDownvote}
        />
        <div className="">
        <div className="header">
          <div id="searchContainer">
          
          <form id="search">
          
            <div id="searchWrapper">
              <label htmlFor="searchInput">
              <GiInfo style={{fontSize: "25px", color: "#548bca"}} onClick={handlePopUp}/>
              
              <input type="search" placeholder="Enter File Hash..." id="searchInput" onChange={(event)=>{setSearchInput(event.target.value)}} disabled = {location.pathname !== "/Files"}></input>
              </label>
              <button type="submit" id="findButton" onClick = {handleSearch} disabled = {location.pathname !== "/Files"}>
                  <FaSearch />
              </button>
            </div>
          </form>
          </div>
          </div>
        </div>
        {popUpOpen && <InfoPopUp handlePopUp={handlePopUp}/>}
        <h1 className = "text">Files</h1>
        
        {/* {searchResultsFound ? <FileCard key = {fileToDownload.hashId} type = {fileToDownload.type} name = {fileToDownload.name} hashId = {fileToDownload.hashId}size = {fileToDownload.size}/> : <p></p>} */}
        <TabSelectHorizontal  setActiveTab = {setActiveTab} activeTab={activeTab}/>
        
        {isOpen && <FileModal setIsOpen={setIsOpen} setFileToUpload={setFileToUpload}/>}
        {searchResultsFound && <DownloadModal user={user}/>}
        {fileToRemove === null ? <></> : <CancelUploadModal/>}
        <button className="primary_button" onClick={() => setIsOpen(true)}>Share <LuUpload /></button>
        <div className= "sort-container">
          <p className="sort-label">Sort By: </p>
          <select className="sort-select" value={sort} onChange={handleSort}>
            <option value="" disabled>Select an option</option>
            <option value="A-Z">A-Z alphabetic</option>
            <option value="Z-A">Z-A reverse alphabetic</option>
            {activeTab !== "Current Downloads" && <option value="Newest">Newest</option>}
            {activeTab !== "Current Downloads" && <option value="Earliest">Earliest</option>}
          </select>
          
        </div>
        <div id = "fileList">
          {generateFileItems()}
        </div>
      </>
    );
  };

  export const InfoPopUp = ({handlePopUp})=>{
    const menu = useRef(null);
    const outside = (e)=>{
      if (menu.current && !menu.current.contains(e.target)) {
        handlePopUp(); 
      }
    }
    useEffect(() => {
      document.addEventListener('mousedown', outside);
    });
      return(
        <div ref={menu} className="popUp">
            <p> Enter into the search bar the Hash associated with a file to download from a provider. <br />Here are some file hashes you may use for demo purposes... <br /> <br />Hash 1: Zxczv123kcbxvh14boadab<br />Hash 2: Asdasdxc5nksdhbvshba2315jhd</p>
          <ul className= "menu_list">
          </ul>
        </div>
      )
  }

        
  
  export default Files;