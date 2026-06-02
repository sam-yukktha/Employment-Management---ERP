import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useErpStore } from "../../store/useErpStore";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const Dashboard = () => {
  const { currentUser } = useAuthStore();
  const {
    activeRole,
    employees,
    departments,
    announcements,
    tasks,
    leaves,
    tickets,
    addAnnouncement,
    deleteAnnouncement,
    addTask,
    updateTaskStatus,
    deleteTask,
    applyLeave,
    updateLeaveStatus,
    createTicket,
    updateTicketStatus,
    addEmployee,
    updateEmployeeProfile,
    deleteEmployee,
    addDepartment,
    deleteDepartment
  } = useErpStore();

  const [activeTab, setActiveTab] = useState("overview");

  // Note: Route protection is handled by ProtectedRoute wrapper in AppRoutes

  // Modals visibility state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipMonth, setSelectedPayslipMonth] = useState("");
  const [selectedEmployeeForSlip, setSelectedEmployeeForSlip] = useState(null);

  // Form states
  const [newEmpForm, setNewEmpForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    designation: "",
    department: "",
    pan: "",
    aadharNumber: "",
    dob: "",
    doj: "",
    role: "Employee",
    baseSalary: 50000,
    allowances: 10000,
    deductions: 4000
  });

  const [newDeptForm, setNewDeptForm] = useState({ name: "", head: "" });
  const [newAnnForm, setNewAnnForm] = useState({ title: "", content: "", category: "General" });
  const [newTaskForm, setNewTaskForm] = useState({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
  const [newLeaveForm, setNewLeaveForm] = useState({ type: "Annual Leave", startDate: "", endDate: "", reason: "" });
  const [newTicketForm, setNewTicketForm] = useState({ category: "IT Support", title: "", description: "", priority: "Medium" });
  const [profileEditForm, setProfileEditForm] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit employee state (for HR directory edits)
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editEmpForm, setEditEmpForm] = useState({});

  if (!currentUser) return null;

  // Sync profile form when tab changes or editing starts
  const startProfileEditing = () => {
    setProfileEditForm({
      fullName: currentUser.fullName,
      phoneNumber: currentUser.phoneNumber,
      dob: currentUser.dob || "",
      pan: currentUser.pan || "",
      aadharNumber: currentUser.aadharNumber || "",
      resume: currentUser.resume || ""
    });
    setIsEditingProfile(true);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateEmployeeProfile(currentUser.id, profileEditForm);
    setIsEditingProfile(false);
  };

  // Helper to generate months for payslips
  const payslipMonths = [
    { name: "May 2026", base: 1.0 },
    { name: "April 2026", base: 1.0 },
    { name: "March 2026", base: 1.0 },
    { name: "February 2026", base: 1.0 }
  ];

  // ==========================================
  // RENDER: OVERVIEW TAB
  // ==========================================
  const renderOverview = () => {
    const totalEmployees = employees.length;
    const totalDepts = departments.length;
    
    // Task count
    const activeTasks = tasks.filter(t => t.status !== "Completed");
    const myTasks = tasks.filter(t => t.assignedTo === currentUser.id && t.status !== "Completed");
    const myCompletedTasks = tasks.filter(t => t.assignedTo === currentUser.id && t.status === "Completed");

    // Leave requests
    const pendingLeaves = leaves.filter(l => l.status === "Pending");
    const myLeaves = leaves.filter(l => l.employeeId === currentUser.id);

    // Support ticket count
    const pendingTickets = tickets.filter(t => t.status !== "Resolved");
    const myTickets = tickets.filter(t => t.employeeId === currentUser.id);

    const latestAnnouncements = announcements.slice(0, 2);

    return (
      <div className="overview-tab fade-in">
        <div className="stats-grid">
          {activeRole === "Super Admin" || activeRole === "HR" || activeRole === "Manager" ? (
            <>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper success-glow">👤</div>
                <div className="stat-content">
                  <h3>Total Employees</h3>
                  <p className="stat-number">{totalEmployees}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper info-glow">🏢</div>
                <div className="stat-content">
                  <h3>Departments</h3>
                  <p className="stat-number">{totalDepts}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper warning-glow">📋</div>
                <div className="stat-content">
                  <h3>Active Team Tasks</h3>
                  <p className="stat-number">{activeTasks.length}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper danger-glow">✉</div>
                <div className="stat-content">
                  <h3>Pending Leaves</h3>
                  <p className="stat-number">{pendingLeaves.length}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper warning-glow">📋</div>
                <div className="stat-content">
                  <h3>My Pending Tasks</h3>
                  <p className="stat-number">{myTasks.length}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper success-glow">✓</div>
                <div className="stat-content">
                  <h3>Completed Tasks</h3>
                  <p className="stat-number">{myCompletedTasks.length}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper info-glow">✉</div>
                <div className="stat-content">
                  <h3>My Leave Requests</h3>
                  <p className="stat-number">{myLeaves.length}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon-wrapper danger-glow">⚙</div>
                <div className="stat-content">
                  <h3>Support Tickets</h3>
                  <p className="stat-number">{myTickets.length}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="overview-split-layout">
          {/* Recent Announcements */}
          <div className="glass-card split-panel">
            <div className="panel-header">
              <h2>Recent Announcements</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("announcements")}>View All</button>
            </div>
            <div className="panel-body">
              {latestAnnouncements.length > 0 ? (
                <div className="overview-announcements-list">
                  {latestAnnouncements.map(ann => (
                    <div key={ann.id} className="ann-item-mini">
                      <div className="ann-item-header">
                        <span className={`badge ${ann.category === "Policy" ? "badge-danger" : ann.category === "Event" ? "badge-success" : "badge-info"}`}>{ann.category}</span>
                        <span className="ann-date">{ann.date}</span>
                      </div>
                      <h4>{ann.title}</h4>
                      <p>{ann.content.slice(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No announcements posted yet.</p>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-card split-panel">
            <div className="panel-header">
              <h2>Quick Tasks</h2>
            </div>
            <div className="panel-body quick-actions-grid">
              <button className="btn btn-secondary action-card" onClick={() => setActiveTab("profile")}>
                <span className="action-icon">👤</span>
                <span className="action-title">My Profile</span>
                <span className="action-desc">Check employment details</span>
              </button>

              <button className="btn btn-secondary action-card" onClick={() => setActiveTab("leaves")}>
                <span className="action-icon">✉</span>
                <span className="action-title">Request Leave</span>
                <span className="action-desc">Submit time-off request</span>
              </button>

              <button className="btn btn-secondary action-card" onClick={() => setActiveTab("salary")}>
                <span className="action-icon">₹</span>
                <span className="action-title">Salary Slips</span>
                <span className="action-desc">Print current payslips</span>
              </button>

              <button className="btn btn-secondary action-card" onClick={() => setActiveTab("support")}>
                <span className="action-icon">⚙</span>
                <span className="action-title">Get Support</span>
                <span className="action-desc">Raise an IT/HR ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: PROFILE TAB
  // ==========================================
  const renderProfile = () => {
    const pUser = currentUser; // Display logged in user details

    return (
      <div className="profile-tab glass-card fade-in">
        <div className="profile-header-area">
          <div className="profile-avatar">
            {pUser.fullName.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="profile-title-block">
            <h2>{pUser.fullName}</h2>
            <span className="badge badge-info">{pUser.designation}</span>
            <span className="profile-dept-text">{pUser.department}</span>
          </div>
          {!isEditingProfile && (
            <button className="btn btn-primary" onClick={startProfileEditing}>Edit Profile</button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSave} className="profile-edit-form">
            <div className="grid-2-col">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileEditForm.fullName || ""}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, fullName: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={profileEditForm.phoneNumber || ""}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, phoneNumber: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={profileEditForm.dob || ""}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, dob: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>PAN Card Number</label>
                <input
                  type="text"
                  value={profileEditForm.pan || ""}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, pan: e.target.value.toUpperCase() })}
                  className="form-control"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  value={profileEditForm.aadharNumber || ""}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, aadharNumber: e.target.value })}
                  className="form-control"
                  placeholder="0000-0000-0000"
                />
              </div>
              <div className="form-group">
                <label>Resume (Simulate Upload)</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileEditForm({ ...profileEditForm, resume: file.name });
                      }
                    }}
                    className="form-control"
                  />
                  {profileEditForm.resume && <span className="uploaded-file-label">Selected: {profileEditForm.resume}</span>}
                </div>
              </div>
            </div>

            <div className="profile-form-buttons">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-details-grid">
            <div className="profile-section">
              <h3>Personal Details</h3>
              <div className="detail-item">
                <span className="label">Date of Birth:</span>
                <span className="val">{pUser.dob || "Not Provided"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="val">{pUser.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="val">{pUser.email}</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Compliance Details</h3>
              <div className="detail-item">
                <span className="label">PAN ID:</span>
                <span className="val">{pUser.pan || "Not Provided"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Aadhaar ID:</span>
                <span className="val">{pUser.aadharNumber || "Not Provided"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Attached Resume:</span>
                <span className="val">
                  {pUser.resume ? (
                    <a href="#" className="resume-link" onClick={(e) => { e.preventDefault(); alert(`Downloading simulated file: ${pUser.resume}`); }}>
                      📥 {pUser.resume}
                    </a>
                  ) : "None Attached"}
                </span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Job Details</h3>
              <div className="detail-item">
                <span className="label">Employee ID:</span>
                <span className="val">{pUser.employeeId}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date of Joining:</span>
                <span className="val">{pUser.doj}</span>
              </div>
              <div className="detail-item">
                <span className="label">Designation:</span>
                <span className="val">{pUser.designation}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER: ANNOUNCEMENTS TAB
  // ==========================================
  const renderAnnouncements = () => {
    const canPublish = activeRole === "Super Admin" || activeRole === "HR";

    const handleAnnSubmit = (e) => {
      e.preventDefault();
      if (!newAnnForm.title || !newAnnForm.content) return;
      addAnnouncement(newAnnForm.title, newAnnForm.content, newAnnForm.category);
      setNewAnnForm({ title: "", content: "", category: "General" });
    };

    return (
      <div className="announcements-tab fade-in">
        {canPublish && (
          <div className="glass-card form-panel" style={{ marginBottom: "24px" }}>
            <h2>Publish New Announcement</h2>
            <form onSubmit={handleAnnSubmit} className="horizontal-form-grid">
              <div className="form-group">
                <label>Notice Title</label>
                <input
                  type="text"
                  placeholder="Important update regarding..."
                  value={newAnnForm.title}
                  onChange={(e) => setNewAnnForm({ ...newAnnForm, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newAnnForm.category}
                  onChange={(e) => setNewAnnForm({ ...newAnnForm, category: e.target.value })}
                  className="form-control"
                >
                  <option value="General">General Notice</option>
                  <option value="Policy">Company Policy</option>
                  <option value="Event">Corporate Event</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Message Content</label>
                <textarea
                  rows="3"
                  placeholder="Enter details here..."
                  value={newAnnForm.content}
                  onChange={(e) => setNewAnnForm({ ...newAnnForm, content: e.target.value })}
                  className="form-control"
                  required
                ></textarea>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="btn btn-primary">Publish Notice</button>
              </div>
            </form>
          </div>
        )}

        <div className="announcements-grid">
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <div key={ann.id} className="glass-card announcement-card">
                <div className="ann-card-header">
                  <span className={`badge ${ann.category === "Policy" ? "badge-danger" : ann.category === "Event" ? "badge-success" : "badge-info"}`}>{ann.category}</span>
                  <span className="ann-date">{ann.date}</span>
                </div>
                <h2>{ann.title}</h2>
                <p>{ann.content}</p>
                <div className="ann-card-footer">
                  <span className="ann-author">Posted by: {ann.author}</span>
                  {canPublish && (
                    <button className="btn btn-danger btn-sm" onClick={() => deleteAnnouncement(ann.id)}>Delete</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted" style={{ gridColumn: "1/-1" }}>No announcements available.</p>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: TASKS TAB
  // ==========================================
  const renderTasks = () => {
    const isManager = activeRole === "Manager" || activeRole === "Super Admin";
    const myTaskList = tasks.filter(t => t.assignedTo === currentUser.id);

    const handleTaskSubmit = (e) => {
      e.preventDefault();
      if (!newTaskForm.title || !newTaskForm.assignedTo) return;
      addTask(newTaskForm);
      setNewTaskForm({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
    };

    return (
      <div className="tasks-tab fade-in">
        {isManager && (
          <div className="glass-card form-panel" style={{ marginBottom: "24px" }}>
            <h2>Assign New Task</h2>
            <form onSubmit={handleTaskSubmit} className="horizontal-form-grid">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Task short title..."
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={newTaskForm.assignedTo}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                  className="form-control"
                  required
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                  className="form-control"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Task Description</label>
                <textarea
                  rows="2"
                  placeholder="Details of what needs to be done..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="btn btn-primary">Assign Task</button>
              </div>
            </form>
          </div>
        )}

        <div className="tasks-split">
          {/* Left Panel: All assigned tasks status dashboard (For Managers/Admin) */}
          {isManager && (
            <div className="glass-card table-panel" style={{ flex: 2 }}>
              <h2>All Assigned Team Tasks</h2>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Info</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          <div className="text-muted-small">{task.description}</div>
                        </td>
                        <td>{task.assignedToName}</td>
                        <td>{task.dueDate}</td>
                        <td>
                          <span className={`badge ${task.priority === "High" ? "badge-danger" : task.priority === "Medium" ? "badge-warning" : "badge-info"}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${task.status === "Completed" ? "badge-success" : task.status === "In Progress" ? "badge-info" : "badge-warning"}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Right Panel: My Task List (For Employees / Self-view) */}
          <div className="glass-card checklist-panel" style={{ flex: 1 }}>
            <h2>My Dashboard Checklist</h2>
            <div className="todo-list-wrapper">
              {myTaskList.length > 0 ? (
                myTaskList.map(task => (
                  <div key={task.id} className="todo-item-card">
                    <div className="todo-item-header">
                      <span className={`badge ${task.priority === "High" ? "badge-danger" : "badge-warning"}`}>{task.priority}</span>
                      <span className="todo-date">Due: {task.dueDate}</span>
                    </div>
                    <h3>{task.title}</h3>
                    <p className="todo-desc">{task.description}</p>
                    
                    <div className="todo-actions-row">
                      <span className="status-label">Status: <strong>{task.status}</strong></span>
                      <div className="todo-buttons">
                        {task.status === "Assigned" && (
                          <button className="btn btn-secondary btn-sm" onClick={() => updateTaskStatus(task.id, "In Progress")}>Start Work</button>
                        )}
                        {task.status === "In Progress" && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateTaskStatus(task.id, "Completed")}>Mark Complete</button>
                        )}
                        {task.status === "Completed" && (
                          <span className="task-success-check">✓ Finished</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">You have no tasks assigned currently.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: LEAVE REQUESTS TAB
  // ==========================================
  const renderLeaves = () => {
    const isApprover = activeRole === "HR" || activeRole === "Manager" || activeRole === "Super Admin";
    const myLeaveHistory = leaves.filter(l => l.employeeId === currentUser.id);

    const handleLeaveSubmit = (e) => {
      e.preventDefault();
      if (!newLeaveForm.startDate || !newLeaveForm.endDate) return;
      applyLeave(newLeaveForm);
      setNewLeaveForm({ type: "Annual Leave", startDate: "", endDate: "", reason: "" });
      alert("Leave request submitted successfully.");
    };

    return (
      <div className="leaves-tab fade-in">
        <div className="leaves-grid-layout">
          {/* Employee Request Form */}
          <div className="glass-card form-panel">
            <h2>Apply for Leave</h2>
            <form onSubmit={handleLeaveSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  value={newLeaveForm.type}
                  onChange={(e) => setNewLeaveForm({ ...newLeaveForm, type: e.target.value })}
                  className="form-control"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                </select>
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newLeaveForm.startDate}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newLeaveForm.endDate}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason / Description</label>
                <textarea
                  rows="3"
                  placeholder="State the reason for requesting leave..."
                  value={newLeaveForm.reason}
                  onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                  className="form-control"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Submit Request</button>
            </form>
          </div>

          {/* Approver Panel / Request Review (HR/Managers) */}
          {isApprover && (
            <div className="glass-card review-panel">
              <h2>Leave Approvals Desk</h2>
              <div className="review-list">
                {leaves.filter(l => l.status === "Pending").length > 0 ? (
                  leaves.filter(l => l.status === "Pending").map(req => (
                    <div key={req.id} className="leave-req-card">
                      <div className="req-header">
                        <h4>{req.employeeName}</h4>
                        <span className="badge badge-info">{req.type}</span>
                      </div>
                      <div className="req-dates">
                        <strong>Period:</strong> {req.startDate} to {req.endDate}
                      </div>
                      <p className="req-reason">"{req.reason}"</p>
                      <div className="req-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => updateLeaveStatus(req.id, "Approved")}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateLeaveStatus(req.id, "Rejected")}>Reject</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No pending leave requests to review.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="glass-card table-panel" style={{ marginTop: "24px" }}>
          <h2>My Leave History</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaveHistory.map(history => (
                  <tr key={history.id}>
                    <td><strong>{history.type}</strong></td>
                    <td>{history.startDate} to {history.endDate}</td>
                    <td>{history.reason}</td>
                    <td>{history.appliedDate}</td>
                    <td>
                      <span className={`badge ${history.status === "Approved" ? "badge-success" : history.status === "Rejected" ? "badge-danger" : "badge-warning"}`}>
                        {history.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myLeaveHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-muted" style={{ textAlign: "center" }}>No leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: SALARY PAYS TAB
  // ==========================================
  const renderSalary = () => {
    // HR can generate or review everyone's payslip.
    // For standard display, we display for current user or selected employee.
    const payslipTarget = selectedEmployeeForSlip || currentUser;

    const openPayslip = (month) => {
      setSelectedPayslipMonth(month);
      setShowPayslipModal(true);
    };

    return (
      <div className="salary-tab glass-card fade-in">
        <div className="salary-header-area">
          <h2>Salary Slip Records</h2>
          {activeRole !== "Employee" && (
            <div className="salary-filters">
              <label htmlFor="salary-user-select" style={{ marginRight: "10px", fontSize: "0.85rem", fontWeight: 600 }}>Review Employee Salary:</label>
              <select
                id="salary-user-select"
                onChange={(e) => {
                  const emp = employees.find(x => x.id === e.target.value);
                  setSelectedEmployeeForSlip(emp || null);
                }}
                className="form-control"
                style={{ width: "240px", display: "inline-block" }}
                value={selectedEmployeeForSlip?.id || ""}
              >
                <option value="">My Slips ({currentUser.fullName})</option>
                {employees.filter(x => x.id !== currentUser.id).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.designation})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <p className="text-muted" style={{ marginBottom: "20px" }}>
          Viewing monthly payroll statements generated for <strong>{payslipTarget.fullName}</strong> ({payslipTarget.designation}).
        </p>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Payslip Month</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslipMonths.map((item, index) => {
                const base = payslipTarget.salary?.base || 45000;
                const allowances = payslipTarget.salary?.allowances || 8000;
                const deductions = payslipTarget.salary?.deductions || 3000;
                const net = base + allowances - deductions;

                return (
                  <tr key={index}>
                    <td><strong>{item.name}</strong></td>
                    <td>₹{base.toLocaleString()}</td>
                    <td>₹{allowances.toLocaleString()}</td>
                    <td>₹{deductions.toLocaleString()}</td>
                    <td><strong className="text-primary">₹{net.toLocaleString()}</strong></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openPayslip(item.name)}>
                        🔍 View Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: SUPPORT TICKETS TAB
  // ==========================================
  const renderSupport = () => {
    const isSupportAgent = activeRole === "HR" || activeRole === "Super Admin";
    const myTicketHistory = tickets.filter(t => t.employeeId === currentUser.id);

    const handleTicketSubmit = (e) => {
      e.preventDefault();
      if (!newTicketForm.title || !newTicketForm.description) return;
      createTicket(newTicketForm);
      setNewTicketForm({ category: "IT Support", title: "", description: "", priority: "Medium" });
      alert("Ticket submitted successfully. The IT/HR desk will review it shortly.");
    };

    return (
      <div className="support-tab fade-in">
        <div className="leaves-grid-layout">
          {/* Raise a Ticket Form */}
          <div className="glass-card form-panel">
            <h2>Raise a Support Ticket</h2>
            <form onSubmit={handleTicketSubmit}>
              <div className="form-group">
                <label>Helpdesk Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="form-control"
                >
                  <option value="IT Support">IT Support & hardware</option>
                  <option value="HR Operations">HR & payroll queries</option>
                  <option value="Facility Management">Facilities & office workspace</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="form-control"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ticket Summary</label>
                <input
                  type="text"
                  placeholder="Briefly state the issue..."
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Elaborate Details</label>
                <textarea
                  rows="3"
                  placeholder="Provide logs, room numbers, specific errors..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="form-control"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Create Ticket</button>
            </form>
          </div>

          {/* Ticket Review Desk (HR/Admin) */}
          {isSupportAgent && (
            <div className="glass-card review-panel">
              <h2>IT/HR Resolution Desk</h2>
              <div className="review-list">
                {tickets.filter(t => t.status !== "Resolved").length > 0 ? (
                  tickets.filter(t => t.status !== "Resolved").map(tkt => (
                    <div key={tkt.id} className="leave-req-card">
                      <div className="req-header">
                        <h4>{tkt.employeeName}</h4>
                        <span className={`badge ${tkt.priority === "High" ? "badge-danger" : "badge-warning"}`}>{tkt.priority}</span>
                      </div>
                      <div className="req-dates" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
                        Category: <strong>{tkt.category}</strong> | Raised: {tkt.createdAt}
                      </div>
                      <h5 style={{ margin: "4px 0", color: "var(--primary)" }}>{tkt.title}</h5>
                      <p className="req-reason">"{tkt.description}"</p>
                      <div className="req-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => updateTicketStatus(tkt.id, "In Progress")}>Progress</button>
                        <button className="btn btn-success btn-sm" onClick={() => updateTicketStatus(tkt.id, "Resolved")}>Resolve</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">All support tickets have been resolved!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="glass-card table-panel" style={{ marginTop: "24px" }}>
          <h2>My Support Tickets History</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Ticket Title</th>
                  <th>Raised Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myTicketHistory.map(tkt => (
                  <tr key={tkt.id}>
                    <td><strong>{tkt.category}</strong></td>
                    <td>
                      <div><strong>{tkt.title}</strong></div>
                      <div className="text-muted-small">{tkt.description}</div>
                    </td>
                    <td>{tkt.createdAt}</td>
                    <td>
                      <span className={`badge ${tkt.priority === "High" ? "badge-danger" : "badge-warning"}`}>
                        {tkt.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tkt.status === "Resolved" ? "badge-success" : tkt.status === "In Progress" ? "badge-info" : "badge-warning"}`}>
                        {tkt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myTicketHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-muted" style={{ textAlign: "center" }}>No tickets raised.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: EMPLOYEES DIRECTORY
  // ==========================================
  const renderEmployees = () => {
    const isHr = activeRole === "HR" || activeRole === "Super Admin";

    const handleAddEmpSubmit = (e) => {
      e.preventDefault();
      addEmployee({
        fullName: newEmpForm.fullName,
        email: newEmpForm.email,
        phoneNumber: newEmpForm.phoneNumber,
        designation: newEmpForm.designation,
        department: newEmpForm.department,
        pan: newEmpForm.pan,
        aadharNumber: newEmpForm.aadharNumber,
        dob: newEmpForm.dob,
        doj: newEmpForm.doj,
        role: newEmpForm.role,
        salary: {
          base: Number(newEmpForm.baseSalary),
          allowances: Number(newEmpForm.allowances),
          deductions: Number(newEmpForm.deductions)
        }
      });
      setShowAddEmpModal(false);
      // Reset Form
      setNewEmpForm({
        fullName: "", email: "", phoneNumber: "", designation: "", department: "",
        pan: "", aadharNumber: "", dob: "", doj: "", role: "Employee",
        baseSalary: 50000, allowances: 10000, deductions: 4000
      });
    };

    const handleEditClick = (emp) => {
      setEditingEmpId(emp.id);
      setEditEmpForm({ ...emp });
    };

    const handleEditSave = (e) => {
      e.preventDefault();
      updateEmployeeProfile(editingEmpId, editEmpForm);
      setEditingEmpId(null);
    };

    return (
      <div className="employees-tab glass-card fade-in">
        <div className="panel-header" style={{ marginBottom: "20px" }}>
          <h2>Employee Directory</h2>
          {isHr && (
            <button className="btn btn-primary" onClick={() => setShowAddEmpModal(true)}>
              + Add Employee
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Profile Details</th>
                <th>Employee ID / DOJ</th>
                <th>Contact Info</th>
                <th>Compliance Details</th>
                <th>Role / Salary</th>
                {isHr && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const isEditing = editingEmpId === emp.id;

                if (isEditing) {
                  return (
                    <tr key={emp.id} className="editing-row">
                      <td colSpan={isHr ? 6 : 5}>
                        <form onSubmit={handleEditSave} className="inline-edit-form">
                          <h4 style={{ marginBottom: "12px", color: "var(--primary)" }}>Editing {emp.fullName}</h4>
                          <div className="grid-3-col">
                            <div className="form-group">
                              <label>Full Name</label>
                              <input
                                type="text"
                                value={editEmpForm.fullName || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, fullName: e.target.value })}
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <label>Designation</label>
                              <input
                                type="text"
                                value={editEmpForm.designation || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, designation: e.target.value })}
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <label>Department</label>
                              <select
                                value={editEmpForm.department || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, department: e.target.value })}
                                className="form-control"
                              >
                                {departments.map(d => (
                                  <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid-3-col">
                            <div className="form-group">
                              <label>Phone Number</label>
                              <input
                                type="text"
                                value={editEmpForm.phoneNumber || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, phoneNumber: e.target.value })}
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <label>PAN ID</label>
                              <input
                                type="text"
                                value={editEmpForm.pan || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, pan: e.target.value })}
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <label>Aadhaar ID</label>
                              <input
                                type="text"
                                value={editEmpForm.aadharNumber || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, aadharNumber: e.target.value })}
                                className="form-control"
                              />
                            </div>
                          </div>

                          <div className="grid-3-col">
                            <div className="form-group">
                              <label>Role Privilege</label>
                              <select
                                value={editEmpForm.role || ""}
                                onChange={(e) => setEditEmpForm({ ...editEmpForm, role: e.target.value })}
                                className="form-control"
                              >
                                <option value="Employee">Employee</option>
                                <option value="Manager">Manager</option>
                                <option value="HR">HR Admin</option>
                                <option value="Super Admin">Super Admin</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Base Salary (₹)</label>
                              <input
                                type="number"
                                value={editEmpForm.salary?.base || 0}
                                onChange={(e) => setEditEmpForm({
                                  ...editEmpForm,
                                  salary: { ...editEmpForm.salary, base: Number(e.target.value) }
                                })}
                                className="form-control"
                              />
                            </div>
                            <div className="form-group" style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingEmpId(null)}>Cancel</button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={emp.id}>
                    <td>
                      <strong>{emp.fullName}</strong>
                      <div className="text-muted-small">{emp.designation}</div>
                      <span className="badge badge-info">{emp.department}</span>
                    </td>
                    <td>
                      <div><strong>{emp.employeeId}</strong></div>
                      <div className="text-muted-small">DOJ: {emp.doj}</div>
                    </td>
                    <td>
                      <div>{emp.email}</div>
                      <div className="text-muted-small">{emp.phoneNumber}</div>
                    </td>
                    <td>
                      <div>PAN: <strong>{emp.pan || "None"}</strong></div>
                      <div>Aadhaar: <strong>{emp.aadharNumber || "None"}</strong></div>
                    </td>
                    <td>
                      <div>Privilege: <strong>{emp.role}</strong></div>
                      <div className="text-primary" style={{ fontWeight: 600 }}>₹{emp.salary?.base.toLocaleString()}/mo</div>
                    </td>
                    {isHr && (
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(emp)}>✏ Edit</button>
                          {emp.id !== currentUser.id && (
                            <button className="btn btn-danger btn-sm" onClick={() => deleteEmployee(emp.id)}>✕</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal: Add Employee */}
        {showAddEmpModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add New Employee Profile</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddEmpModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAddEmpSubmit}>
                <div className="modal-body">
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={newEmpForm.fullName}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, fullName: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={newEmpForm.email}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        value={newEmpForm.phoneNumber}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, phoneNumber: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Designation</label>
                      <input
                        type="text"
                        placeholder="e.g., Tech Lead"
                        value={newEmpForm.designation}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        value={newEmpForm.department}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                        className="form-control"
                        required
                      >
                        <option value="">Select Department...</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Role Privilege</label>
                      <select
                        value={newEmpForm.role}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value })}
                        className="form-control"
                      >
                        <option value="Employee">Employee (Developer/Staff)</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR Admin</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-3-col">
                    <div className="form-group">
                      <label>Base Salary (₹)</label>
                      <input
                        type="number"
                        value={newEmpForm.baseSalary}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, baseSalary: Number(e.target.value) })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Allowances (₹)</label>
                      <input
                        type="number"
                        value={newEmpForm.allowances}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, allowances: Number(e.target.value) })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Deductions (₹)</label>
                      <input
                        type="number"
                        value={newEmpForm.deductions}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, deductions: Number(e.target.value) })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="grid-3-col">
                    <div className="form-group">
                      <label>PAN Card</label>
                      <input
                        type="text"
                        value={newEmpForm.pan}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, pan: e.target.value.toUpperCase() })}
                        className="form-control"
                        maxLength={10}
                      />
                    </div>
                    <div className="form-group">
                      <label>Aadhaar Card</label>
                      <input
                        type="text"
                        value={newEmpForm.aadharNumber}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, aadharNumber: e.target.value })}
                        className="form-control"
                        placeholder="0000-0000-0000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Joining</label>
                      <input
                        type="date"
                        value={newEmpForm.doj}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, doj: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Create Profile</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddEmpModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER: DEPARTMENTS TAB
  // ==========================================
  const renderDepartments = () => {
    const handleDeptSubmit = (e) => {
      e.preventDefault();
      if (!newDeptForm.name) return;
      addDepartment(newDeptForm.name, newDeptForm.head);
      setNewDeptForm({ name: "", head: "" });
      setShowAddDeptModal(false);
    };

    return (
      <div className="departments-tab glass-card fade-in">
        <div className="panel-header" style={{ marginBottom: "20px" }}>
          <h2>Company Departments</h2>
          <button className="btn btn-primary" onClick={() => setShowAddDeptModal(true)}>
            + Add Department
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Department Head</th>
                <th>Employee Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id}>
                  <td><strong>{dept.name}</strong></td>
                  <td>{dept.head}</td>
                  <td>
                    <span className="badge badge-info">{dept.employeeCount || 0} Staff</span>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDepartment(dept.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Add Department */}
        {showAddDeptModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add Department</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddDeptModal(false)}>✕</button>
              </div>
              <form onSubmit={handleDeptSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Department Name</label>
                    <input
                      type="text"
                      value={newDeptForm.name}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                      className="form-control"
                      placeholder="e.g. Sales, Marketing"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department Head</label>
                    <input
                      type="text"
                      value={newDeptForm.head}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, head: e.target.value })}
                      className="form-control"
                      placeholder="Manager Name"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Save Department</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddDeptModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER: PAYSLIP MODAL DETAIL
  // ==========================================
  const renderPayslipModal = () => {
    const payslipTarget = selectedEmployeeForSlip || currentUser;
    const base = payslipTarget.salary?.base || 45000;
    const allowances = payslipTarget.salary?.allowances || 8000;
    const deductions = payslipTarget.salary?.deductions || 3000;
    const net = base + allowances - deductions;

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ width: "min(700px, 100%)" }}>
          <div className="modal-header">
            <h2>Detailed Payslip Statement</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPayslipModal(false)}>✕</button>
          </div>
          <div className="modal-body printable-payslip">
            {/* Payslip Visual Board */}
            <div className="payslip-branding">
              <div>
                <h2>EMPLOYMENT MANAGEMENT ERP</h2>
                <p>128 Tech Park Drive, Sector 5, Chennai, IN</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h3>PAYSLIP CARD</h3>
                <strong>{selectedPayslipMonth}</strong>
              </div>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid var(--border-muted)", margin: "16px 0" }} />

            <div className="grid-2-col" style={{ marginBottom: "20px" }}>
              <div className="payslip-info-block">
                <h4>Employee Profile:</h4>
                <div className="detail-item-small">Name: <strong>{payslipTarget.fullName}</strong></div>
                <div className="detail-item-small">Designation: {payslipTarget.designation}</div>
                <div className="detail-item-small">Department: {payslipTarget.department}</div>
                <div className="detail-item-small">DOJ: {payslipTarget.doj}</div>
              </div>
              <div className="payslip-info-block">
                <h4>Payroll Identifiers:</h4>
                <div className="detail-item-small">Employee ID: <strong>{payslipTarget.employeeId}</strong></div>
                <div className="detail-item-small">PAN Card: {payslipTarget.pan || "N/A"}</div>
                <div className="detail-item-small">Aadhaar Card: {payslipTarget.aadharNumber || "N/A"}</div>
                <div className="detail-item-small">Payment Method: Bank Transfer</div>
              </div>
            </div>

            <table className="custom-table" style={{ background: "transparent", border: "1px solid var(--border-muted)" }}>
              <thead>
                <tr>
                  <th>Earning Component</th>
                  <th>Amount (₹)</th>
                  <th>Deduction Component</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td>₹{base.toLocaleString()}</td>
                  <td>Provident Fund (PF)</td>
                  <td>₹{(deductions * 0.6).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td>₹{(allowances * 0.7).toLocaleString()}</td>
                  <td>Professional Tax (PT)</td>
                  <td>₹{(deductions * 0.4).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Special Allowance</td>
                  <td>₹{(allowances * 0.3).toLocaleString()}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr style={{ background: "rgba(255,255,255,0.02)", fontWeight: 700 }}>
                  <td>Gross Earnings</td>
                  <td>₹{(base + allowances).toLocaleString()}</td>
                  <td>Total Deductions</td>
                  <td>₹{deductions.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="payslip-net-block" style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "1.1rem" }}>Net Salary Disbursed:</div>
              <div className="text-primary" style={{ fontSize: "1.8rem", fontWeight: 800 }}>₹{net.toLocaleString()}</div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                (Rupees {net.toLocaleString("en-IN")} Only)
              </p>
            </div>

            <div className="payslip-signatures" style={{ marginTop: "40px" }}>
              <div className="signature-line">Authorized Signatory</div>
              <div className="signature-line">Employee Signature</div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={handlePrint}>🖨 Print / PDF</button>
            <button className="btn btn-secondary" onClick={() => setShowPayslipModal(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Switch tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "profile":
        return renderProfile();
      case "announcements":
        return renderAnnouncements();
      case "tasks":
        return renderTasks();
      case "leaves":
        return renderLeaves();
      case "salary":
        return renderSalary();
      case "support":
        return renderSupport();
      case "employees":
        return renderEmployees();
      case "departments":
        return renderDepartments();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="erp-layout">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel */}
      <main className="main-content">
        {/* Header bar */}
        <Header activeTab={activeTab} />

        {/* Viewport container */}
        <div className="dashboard-viewport">
          {renderTabContent()}
        </div>
      </main>

      {/* Render Payslip Modal when activated */}
      {showPayslipModal && renderPayslipModal()}
    </div>
  );
};

export default Dashboard;
