import React from 'react';
import { FaRegThumbsUp } from "react-icons/fa";
import { FaRegThumbsDown } from "react-icons/fa";



const DownloadFinishedPopUp = ({ isOpen, message, onClose, onButton1Click, onButton2Click }) => {
  if (!isOpen) return null;

  return (
    <div className="bottom-right-popup">
      <button className="close-btn" onClick={onClose}>×</button>
      <p>{message}</p>
      <div className="button-container">
        <button className = "primary_button" onClick={onButton1Click}><FaRegThumbsUp/></button>
        <button className='primary_button' onClick={onButton2Click}><FaRegThumbsDown/></button>
      </div>
    </div>
  );
};

export default DownloadFinishedPopUp;