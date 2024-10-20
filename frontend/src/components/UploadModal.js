//Maybe merge a few of the file modals into one file and do some conditional rendering
//To minimize the number of new files in directory, prop drilling, global context references

import { useContext, useState } from "react";
import { AppContext } from "./AppContext";
import { LiaDownloadSolid } from "react-icons/lia";


const CancelUploadModal = () =>{
    const {uploadHistory,setUploadHistory,setFileToRemove, fileToRemove} = useContext(AppContext);
    const [errMsg, setErrorMsg] = useState("");
    const handleClose = () => {
        setFileToRemove(null);
        setErrorMsg("");
    }

    const handleRemove = () => {
      if(!fileToRemove.downloaders){
        const updatedDownloads = uploadHistory.filter((upload) => upload.hashId !== fileToRemove.hashId);
        setUploadHistory([...updatedDownloads]);
        setFileToRemove(null);
      }
      else{
        setErrorMsg("The file you wish to stop serving is currently being downloaded by " + fileToRemove.downloaders.length + " users.")
      }
    }
    return (
      <div className="modal">
        <div className="modal_content">
          <p>Would you like to stop serving the following file?</p>
          <br/>
          <p>{fileToRemove.name}</p>
          <p>{"hash ID: " + fileToRemove.hashId}</p>
          <p>{"Price: " + fileToRemove.price + " OrcaCoin"}</p>
          {errMsg &&  <div style={{color: "red", fontWeight: "800"}}><p>{errMsg}</p> <p>All transactions related to the above file must be complete prior to removal.</p></div>}
          <br/>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary_button" onClick={handleRemove}>Stop Sharing</button>
            <button className="primary_button" onClick={handleClose}>Cancel</button>
          </div>
        </div>
      </div>
    );

}; export default CancelUploadModal;

//enable denable yourself as a proxy (register urself on the dht) nodeid; ip; price
//set price for being a proxy on UI

//List of users who have themselves as proxy enabled

//open port to listen to http proxy requests

//

// 3rd layer execute request save and return to og user


//Some things i want to do

//move uploads to global context

//add the modal to download a file


//OPen a modal with the file to download asking would you like to download this file?
//Then send the user to the files page and set the tab to downloads tab
//There the cards will be different have information pause resume etc


//set the thing to "" string also set the search bar to that


//Work on modal then do the file list