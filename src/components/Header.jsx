import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useErpStore } from "../store/useErpStore";
import CustomSelect from "./CustomSelect";

const Header = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuthStore();
  const { activeRole, setActiveRole } = useErpStore();
  const [theme, setTheme] = useState(document.documentElement.classList.contains("light-mode") ? "light" : "dark");

  const rolesList = ["Employee", "Manager", "HR", "Super Admin"];

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("erp_theme", "light");
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("erp_theme", "dark");
    }
  };

  // Sync theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("erp_theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-mode");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light-mode");
      setTheme("dark");
    }
  }, []);

  const formatTabTitle = (tab) => {
    if (!tab) return "";
    return tab
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <header className="header-container glass-panel">
      <div className="header-left">
        <h1 className="header-title">{formatTabTitle(activeTab)}</h1>
      </div>

      <div className="header-actions">
        {/* Role Switcher (Helper for development/demonstration) */}
        <div className="role-switcher-container">
          <span className="switcher-label">
            Role:
          </span>
          <CustomSelect
            value={activeRole || ""}
            onChange={(e) => setActiveRole(e.target.value)}
            options={rolesList.map((role) => ({ value: role, label: role }))}
            placeholder="Select Role"
            className="role-select-custom"
          />
        </div>

        {/* Theme Toggler */}
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle dark/light theme"
        >
          {theme === "dark" ? (
            // Sun Icon (Light Mode trigger)
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="icon-theme">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            // Moon Icon (Dark Mode trigger)
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="icon-theme">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Mini Info */}
        <div 
          className="user-profile-badge" 
          onClick={() => setActiveTab && setActiveTab("profile")} 
          style={{ cursor: "pointer" }}
        >
          <div className="avatar-mini">
            {currentUser?.fullName.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="user-info-text">
            <span className="user-name-mini">{currentUser?.fullName}</span>
            <span className="user-email-mini">{currentUser?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
