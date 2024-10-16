import { LuFile } from "react-icons/lu";
import { useState } from "react";
//Modal Created for Sharing/Uploading a file 
const FileModal = ({ setIsOpen, setFileToUpload }) => {
  const [file, setFile] = useState(null);
  //Triggered by file input selection of a file
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleClose = () => {
    setFile(null);
    setFileToUpload(null);
    setIsOpen(false)
  }
  //Triggered when user confirms they want to upload this file
  //Sets a prop (fileToUpload) from the Files.js to the file object for it to handle
  const handleSubmit = () => {
    setFileToUpload(file);
    setFile(null);
    setIsOpen(false);
  };

  return (
    <div className="modal">
      <div className="modal_content">
        <input 
          type="file" 
          id="fileInput" 
          className="file-input" 
          onChange={handleFileChange} 
        />
        <label htmlFor="fileInput" className="file-input-label">
          <LuFile/> {file === null ? "Choose File" : file.name} 
        </label>
        <br/>
        <br/>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="primary_button" onClick={handleSubmit}>Submit</button>
          <button className="primary_button" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
export default  FileModal;