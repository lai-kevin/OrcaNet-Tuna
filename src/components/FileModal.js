import { LuFile } from "react-icons/lu";
import { useState } from "react";
const FileModal = ({ setIsOpen, setFileToUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleClose = () => {
    setFile(null);
    setFileToUpload(null);
    setIsOpen(false)
  }

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
        <div>
          <button className="primary_button" onClick={handleClose}>Close</button>
          <button className="primary_button" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}
export default  FileModal;