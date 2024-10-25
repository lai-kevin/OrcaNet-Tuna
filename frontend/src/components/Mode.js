import React, { createContext, useState, useContext, useEffect } from 'react';
export const Mode = createContext();

export const ModeProvider = ({ children, user, setUser}) => {
  const [mode, setMode] = useState(user ===null ? "light" : user.mode);
  if(user!==null){
  console.log(user.mode);
  }
  useEffect(() => {

    if (user) {
      setMode(user.mode); 
    }
  }, [user]);
  const update = (newMode) => {
    const prevData = JSON.parse(localStorage.getItem(user.privateKey));

    const updated = {
      ...prevData,
      mode: newMode
    };

    localStorage.setItem(user.privateKey, JSON.stringify(updated));
    setUser((prevUser) => ({
      ...prevUser,
      mode: newMode,
    }));
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