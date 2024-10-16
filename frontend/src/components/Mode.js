import React, { createContext, useState, useContext } from 'react';
export const Mode = createContext();

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const chooseLight = () => {
    setMode("light")
  };
  const chooseDark = () => {
    setMode('dark');
  };
  return (
    <Mode.Provider value={{mode, chooseLight, chooseDark}}>
       <div className={`${mode}`}>
        {children}
      </div>
    </Mode.Provider>
  );
};
export const useMode = () => {
  return useContext(Mode);
};