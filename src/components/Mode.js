import React, { createContext, useState, useContext } from 'react';
export const Mode = createContext();

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const chooseMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };
  return (
    <Mode.Provider value={{mode, chooseMode }}>
       <div className={`${mode}`}>
        {children}
      </div>
    </Mode.Provider>
  );
};
export const useMode = () => {
  return useContext(Mode);
};