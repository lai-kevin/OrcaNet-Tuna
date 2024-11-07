import { LuFile } from "react-icons/lu";
import { useState } from "react";
// import { ipcRenderer } from 'electron';
// const { ipcRenderer } = window.electron;

//Modal Created for Sharing/Uploading a file 
const FileModal = ({ setIsOpen, setFileToUpload }) => {
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [price, setPrice] = useState("");


  //Triggered by file input selection of a file
  //^ no longer triggered by file change instead we have explicit button to trigger electron dialog doesnt trigger anymore on browser
  const handleFileChange = async () => {
    let testFile = {
      path: "C:\\Users\\Chris\\Downloads\\CSE416_ Testing Presentation.pdf",
      size: 1024
    }
    let usingElectron = true;
    if (usingElectron) {
      try {
        const chosenFile = await window.electron.ipcRenderer.invoke('open-file-dialog');
        if (chosenFile) {
          setFile(chosenFile);
        }
      } catch (error) {
        console.log('Error dialog', error);
      }
    }
    else{
      setFile(testFile)
    }


    // setFile(event.target.files[0]);
  };
  const handleClose = () => {
    setFile(null);
    setFileToUpload(null);
    setIsOpen(false)
  }
  //Triggered when user confirms they want to upload this file
  //Sets a prop (fileToUpload) from the Files.js to the file object for it to handle
  const handleSubmit = () => {
    if (Number(price) < 0) {
      setErrorMsg("Invalid Input: Please select a Price Greater than or Equal to 0.\nEx: 0.25, 5, 100 etc.")
    }
    else {
      setErrorMsg("")
      if (file === null) {
        return
      }
      // let submittedFile = new File([file], file.name, { type: file.type }) //necessary as I cant spread a file
      // submittedFile.price = Number(price);
      // submittedFile.timestamp = new Date();
      let submittedFile = {
        name: file.path,
        price: Number(price),
        timestamp: new Date(),
        size: file.size
      }
      setFileToUpload(submittedFile);
      setFile(null);
      setIsOpen(false);
    }

  };


  const handlePriceInput = (event) => {
    setPrice(event.target.value);
  }


  return (
    <div className="modal">
      <div className="modal_content">
        <input
          type="button"
          id="fileInput"
          className="file-input"
          onClick={handleFileChange}
        />
        <label htmlFor="fileInput" className="file-input-label">
          <LuFile /> {file === null ? "Choose File" : file.path}
        </label>

        {/* Below is some conditional rendering for the price input got weird when i wanted to have it be its own functional component */}
        {file !== null ? <div className="input-wrapper">
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
        {(errorMsg !== "") && <p style={{ color: "red", fontWeight: "800" }}>{errorMsg}</p>}
        <br />
        <br />
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="primary_button" onClick={handleSubmit}>Submit</button>
          <button className="primary_button" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
export default FileModal;