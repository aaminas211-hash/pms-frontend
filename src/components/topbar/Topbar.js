// src/components/topbar/Topbar.js
import "./Topbar.css";

export default function Topbar({ 
  welcomeText = "Welcome: PMS",
  showBranchSwitch = true,
  branchInfo = "TRUSTIFYEDGE (Jaipur)",
  dateRange = "Apr 1 2023-Mar 31 2026",
  sessionInfo = "S1341 Buser Today",
  showAdminBtn = true,
  onAdminClick,
  onNotificationClick,
  onSettingsClick,
  onClipboardClick,
  onProfileClick
}) {
  
  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-welcome">{welcomeText}</h2>
      </div>
      
      <div className="topbar-right">
        {showBranchSwitch && (
          <span className="topbar-info">Switch Branch</span>
        )}
        
        <span className="topbar-info topbar-branch">{branchInfo}</span>
        
        <span className="topbar-info">{dateRange}</span>
        
        <span className="topbar-info topbar-session">
          {sessionInfo} {getCurrentDateTime()}
        </span>
        
        {showAdminBtn && (
          <button 
            className="topbar-admin-btn"
            onClick={onAdminClick}
          >
            Admin
          </button>
        )}
        
        <div className="topbar-icons">
          <button 
            className="topbar-icon-btn" 
            onClick={onNotificationClick}
            title="Notifications"
          >
            ??
          </button>
          
          <button 
            className="topbar-icon-btn"
            onClick={onSettingsClick}
            title="Settings"
          >
            ??
          </button>
          
          <button 
            className="topbar-icon-btn"
            onClick={onClipboardClick}
            title="Reports"
          >
            ??
          </button>
          
          <button 
            className="topbar-icon-btn"
            onClick={onProfileClick}
            title="Profile"
          >
            ??
          </button>
        </div>
      </div>
    </div>
  );
}