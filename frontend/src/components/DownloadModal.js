import { useContext, useState } from "react";
import { AppContext } from "./AppContext";
import { LiaDownloadSolid } from "react-icons/lia";


const DownloadModal = ({}) =>{
    const {fileToDownload, setDownloadOpen, setSearchResultsFound, setFileToDownload,downloads,setDownloads} = useContext(AppContext);
    const [activeStep, setActiveStep] = useState(0); //0 is choosing a provider, 1 is the confirm 
    const [selectedProvider, setSelectedProvider] = useState("--");

    const handleClose = () => {
        setFileToDownload(null);
        setSelectedProvider("--");
        setActiveStep(0);
        setSearchResultsFound(false)
        setDownloadOpen(false)
      }

    const handleDownload = () => {
        let file = fileToDownload;
        file.status = "downloading"
        file.priority = downloads.length + 1; //set the priority. By default is the lowest possible priority of all the ongoing downloads
        setDownloads([...downloads,file]);
        setFileToDownload(null);
        setSelectedProvider("--");//maybe figure out if this would be nice to have somewhere else
        setActiveStep(0);        
        setSearchResultsFound(false);
        setDownloadOpen(false);
      
    }
    const handleContinue = () =>{
      if(activeStep === 0 && selectedProvider !== "--"){
        setActiveStep(1);
      }
      else{
        //modify an error msg letting the user know they must select one before continuing
      }
    }
    const handleBack = () => {
      if(activeStep === 1){
        setActiveStep(0);
      }
    }

    //Generate the list items of providers for a given file
    //One file/ hashId could have a list of peers with the given file
    //Idea: maybe we also display here a reputation for the files so that the user can see it when they are looking thru possible file
    //Need to create a nice way of formatting dates for display and add highlighting for selected provider
    const generateListProviders = () =>{
      return fileToDownload.providers.map((provider) =>{
        return(
        <tr key = {provider.id} onClick={()=> {setSelectedProvider(provider)}} style={{
          backgroundColor: (selectedProvider.id === provider.id) ? '#d3d3d3' : 'white', 
          cursor: 'pointer',
      }}
        className="provider-row"
      >
          <td>{provider.id}</td>
          <td>{provider.price}</td>
          <td>{String(provider.timestamp)}</td>
        </tr>
        );
      });
    }



    if(fileToDownload !== undefined && fileToDownload !== "" && fileToDownload !== null){
      if(activeStep === 0){
        return (
          <div className="modal">
            <div className="modal_content">
              <p>We sucessfully found the following file: {fileToDownload.name}</p>
              <br/>
              <p>Select a provider from the following list of providers</p>
              <br/>
              <div className="provider-table-container">
                <table id = "providers_table">
                  <thead>
                    <tr>
                      <th>File Provider</th>
                      <th>Price (OrcaCoins)</th>
                      <th>Timestamp</th>                    
                    </tr>
                  </thead>
                  <tbody>
                    {generateListProviders()}
                  </tbody>
                </table>
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
            <p>Would you like to download the following file: {fileToDownload.name}</p>
            <br/>
            <p>From: {selectedProvider.id}</p>
            <br/>
            <p>For: {selectedProvider.price} OrcaCoins</p>
            <br/>
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


