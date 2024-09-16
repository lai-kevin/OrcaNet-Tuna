import { LuFile } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuFileImage } from "react-icons/lu";
import {useState} from 'react';


const Files = () => {
  const [listOfFiles, setListOfFiles] = useState([]);// move to a global app context in the future?
  const [spaceUsing, setSpaceUsing] = useState(0);
  const [numOfFiles, setNumFiles] = useState(0);
  const [fileToUpload, setFileToUpload] = useState();

  const handleFileChange = (event) => {
    setFileToUpload(event.target.files[0]);
  };

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

    })

  }

    return (
      <>
        <h1 className = "text">Files</h1>
        <div className = "statistics">
          <p>{spaceUsing + " Used"}</p> 
          <p>{numOfFiles + " Files"}</p>
          <input
            type="file"
            id="fileUpload"
            onChange = {handleFileChange}
          />
        </div>
        <div id = "fileList">
          {generateFileItems()}
        </div>
      </>
    );
  };
  
  export default Files;