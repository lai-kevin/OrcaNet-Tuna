import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';
export const Mode = createContext();

export const ModeProvider = ({ children}) => {
  const {user, setUser} = useContext(AppContext);
  const [mode, setMode] = useState(user ===null ? "light" : localStorage.getItem(user.walletID));
  useEffect(() => {
    console.log(user)
    if (user) {
      setMode(localStorage.getItem(user.walletID)); 
    }
  }, [user]);
  const update = (newMode) => {
    localStorage.setItem(user.walletID, newMode);
  };
  const chooseLight = () => {
    setMode("light");
    update("light")

  };
  const chooseDark = () => {
    setMode('dark');
    update('dark')
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