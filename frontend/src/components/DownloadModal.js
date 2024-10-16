import { useContext } from "react";
import { AppContext } from "./AppContext";
import { LiaDownloadSolid } from "react-icons/lia";


const DownloadModal = ({}) =>{
    const {fileToDownload, setDownloadOpen, setSearchResultsFound, setFileToDownload,downloads,setDownloads} = useContext(AppContext);
    const handleClose = () => {
        setFileToDownload(null);
        
        setSearchResultsFound(false)
        setDownloadOpen(false)
      }

    const handleDownload = () => {
        let file = fileToDownload;
        file.status = "downloading"
        setDownloads([...downloads,file]);
        setFileToDownload(null);
        
        setSearchResultsFound(false);
        setDownloadOpen(false);
      }
    if(fileToDownload !== undefined && fileToDownload !== "" && fileToDownload !== null){
    return (
      <div className="modal">
        <div className="modal_content">
          <p>Would you like to download the following file?</p>
          <br/>
          <p>{fileToDownload.name}</p>
          <br/>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary_button" onClick={handleDownload}>Download <LiaDownloadSolid /></button>
            <button className="primary_button" onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    );}
    else{
    return (
        <div className="modal">
          <div className="modal_content">
            <p>We could not find the file you are looking for try searching another file using the associated Hash ID</p>
            <br/>
            <br/>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary_button" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      );
}


}; export default DownloadModal;

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