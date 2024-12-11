import React, { useState } from 'react';
import AccountContent from './AccountContent';
import ConfigContent from './ConfigContent';
import { useMode } from './Mode';
import ReputationSystem from './ReputationContent';

const Settings = () => {
  const [current, setCurrent] = useState('account'); 
  const { user, mode, chooseLight, chooseDark} = useMode();
  const handleTabChange = (page) => {
    setCurrent(page);
  };
  return (
    <div className="settings">
      <h1 className="text">Account</h1>
      <div className="tabs">
        <nav className="settings_bar">
          <ul>
            <li className={current === 'account' ? 'current' : ''}>
              <a onClick={() => handleTabChange('account')} className="tab">
                Wallet Info
              </a>
            </li>
            <li className={current === 'config' ? 'current' : ''}>
              <a onClick={() => handleTabChange('config')} className="tab">
                Configurations
              </a>
            </li>
            <li className={current === 'reputation' ? 'current' : ''}>
              <a onClick={() => handleTabChange('reputation')} className="tab">
                Reputation
              </a>
            </li>

          </ul>
        </nav>
      </div>
      <div className="bottom_content">
        {current === 'account' && <AccountContent user={user} mode={mode}/>}
        {current === 'config' && <ConfigContent mode = {mode} chooseLight={chooseLight} chooseDark={chooseDark}/>}
        {current === 'reputation' && <ReputationSystem/>}
      </div>
    </div>
  );
};

export default Settings;
