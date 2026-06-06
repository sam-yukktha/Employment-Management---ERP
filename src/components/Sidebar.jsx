import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useErpStore } from "../store/useErpStore";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { currentUser, logout: authLogout } = useAuthStore();
  const { activeRole, setActiveRole } = useErpStore();

  if (!currentUser) return null;

  // Tabs configurations
  const menuItems = [
    { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "announcements", label: "Announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "tasks", label: "Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "leaves", label: "Leave Requests", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "salary", label: "Salary Slips", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v-1M10 20h4a2 2 0 002-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2z", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "support", label: "Support Desk", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "employees", label: "Employee Directory", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", roles: ["Super Admin", "HR", "Manager", "Employee"] },
    { id: "departments", label: "Departments", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", roles: ["Super Admin"] }
  ];

  const currentRole = activeRole || currentUser?.role || "Employee";
  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-logo">
        <div className="logo-icon">▲</div>
        <div className="logo-text">
          <span>ERP SYSTEM</span>
        </div>
      </div>

      <div className="sidebar-user-card">
        <div className="avatar-placeholder">
          {currentUser.fullName.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="user-details">
          <span className="user-name">{currentUser.fullName}</span>
          {activeRole && <span className="user-role-badge">{activeRole}</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {filteredItems.map((item) => (
            <li key={item.id} className="sidebar-item">
              <button
                className={`sidebar-btn ${activeTab === item.id ? "active-tab" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <svg
                  className="sidebar-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="sidebar-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={() => {
          authLogout();
          setActiveRole("");
          navigate("/login");
        }}>
          <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
