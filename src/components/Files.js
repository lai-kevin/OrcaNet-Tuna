import { LuFile } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuFileImage } from "react-icons/lu";
import { useContext, useEffect, useState } from 'react';
import FileModal from "./FileModal";
import TabSelectHorizontal from "./Tabs";
import { LuUpload } from "react-icons/lu";
import { AppContext } from "./AppContext";
const bip39 = require('bip39');
const { HDKey } = require('ethereum-cryptography/hdkey');


const Files = () => {
  let sampleData = [{type: "image",name: "Screenshot 2025-02-18 211342",hashId: "zxcasd2lajnf5aoiuanfna1kjzx",size: "1MB"},
    {type: "image",name: "my_social_security_number.png",hashId: "as13dncx,jvkbvskh4sf",size: "1GB"},
    {type: "pdf",name: "tuna_recipes.pdf",hashId: "hashId",size: "124KB"},
    {type: "folder",name: "homework",hashId: "ascn123kcbxvh14boadab",size: "1TB"},
    {type: "mp3",name: "Lo_Siento_BB:/.mp3",hashId: "zxc5nksdhbvshba2315jhd",size: "124MB"},
    {type: "text",name: "lyrics_for_my_next_mixtape.txt",hashId: "as1dzxc1239zxczvsfsfsd",size: "1MB"},
    {type: "folder",name: "node_modules",hashId: "12zxaweqr3zc25zca;/';45",size: "50GB"}
  ];

  const {searchResultsFound,fileToDownload} = useContext(AppContext);
  const [downloadHistory, setDownloadHistory] = useState(sampleData);// move to a global app context in the future?
  const [uploadHistory, setUploadHistory] = useState([]);
  const [proxyHistory, setProxyHistory] = useState([]);

  const [spaceUsing, setSpaceUsing] = useState(0); // file space
  const [numOfFiles, setNumFiles] = useState(0); // num of files
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("");
  const [activeTab, setActiveTab] = useState("Downloads");

  useEffect(()=>{
    if(fileToUpload != null){
      const phrase = bip39.generateMnemonic(128);
      const seed = bip39.mnemonicToSeedSync(phrase);
      const childKey = HDKey.fromMasterSeed(seed).derive("m/44'/0'/0'");
      const privateKey = Array.from(childKey.privateKey).map(byte => byte.toString(16).padStart(2, '0')).join('');
    let newFile = {
      type: "file",
      name: fileToUpload.name,
      hashId: privateKey,
      size: (fileToUpload.size / (1024 * 1024)).toFixed(2) + " MB"
    } 
      setUploadHistory([...uploadHistory,newFile]);
      setFileToUpload(null);
    }

  },[fileToUpload]);

  const handleSort = (event) => {
    let curSort = event.target.value;
    
    let sortedList;
    if(activeTab === "Downloads"){
      sortedList = downloadHistory;
    }
    if(activeTab === "Uploads"){
      sortedList = uploadHistory;
    }
    if(activeTab === "Proxy History"){
      sortedList = proxyHistory;
    }
    if (curSort === "A-Z"){
      sortedList = sortedList.sort((a, b) =>{
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
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
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
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
    setSort(event.target.value);
    if(activeTab === "Downloads"){
      setDownloadHistory([...sortedList]);
    }
    if(activeTab === "Uploads"){
      setUploadHistory([...sortedList]);
    }
    if(activeTab === "Proxy History"){
      setProxyHistory([...sortedList]);
    }
  }


  const FileCard = ({type,name,hashId,size}) => {
    let FileIcon = LuFile; //image , folder, .pdf/.txt/everything else 
    if(type === "image"){ 
      FileIcon = LuFileImage;
    }
    if(type === "folder"){
      FileIcon = LuFolder;
    }

    return(
      <div className = "fileCard">
        <div style = {{display: 'flex', alignItems: "center"}}><FileIcon style={{ width: '40%', height: '40%' }}/> </div>
        <div>
          <p>{name}</p>
          <p style = {{color: "#9b9b9b"}} >{hashId}</p>
        </div>
        <div>{size}</div>
      </div>

    );

  }

  const generateFileItems = () =>{

    switch(activeTab){
      case "Downloads":
        return downloadHistory.map(file =>{
          return(
            <FileCard
              key = {file.hashId}
              type = {file.type}
              name = {file.name}
              hashId = {file.hashId}
              size = {file.size}
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
            />
          )
        });

      case "Proxy History":
        return proxyHistory.map(file =>{
          return(
            <FileCard
              key = {file.hashId}
              type = {file.type}
              name = {file.name}
              hashId = {file.hashId}
              size = {file.size}
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
            />
          )
        });
    }    
  }

    return (
      <>
        <h1 className = "text">Files</h1>
        {/* {searchResultsFound ? <FileCard key = {fileToDownload.hashId} type = {fileToDownload.type} name = {fileToDownload.name} hashId = {fileToDownload.hashId}size = {fileToDownload.size}/> : <p></p>} */}
        <TabSelectHorizontal  setActiveTab = {setActiveTab} activeTab={activeTab}/>
        
        {isOpen && <FileModal setIsOpen={setIsOpen} setFileToUpload={setFileToUpload}/>}
        <button className="primary_button" onClick={() => setIsOpen(true)}>Upload <LuUpload /></button>
        <div className= "sort-container">
          <p className="sort-label">Sort By: </p>
          <select className="sort-select" value={sort} onChange={handleSort}>
            <option value="" disabled>Select an option</option>
            <option value="A-Z">A-Z alphabetic</option>
            <option value="Z-A">Z-A reverse alphabetic</option>
          </select>
          
        </div>
        <div id = "fileList">
          {generateFileItems()}
        </div>
      </>
    );
  };


        
  
  export default Files;