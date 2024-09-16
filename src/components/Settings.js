import React, { useState } from 'react';
import AccountContent from './AccountContent';
import ConfigContent from './ConfigContent';

const Settings = () => {
  const [current, setCurrent] = useState('account'); 

  const handleTabChange = (page) => {
    setCurrent(page);
  };

  return (
    <div className="settings">
      <h1 className="text">Settings</h1>
      <div className="tabs">
        <nav className="settings_bar">
          <ul>
            <li className={current === 'account' ? 'current' : ''}>
              <a onClick={() => handleTabChange('account')} className="tab">
                Account
              </a>
            </li>
            <li className={current === 'config' ? 'current' : ''}>
              <a onClick={() => handleTabChange('config')} className="tab">
                Configurations
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="bottom_content">
        {current === 'account' && <AccountContent />}
        {current === 'config' && <ConfigContent />}
      </div>
    </div>
  );
};

export default Settings;
