import { useContext, useState } from "react";
import { AppContext } from "./AppContext";
import { LiaDownloadSolid } from "react-icons/lia";
import { FaArrowDown } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";


const DownloadModal = ({user}) =>{
    const {fileToDownload, setDownloadOpen, setSearchResultsFound, setFileToDownload,downloads,setDownloads,setUploadHistory,uploadHistory,dummyFiles,setDummyFiles} = useContext(AppContext);
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

    const handleDownload = () => {
        let file = fileToDownload;
        if(becomeProvider){
          //add it to their uploads
          let fileForUploads = {...file};
          fileForUploads.price = Number(price);
          let alreadyAdded = 0;
          const updatedDummyFiles = dummyFiles.map(file => {
            if (file.hashId === fileForUploads.hashId) {
              const existingUserProviderIndex = file.providers.findIndex(provider => provider.id === user.walletID);
              
              if (existingUserProviderIndex !== -1) {
                // Update existing provider 
                alreadyAdded = 1;
                const updatedProviders = [...file.providers];
                updatedProviders[existingUserProviderIndex] = {
                  ...updatedProviders[existingUserProviderIndex],
                  price: Number(price),
                  timestamp: new Date(),
                  status: "online"
                  // Not going to reset the download count we will count it as a reregister
                };
                
                return {
                  ...file,
                  providers: updatedProviders
                };
              } else {
                // Add new provider // the current user
                return {
                  ...file,
                  providers: [
                    ...file.providers,
                    {
                      id: user.walletID,
                      price: Number(price),
                      timestamp: new Date(),
                      downloads: 0,
                      status: "online"
                    }
                  ]
                };
              }
            }
            return file;
          });
          setDummyFiles([...updatedDummyFiles]);
          if(alreadyAdded == 1){
            setUploadHistory([...uploadHistory]);
          }
          else{
            setUploadHistory([...uploadHistory,fileForUploads]);
          }
        }
        file.status = "downloading";
        file.index = downloads.length;
        file.progress = Math.random() * (100 - 10) + 10;
        file.priority = downloads.length + 1; //set the priority. By default is the lowest possible priority of all the ongoing downloads
        setDownloads([...downloads,file]);
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
      return fileToDownload.providers.map((provider) =>{
        return(
        <tr key = {provider.id} onClick={()=> provider.status !== "offline" && setSelectedProvider(provider)} style={{
          backgroundColor: (selectedProvider.id === provider.id) ? '#d3d3d3' : 'white', 
          cursor: provider.status === "offline" ? 'not-allowed' : 'pointer',
          opacity: provider.status === "offline" ? 0.5 : 1
          
      }}
        className="provider-row"
      >
          <td>{(provider.status === "online") ? <FaCircle style={{color: "green"}} /> : <FaCircle style={{color: "red"}}/>}</td>
          <td>{provider.id}</td>
          <td>{provider.price}</td>
          <td>{String(provider.timestamp)}</td>
          <td>{provider.downloads}</td>
        </tr>
        );
      });
    }



    if(fileToDownload !== undefined && fileToDownload !== "" && fileToDownload !== null){
      if(activeStep === 0){
        return (
          <div className="modal">
            <div className="modal_content">
              <p>We sucessfully found the following file: {fileToDownload.name + " " + fileToDownload.size}</p>
              <br/>
              <p>Select a provider from the following list of providers</p>
              <br/>
              <div className="provider-table-container">
                <table id = "providers_table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>File Provider</th>
                      <th>Price (OrcaCoins)</th>
                      <th>Timestamp</th>
                      <th>Downloads <FaArrowDown style={{color: 'red'}}/></th>                    
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
            <p>Would you like to download the following file: {fileToDownload.name + " " + fileToDownload.size}</p>
            <br/>
            <p>From: {selectedProvider.id}</p>
            <br/>
            <p>Price: {selectedProvider.price} OrcaCoins</p>
            <br/>

            <input id="ch" type="checkbox" 
              checked={becomeProvider} 
              onChange={handleBecomeProvider} style={{marginBottom: "30px"}} ></input> <label style={{fontWeight: "bold"}}>Become a provider after downloading?</label>
              {becomeProvider === true ? <div className="input-wrapper">
        <label htmlFor="orcaCoinInput" className="label">Set Price For File:</label>
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
      </div> : <></>}

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


