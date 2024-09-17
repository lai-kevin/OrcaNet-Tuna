const FileModal = ({ setIsOpen, setFileToUpload }) => {

  const handleFileChange = (event) => {
    setFileToUpload(event.target.files[0]);
  };

  const handleSubmit = () => {
    setIsOpen(false);
  };

  return (
    <div className="modal">
      <div className="modal_content">
        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
        <input type="file" onChange={handleFileChange} />
        <button className="primary_button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
export default  FileModal;