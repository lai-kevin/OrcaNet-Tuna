import { LuFile } from "react-icons/lu";
import { LuFileX } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuFileImage } from "react-icons/lu";
import { LuPlay } from "react-icons/lu";
import { MdOutlineCancel } from "react-icons/md";
import { LuPause } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import { GiInfo } from "react-icons/gi";


import { useContext, useEffect, useState, useRef } from 'react';
import FileModal from "./FileModal";
import TabSelectHorizontal from "./Tabs";
import { LuUpload } from "react-icons/lu";
import { AppContext } from "./AppContext";
import DownloadModal from "./DownloadModal";
import CancelUploadModal from "./UploadModal";
import DownloadFinishedPopUp from "./PopUp";
import { getFileProvidersWMetaData, getHistory, getUpdatesFromGoNode, pauseDownloadFileRPC, resumeDownloadFileRPC, uploadFileRPC } from "../RpcAPI"


const Files = () => {
  const location = useLocation();

  const { user, searchResultsFound, uploadHistory, setUploadHistory, downloads, setDownloads, setFileToRemove, fileToRemove, setSearchResultsFound, setFileToDownload, isProviding, setIsProviding } = useContext(AppContext);
  const [downloadHistory, setDownloadHistory] = useState([]);// move to a global app context in the future?
  // const [proxyHistory, setProxyHistory] = useState([]);this should probably somewhere else now that we know what it is

  const [fileToUpload, setFileToUpload] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("");
  const [activeTab, setActiveTab] = useState("Downloads");
  const [searchInput, setSearchInput] = useState("");
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [downloadFinished, setDownloadFinished] = useState(false); //set to true for demo purposes
  // const [isProviding, setIsProviding] = useState({});

  useEffect(()=>{
    handleSettingHistory();
    handleSettingUploads();
  },[])

  const handleProvideFile = async () => {
    try {
      console.log(fileToUpload.price)
      const shareResponse = await uploadFileRPC([{ file_path: fileToUpload.name, price: fileToUpload.price }]);
      let newFileHash = shareResponse.result.file_hash;
      let tempSize = (fileToUpload.size / (1024*1024)).toFixed(2)
      let sizeForDisplay = ""
      if(tempSize < 1){
        sizeForDisplay = (fileToUpload.size / (1024)).toFixed(2) + " KB"
      }
      else
        sizeForDisplay = tempSize + " MB"
      let newFile = {
        type: "file",
        name: fileToUpload.name,
        hashId: newFileHash,
        size: sizeForDisplay,
        price: fileToUpload.price,
        timestamp: new Date()
      }
      handleSettingUploads();
      
      console.log(shareResponse);
    } catch (error) {   }
    setFileToUpload(null);


  }
  const handleGetFileMetaData = async (hashId) => {
    //gets providers
    try{
      const fileMetaData = await getFileProvidersWMetaData([{ "file_hash": hashId }]);
      if (fileMetaData.success === false) {
        //Success is a key in the return object
        //do our error here
      }
      setSearchResultsFound(true);
      if (fileMetaData !== undefined) {
        setFileToDownload(fileMetaData);
      }
    }catch(error){}

  }
  const handleSettingHistory = async () => {
    //In this case we are talking about setting history
    //leave it open to extracting other history we might want to render in
    try{
      let curUserHistory = await getUpdatesFromGoNode([]);
      let downloadHistory = curUserHistory.result.downloads;
      let filteredHistory = downloadHistory.filter(download => download.DownloadProgress === 1); //tryna get rid of downloads that arent done
      setDownloadHistory(filteredHistory);//can try inserting the Time Sent as needed from the requested files list
    }catch(error){}
  }
  const handleSettingCurrentDownloads = async () => {
    try{
      let curUpdates = await getUpdatesFromGoNode([]);
      let curDownloads = curUpdates.result.downloads;
      setDownloads((prevDownloads) => {
        const prevDownloadsMap = new Map(prevDownloads.map(download => [download.RequestId, download]));
        const updatedDownloads = curDownloads.map(download => {
          const prevDownload = prevDownloadsMap.get(download.RequestId);
          if (prevDownload) {
            if (prevDownload.BytesDownloaded === download.BytesDownloaded) {
              return { ...download, status: "paused" };//kinda jank but its the only thing somewhat consistent jst gonna compare prevState to currentState
            }
          }
          return { ...download, status: "downloading" }; // default  "downloading" kinda jank but 
        });
  
        return updatedDownloads;
      })
    }catch(error){}

  }
  const handleSettingUploads = async () => {
    const updatesRespond = await getUpdatesFromGoNode([]); //look at the list of prividing
    const listOfProvidedFiles = updatesRespond.result.providing;
    setIsProviding(updatesRespond.result.is_file_provided);
    setUploadHistory(listOfProvidedFiles);
  }

  //UseEffect hook to re request download history when switching tabs
  useEffect(() => {
    //make a request and set the download history as needed
    if (activeTab === "Downloads") {
      handleSettingHistory();
      const intervalId = setInterval(() => {
        handleSettingHistory();;
      }, 5000);
      return () => clearInterval(intervalId);
    }

    //Got my foot up on the gas but somebody gotta do it
    if (activeTab === "Current Downloads") {
      handleSettingCurrentDownloads();
      const intervalId = setInterval(() => {
        handleSettingCurrentDownloads();
      }, 1000);

      return () => clearInterval(intervalId);
    }
    //set the list in the uploads lets hope it doesnt take long
    if (activeTab === "Uploads") {
      handleSettingUploads();
    }

    //make cases for the rest
  }, [activeTab]);


  //UseEffect hook that currently deals with adding the "upload" to the list of uploads in the global context once a fileToUpload has been selected
  //uploads list is used by Files.js to render cards of uploads
  //No real format for this just filler hash key generated, name, and size for display purposes
  useEffect(() => {
    if (fileToUpload != null) {
      handleProvideFile();
      //maybe set here the list of uploads or inside the handle provide file
    }

  }, [fileToUpload]);


  const handlePopUp = () => {
    setPopUpOpen(prevState => (prevState === true ? false : true))

  }

  const handleUpvote = () => {
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
    if (activeTab === "Downloads") {
      sortedList = downloadHistory;
    }
    if (activeTab === "Uploads") {
      sortedList = uploadHistory;
    }
    if (activeTab === "Current Downloads") {
      // sortedList = proxyHistory;
      sortedList = downloads;
    }
    if (curSort === "A-Z") {
      sortedList = sortedList.sort((a, b) => {
        let nameA;
        let nameB;
        if (activeTab === "Downloads" || activeTab === "Current Downloads" ) {
          nameA = a.FileMetaData.FileName.toUpperCase();
          nameB = b.FileMetaData.FileName.toUpperCase();
        }
        else {
          nameA = a.FileName.toUpperCase();
          nameB = b.FileName.toUpperCase();
        }

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
    if (curSort === "Z-A") {
      sortedList = sortedList.sort((a, b) => {
        let nameA;
        let nameB;
        if (activeTab === "Downloads" || activeTab === "Current Downloads") {
          nameA = a.FileMetaData.FileName.toUpperCase();
          nameB = b.FileMetaData.FileName.toUpperCase();
        }
        else {
          nameA = a.FileName.toUpperCase();
          nameB = b.FileName.toUpperCase();
        }
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
    if (curSort === "Newest") {
      sortedList = sortedList.sort((a, b) => {
        const DateA = a.timestamp.getTime();
        const DateB = b.timestamp.getTime();

        if (DateA < DateB) {
          return 1;
        }
        if (DateA > DateB) {
          return -1;
        }
        return 0;
      });
    }
    if (curSort === "Earliest") {
      sortedList = sortedList.sort((a, b) => {
        const DateA = a.timestamp.getTime();
        const DateB = b.timestamp.getTime();

        if (DateA < DateB) {
          return -1;
        }
        if (DateA > DateB) {
          return 1;
        }
        return 0;
      });
    }
    setSort(event.target.value);
    if (activeTab === "Downloads") {
      setDownloadHistory([...sortedList]);
    }
    if (activeTab === "Uploads") {
      setUploadHistory([...sortedList]);
    }
    if (activeTab === "Current Downloads") {
      // setProxyHistory([...sortedList]); move somewhere else
      setDownloads([...sortedList]);
    }
  }



  //update with a stop sharing button resume sharing
  const FileCard = ({ type, name, hashId, size, price, downloaders, timestamp }) => {
    let FileIcon = LuFile; //image , folder, .pdf/.txt/everything else 
    if (type === "image") {
      FileIcon = LuFileImage;
    }
    if (type === "folder") {
      FileIcon = LuFolder;
    }

    const HandleRemoveUpload = () => {
      setFileToRemove({ name, hashId, price, downloaders, providing: isProviding[hashId] === true});
    }
    let tempSize = (size / (1024*2024)).toFixed(2);
    if(tempSize < 1){
      size = (size / (1024)).toFixed(2) + " KB";  
    }
    else{
      size = tempSize + " MB";
    }
    const isFileProviding = isProviding[hashId] === true;

    if (activeTab === "Uploads") {
      let nameForUploads = name.split('/').pop();//only need this if im storing the names locally api uses an explicit file name
      return (
        <div className="fileCard" onClick={HandleRemoveUpload} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: "center" }}> {isFileProviding ? <FileIcon style={{ width: '40%', height: '40%' }} />: <LuFileX style={{ width: '40%', height: '40%' }}/> } </div>
          <div>
            <p>{nameForUploads}</p>
            <p style={{ color: "#9b9b9b" }} >{hashId}</p>
          </div>
          <div>{size} </div>
        </div>

      );
    }
    
    
    return (
      <div className="fileCard">
        <div style={{ display: 'flex', alignItems: "center" }}><FileIcon style={{ width: '40%', height: '40%' }} /> </div>
        <div>
          <p>{name}</p>
          <p style={{ color: "#9b9b9b" }} >{hashId}</p>
        </div>
        <div> {size} <p style = {{color: "#9b9b9b"}}>{timestamp.toDateString()}</p></div>
      </div>

    );

  }
  const handlePauseAsync = async (requestId) => {
    try{
      await pauseDownloadFileRPC([{ request_id: requestId }]);
    }catch(error){}
    
  }
  const handleResumeAsync = async (requestId) => {
    try{
      await resumeDownloadFileRPC([{ request_id: requestId }])
    }catch(error){}
  }

  const FileCardDownload = ({ type, name, hashId, requestId, size, status, progress }) => {
    //Variation of file cards meant for displaying files downloading
    //additional rendering for pause, resume, and cancel buttons based on status of download
    let FileIcon = LuFile; //image , folder, .pdf/.txt/everything else 
    //OMG this is disgusting but its quick maybe I will move the cards to their own file
    const handlePause = () => {
      handlePauseAsync(requestId);
    }
    const handleResume = () => {
      handleResumeAsync(requestId);
    }


    if (type === "image") {
      FileIcon = LuFileImage;
    }
    if (type === "folder") {
      FileIcon = LuFolder;
    }
    let buttons = <></>;
    if (status === "downloading") {
      buttons = <div> <button className="primary_button" onClick={handlePause}><LuPause /></button> </div>
    }
    if (status === "paused") {
      buttons = <div> <button className="primary_button" onClick={handleResume}><LuPlay /></button> </div>
    }
    //Might need to take into account possible key confliction when rendering if lets say a person queues the same file for download again
    let progressBarColor = status === "paused" ? "#9b9b9b" : "#4CAF50";
    return (
      <div className="fileCard">
        <div style={{ display: 'flex', alignItems: "center" }}><FileIcon style={{ width: '40%', height: '40%' }} /> </div>
        <div>
          <p>{name}</p>
          <p style={{ color: "#9b9b9b" }} >{hashId}</p>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress * 100}%`, backgroundColor: progressBarColor }}
            ></div>
          </div>
        </div>
        <div> {buttons}</div>

      </div>

    );
  }

  const generateFileItems = () => {

    switch (activeTab) {
      case "Downloads":
        let i = 0;
        return downloadHistory.map(file => {
          i++;
          return (
            <FileCard
              key={i + "." + file.FileHash}
              type={file.FileMetaData.FileExtension}
              name={file.FileMetaData.FileName}
              hashId={file.FileHash}
              size={file.FileMetaData.FileSize}
              timestamp={new Date()}
            />
          )
        });


      case "Uploads":
        //FileName
        //FileSize
        //FileHash
        //^object format in the file response if we use the objets in update providing
        let k = 0;
        return uploadHistory.map(file => {
          k+=1;
          return (
            <FileCard
              key={k + "." + file.FileHash}
              type={file.FileExtension}
              name={file.FileName}
              hashId={file.FileHash}
              size={file.FileSize}
              price={file.Price}
              downloaders={null}
            />
          )
        });

      case "Current Downloads":
        let j = 0;
        return downloads.map(file => {
          j++;
          if (file.DownloadProgress !== 1) {
            return (
              <FileCardDownload
                key={j + "." + file.RequestID + file.FileHash}
                type={file.FileMetaData.FileExtension}
                name={file.FileMetaData.FileName}
                hashId={file.FileHash}
                requestId={file.RequestID}
                size={file.FileMetaData.FileSize}
                status={file.status}
                progress={file.DownloadProgress}
              />
            )
          }
          else {
            return <></>;
          }
        });
      default:
        return downloadHistory.map(file => {
          return (
            <FileCard
              key={i + "." + file.FileHash}
              type={"file.FileMetaData.FileExtension"}
              name={"file.FileMetaData.FileName"}
              hashId={file.FileHash}
              size={"file.FileMetaData.FileSize"}
              timestamp={new Date()}
            />
          )
        });
    }
  }

  return (
    <>
      <DownloadFinishedPopUp
        isOpen={downloadFinished}
        message={<>
          The file: tuna_recipes.pdf has completed downloading.<br />
          Would you like to rate this transaction?
        </>}
        onClose={handleDismissPopUp}
        onButton1Click={handleUpvote}
        onButton2Click={handleDownvote}
      />
      <div className="">
        <div className="header">
          <div id="searchContainer">

            <form id="search">

              <div id="searchWrapper">
                <label htmlFor="searchInput">
                  <GiInfo style={{ fontSize: "25px", color: "#548bca" }} onClick={handlePopUp} />

                  <input type="search" placeholder="Enter File Hash..." id="searchInput" onChange={(event) => { setSearchInput(event.target.value) }} disabled={location.pathname !== "/Files"}></input>
                </label>
                <button type="submit" id="findButton" onClick={handleSearch} disabled={location.pathname !== "/Files"}>
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {popUpOpen && <InfoPopUp handlePopUp={handlePopUp} />}
      <h1 className="text">Files</h1>

      {/* {searchResultsFound ? <FileCard key = {fileToDownload.hashId} type = {fileToDownload.type} name = {fileToDownload.name} hashId = {fileToDownload.hashId}size = {fileToDownload.size}/> : <p></p>} */}
      <TabSelectHorizontal setActiveTab={setActiveTab} activeTab={activeTab} />

      {isOpen && <FileModal setIsOpen={setIsOpen} setFileToUpload={setFileToUpload} />}
      {searchResultsFound && <DownloadModal user={user} />}
      {fileToRemove === null ? <></> : <CancelUploadModal />}
      <button className="primary_button" onClick={() => setIsOpen(true)}>Share <LuUpload /></button>
      <div className="sort-container">
        <p className="sort-label">Sort By: </p>
        <select className="sort-select" value={sort} onChange={handleSort}>
          <option value="" disabled>Select an option</option>
          <option value="A-Z">A-Z alphabetic</option>
          <option value="Z-A">Z-A reverse alphabetic</option>
          {/* {activeTab !== "Current Downloads" && <option value="Newest">Newest</option>}
            {activeTab !== "Current Downloads" && <option value="Earliest">Earliest</option>} */}
        </select>

      </div>
      <div id="fileList">
        {generateFileItems()}
      </div>
    </>
  );
};

export const InfoPopUp = ({ handlePopUp }) => {
  const menu = useRef(null);
  const outside = (e) => {
    if (menu.current && !menu.current.contains(e.target)) {
      handlePopUp();
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', outside);
  });
  return (
    <div ref={menu} className="popUp">
      <p> Enter into the search bar the Hash associated with a file to download from a provider.</p>
      <ul className="menu_list">
      </ul>
    </div>
  )
}



export default Files;