import { LuFile } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuFileImage } from "react-icons/lu";
import { useState } from 'react';
import FileModal from "./FileModal"

const Files = () => {
  let sampleData = [{type: "image",name: "Screenshot 2025-02-18 211342",hashId: "zxcasd2lajnf5aoiuanfna1kjzx",size: "1MB"},
    {type: "image",name: "my_social_security_number.png",hashId: "as13dncx,jvkbvskh4sf",size: "1GB"},
    {type: "pdf",name: "tuna_recipes.pdf",hashId: "hashId",size: "124KB"},
    {type: "folder",name: "homework",hashId: "ascn123kcbxvh14boadab",size: "1TB"},
    {type: "mp3",name: "Lo_Siento_BB:/.mp3",hashId: "zxc5nksdhbvshba2315jhd",size: "124MB"},
    {type: "text",name: "lyrics_for_my_next_mixtape.txt",hashId: "as1dzxc1239zxczvsfsfsd",size: "1MB"},
    {type: "folder",name: "node_modules",hashId: "12zxaweqr3zc25zca;/';45",size: "50GB"}
  ];

  const [listOfFiles, setListOfFiles] = useState(sampleData);// move to a global app context in the future?
  const [spaceUsing, setSpaceUsing] = useState(0);
  const [numOfFiles, setNumFiles] = useState(0);
  const [fileToUpload, setFileToUpload] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("");

  const handleSort = (event) => {
    setSort(event.target.value);
    let sortedList = listOfFiles;
    if (sort === "A-Z"){
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
    if(sort === "Z-A"){
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

    setListOfFiles([...sortedList]);
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
    return listOfFiles.map(file =>{
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

    return (
      <>
        <h1 className = "text">Files</h1>
        
        <div className = "statistics">
          <p>{spaceUsing} <span>{" Used"}</span> </p> 
          <p>{numOfFiles} <span>{" Files"}</span></p>
          <button className="primary_button" onClick={() => setIsOpen(true)}>Upload</button>
        </div>

        <div>
          <p>Sort By</p>
          <select value={sort} onChange={handleSort}>
            <option value="" disabled>Select an option</option>
            <option value="A-Z">A-Z alphabetic</option>
            <option value="Z-A">Z-A reverse alphabetic</option>
            {/* <option value="Date"> Chronological Date</option> */}
          </select>
        </div>
        
        {isOpen && <FileModal setIsOpen={setIsOpen} setFileToUpload={setFileToUpload}/>}
        <div id = "fileList">
          {generateFileItems()}
        </div>
      </>
    );
  };
  
  export default Files;