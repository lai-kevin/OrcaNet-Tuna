import React, { useState } from "react"
const TabSelectHorizontal = ({setActiveTab, activeTab}) => {
    // const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = (tab) => {
        setActiveTab(tab)
    }


    return (
        <div className="tabs">
        <nav className="settings_bar">
          <ul>
            <li className={activeTab === 'Downloads' ? 'current' : ''}>
              <a onClick={() => handleTabChange('Downloads')} className="tab">
                Downloads
              </a>
            </li>
            <li className={activeTab === 'Uploads' ? 'current' : ''}>
              <a onClick={() => handleTabChange('Uploads')} className="tab">
                Uploads
              </a>
            </li>
            <li className={activeTab === 'Current Downloads' ? 'current' : ''}>
              <a onClick={() => handleTabChange('Current Downloads')} className="tab">
                Current Downloads
              </a>
            </li>
          </ul>
        </nav>
      </div>
      );
    };
    
export default TabSelectHorizontal;