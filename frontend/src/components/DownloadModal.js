import { useContext, useState } from "react";
import { AppContext } from "./AppContext";
import { LiaDownloadSolid } from "react-icons/lia";
import { FaArrowDown } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { getFileRPC, uploadFileRPC } from "../RpcAPI";


const DownloadModal = () =>{
    const {fileToDownload, setDownloadOpen, setSearchResultsFound, setFileToDownload,setUploadHistory,uploadHistory,downloadTxids,setDownloadTxids} = useContext(AppContext);
    const [activeStep, setActiveStep] = useState(0); //0 is choosing a provider, 1 is the confirm 
    const [selectedProvider, setSelectedProvider] = useState("--");
    const [errorMsg,setErrorMsg] = useState("");
    const [becomeProvider, setBecomeProvider] = useState(false);
    const [price, setPrice] = useState("");

    const handlePriceInput = (event) =>{
      setPrice(event.target.value);
    }

    const handleClose = () => {
        setFileToDownload(null);
        setSelectedProvider("--");
        setActiveStep(0);
        setSearchResultsFound(false)
        setDownloadOpen(false)
        setErrorMsg("");
      }
    
    const handleDownloadState = async ()=> {
      //preemptivvely adding this here so that i can in the future have a react hook trigger after rpc call is completed
      try{
        const getFileRes  = await getFileRPC([{file_hash: selectedProvider.FileHash, peer_id: selectedProvider.PeerID }])
        const txid = getFileRes.result.txid; //will save this in the global app context wont be persistent between sessions but ok for now
        setDownloadTxids((prevTxids) => {
        const newTxids = new Set(prevTxids); // is this expensive lol i figured itd make searching faster
        newTxids.add(txid);
        return newTxids;
      });
      }catch(error){}
    
    // await uploadFileRPC([{file_path: fileToDownload.f}])
    }

    const handleDownload = () => {
      handleDownloadState();
        let file = fileToDownload;
        // if(becomeProvider){
        //   //add it to their uploads
        //   //IN PROGRESS PROVIDE A FILE POST DOWNLOAD
        //   uploadFileRPC([{file_path: "downloads/"+fileToDownload.name, price:Number(price)}]);
        //   let fileForUploads = {...file};
        //   fileForUploads.price = Number(price);
        //   fileForUploads.timestamp = new Date();
        //   // uploadFileRPC();
        //   let existingIndex = uploadHistory.findIndex(file => file.hashId === selectedProvider.FileHash); // might need to change this since i guess we want people to update their entries
 
        //   if(existingIndex != -1){
        //     setUploadHistory([...uploadHistory]);
        //   }
        //   else{
        //     setUploadHistory([...uploadHistory,fileForUploads]);
        //   }
        // }
        // file.status = "downloading";
        // file.index = downloads.length;
        // file.progress = Math.random() * (100 - 10) + 10;
        // file.priority = downloads.length + 1; //set the priority. By default is the lowest possible priority of all the ongoing downloads
        // setDownloads([...downloads,file]);
        setFileToDownload(null);
        setSelectedProvider("--");//maybe figure out if this would be nice to have somewhere else
        setActiveStep(0);        
        setSearchResultsFound(false);
        setDownloadOpen(false);
        setErrorMsg("");
        setPrice("")
    }
    const handleContinue = () =>{
      if(activeStep === 0 && selectedProvider !== "--"){
        setActiveStep(1);
        setErrorMsg("");
      }
      else{
        //modify an error msg letting the user know they must select one before continuing
        setErrorMsg("Please select a provider from the list to download from before continuing");
      }
    }
    const handleBack = () => {
      if(activeStep === 1){
        setActiveStep(0);
      }
    }

    const handleBecomeProvider = () => {
      setBecomeProvider(!becomeProvider);
    }

    //Generate the list items of providers for a given file
    //One file/ hashId could have a list of peers with the given file
    //Idea: maybe we also display here a reputation for the files so that the user can see it when they are looking thru possible file
    //Need to create a nice way of formatting dates for display and add highlighting for selected provider
    const generateListProviders = () =>{
      let i = -1; //jank solution to avoid overlapping provider ids
      if(fileToDownload)
      return fileToDownload.providers.map((provider) =>{
        i+=1;
        return(
        <tr key = {i.toString()+provider.id} onClick={()=> setSelectedProvider(provider)} style={{
          backgroundColor: (selectedProvider.id === provider.id) ? '#d3d3d3' : 'white', 
          cursor: 'pointer',
          
      }}
        className="provider-row"
      >
          <td>{provider.id}</td>
          <td>{provider.Price}</td>
          <td>{provider.MiningAddress}</td>
        </tr>
        );
      });
    }



    if(fileToDownload !== undefined && fileToDownload !== "" && fileToDownload !== null){
      if(activeStep === 0){
        if(fileToDownload.providers.length === 0){
          return(
            <div className="modal">
            <div className="modal_content">
              <p>The file you searched does not exist or there are currently no providers try another hash</p>
              <br/>              
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="primary_button" onClick={handleClose}>Close</button>
              </div>
            </div>
          </div>

          )
        }
        return (
          <div className="modal">
            <div className="modal_content">
              <p>We sucessfully found the following file: {fileToDownload.name + " " + (fileToDownload.size/ (1024 * 1024)).toFixed(2) + " MB"}</p>
              <br/>
              <p>Select a provider from the following list of providers</p>
              <br/>
              <div className="provider-table-container">
                <table id = "providers_table">
                  <thead>
                    <tr>
                      {/* <th>Status</th> */}
                      <th>File Provider</th>
                      <th>Price</th>
                      <th>Mining Address</th>
                      {/* <th>Price (OrcaCoins)</th> */}
                      {/* <th>Timestamp</th> */}
                      {/* <th>Downloads <FaArrowDown style={{color: 'red'}}/></th>                     */}
                    </tr>
                  </thead>
                  <tbody>
                    {generateListProviders()}
                  </tbody>
                </table>
                {(errorMsg!=="") && <p style={{color: "red", fontWeight: "800"}}>{errorMsg}</p>}
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="primary_button" onClick={handleContinue}>Continue</button>
                <button className="primary_button" onClick={handleClose}>Close</button>
              </div>
            </div>
          </div>
        );
      }
      else if(activeStep === 1){
        return(
        <div className="modal">
          <div className="modal_content">
            <p>Would you like to download the following file: {fileToDownload.name + " " + (fileToDownload.size/ (1024 * 1024)).toFixed(2) + " MB"}</p>
            <br/>
            <p>From: {selectedProvider.id}</p>
            <br/>
            <p>Price: {selectedProvider.Price} OrcaCoins</p>
            <br/>

            {/* <input id="ch" type="checkbox" 
              checked={becomeProvider} 
              onChange={handleBecomeProvider} style={{marginBottom: "30px"}} ></input> <label style={{fontWeight: "bold"}}>Become a provider after downloading?</label> */}
              {/* {becomeProvider === true ? <div className="input-wrapper"> */}
        {/* <label htmlFor="orcaCoinInput" className="label">Set Price For File:</label>
        <div>
          <input 
            type="number" 
            id="orcaCoinInput"
            className="input"
            placeholder="Enter price in Orca Coins"
            min="0"
            onChange={handlePriceInput}
          />
          <span className="currency-label">Orca Coins</span>
        </div>
      </div> : <></>} */}

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary_button" onClick={handleDownload}>Download <LiaDownloadSolid /></button>
              <button className="primary_button" onClick={handleBack}>Back</button>
              <button className="primary_button" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
        );

      }
  }
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



