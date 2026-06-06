import { create } from "zustand";

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing to localStorage", error);
  }
};

const loadFromLocalStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return fallback;
  }
};

export const useErpStore = create((set, get) => {
  // One-time cleanup for starting completely fresh (0 departments, 0 tasks, etc.)
  if (typeof window !== "undefined" && window.localStorage) {
    const isFresh = localStorage.getItem("erp_fresh_initialized_v3");
    if (!isFresh) {
      localStorage.removeItem("erp_employees");
      localStorage.removeItem("erp_departments");
      localStorage.removeItem("erp_announcements");
      localStorage.removeItem("erp_tasks");
      localStorage.removeItem("erp_leaves");
      localStorage.removeItem("erp_tickets");
      localStorage.removeItem("erp_active_role");
      localStorage.setItem("erp_fresh_initialized_v3", "true");
    }
    const isRoleReset = localStorage.getItem("erp_role_reset_v1");
    if (!isRoleReset) {
      localStorage.removeItem("erp_active_role");
      localStorage.setItem("erp_role_reset_v1", "true");
    }
  }

  const initialEmployees = loadFromLocalStorage("erp_employees", []);
  const initialDepartments = loadFromLocalStorage("erp_departments", []);
  const initialAnnouncements = loadFromLocalStorage("erp_announcements", []);
  const initialTasks = loadFromLocalStorage("erp_tasks", []);
  const initialLeaves = loadFromLocalStorage("erp_leaves", []);
  const initialTickets = loadFromLocalStorage("erp_tickets", []);
  const initialSalarySlips = loadFromLocalStorage("erp_salary_slips", []);

  return {
    employees: initialEmployees,
    departments: initialDepartments,
    announcements: initialAnnouncements,
    tasks: initialTasks,
    leaves: initialLeaves,
    tickets: initialTickets,
    salarySlips: initialSalarySlips,
    activeRole: "",

    setActiveRole: (role) => {
      set({ activeRole: role });
    },

    // Employee Actions (HR & Super Admin)
    addEmployee: (employeeData) => {
      const employees = get().employees;
      const newEmp = {
        id: `emp_${Date.now()}`,
        fullName: employeeData.fullName,
        employeeId: employeeData.employeeId || `EMP${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        doj: employeeData.doj || new Date().toISOString().split("T")[0],
        email: employeeData.email,
        phoneNumber: employeeData.phoneNumber,
        pan: employeeData.pan || "",
        aadharNumber: employeeData.aadharNumber || "",
        dob: employeeData.dob || "",
        designation: employeeData.designation,
        department: employeeData.department,
        resume: employeeData.resume || "",
        role: employeeData.role || "Employee",
        salary: employeeData.salary || null
      };

      const updated = [...employees, newEmp];
      set({ employees: updated });
      saveToLocalStorage("erp_employees", updated);
      return newEmp;
    },

    updateEmployeeProfile: (id, updatedFields) => {
      const employees = get().employees;
      const updated = employees.map((emp) => {
        if (emp.id === id) {
          return { ...emp, ...updatedFields };
        }
        return emp;
      });
      set({ employees: updated });
      saveToLocalStorage("erp_employees", updated);
    },

    deleteEmployee: (id) => {
      const employees = get().employees;
      const updated = employees.filter((emp) => emp.id !== id);
      set({ employees: updated });
      saveToLocalStorage("erp_employees", updated);
    },

    // Announcement Actions (HR & Super Admin)
    addAnnouncement: (title, content, category) => {
      const announcements = get().announcements;
      const newAnn = {
        id: `ann_${Date.now()}`,
        title,
        content,
        category,
        date: new Date().toISOString().split("T")[0],
        author: "System"
      };
      const updated = [newAnn, ...announcements];
      set({ announcements: updated });
      saveToLocalStorage("erp_announcements", updated);
    },

    deleteAnnouncement: (id) => {
      const announcements = get().announcements;
      const updated = announcements.filter((a) => a.id !== id);
      set({ announcements: updated });
      saveToLocalStorage("erp_announcements", updated);
    },

    // Task Actions (Manager & Super Admin)
    addTask: (taskData) => {
      const tasks = get().tasks;
      const employees = get().employees;

      const assignedEmployee = employees.find((emp) => emp.id === taskData.assignedTo);

      const newTask = {
        id: `task_${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        assignedToName: assignedEmployee ? assignedEmployee.fullName : "Unknown Employee",
        assignedBy: taskData.assignedBy || "system",
        assignedByName: taskData.assignedByName || "System",
        status: "Assigned",
        priority: taskData.priority || "Medium",
        dueDate: taskData.dueDate || new Date().toISOString().split("T")[0]
      };

      const updated = [newTask, ...tasks];
      set({ tasks: updated });
      saveToLocalStorage("erp_tasks", updated);
    },

    updateTaskStatus: (taskId, status) => {
      const tasks = get().tasks;
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
      set({ tasks: updated });
      saveToLocalStorage("erp_tasks", updated);
    },

    deleteTask: (taskId) => {
      const tasks = get().tasks;
      const updated = tasks.filter((t) => t.id !== taskId);
      set({ tasks: updated });
      saveToLocalStorage("erp_tasks", updated);
    },

    // Leave Actions
    applyLeave: (leaveData) => {
      const leaves = get().leaves;

      const newLeave = {
        id: `leave_${Date.now()}`,
        employeeId: leaveData.employeeId || "guest",
        employeeName: leaveData.employeeName || "Guest",
        type: leaveData.type,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason,
        status: "Pending",
        appliedDate: new Date().toISOString().split("T")[0]
      };

      const updated = [newLeave, ...leaves];
      set({ leaves: updated });
      saveToLocalStorage("erp_leaves", updated);
    },

    updateLeaveStatus: (leaveId, status) => {
      const leaves = get().leaves;
      const updated = leaves.map((l) => (l.id === leaveId ? { ...l, status } : l));
      set({ leaves: updated });
      saveToLocalStorage("erp_leaves", updated);
    },

    // Support Tickets Actions
    createTicket: (ticketData) => {
      const tickets = get().tickets;

      const newTicket = {
        id: `tkt_${Date.now()}`,
        employeeId: ticketData.employeeId || "guest",
        employeeName: ticketData.employeeName || "Guest",
        category: ticketData.category,
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority || "Medium",
        status: "Pending",
        createdAt: new Date().toISOString().split("T")[0]
      };

      const updated = [newTicket, ...tickets];
      set({ tickets: updated });
      saveToLocalStorage("erp_tickets", updated);
    },

    updateTicketStatus: (ticketId, status) => {
      const tickets = get().tickets;
      const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
      set({ tickets: updated });
      saveToLocalStorage("erp_tickets", updated);
    },

    // Department Actions (Super Admin)
    addDepartment: (name, headName) => {
      const departments = get().departments;
      const newDept = {
        id: `dept_${Date.now()}`,
        name,
        head: headName || "Unassigned",
        employeeCount: 0
      };
      const updated = [...departments, newDept];
      set({ departments: updated });
      saveToLocalStorage("erp_departments", updated);
    },

    deleteDepartment: (id) => {
      const departments = get().departments;
      const updated = departments.filter((d) => d.id !== id);
      set({ departments: updated });
      saveToLocalStorage("erp_departments", updated);
    },

    // Salary Slips Actions (HR & Super Admin)
    addSalarySlip: (slipData) => {
      const salarySlips = get().salarySlips;
      const newSlip = {
        id: `slip_${Date.now()}`,
        employeeId: slipData.employeeId,
        employeeName: slipData.employeeName || "Unknown",
        month: slipData.month,
        base: Number(slipData.base) || 0,
        allowances: Number(slipData.allowances) || 0,
        deductions: Number(slipData.deductions) || 0,
        createdAt: new Date().toISOString().split("T")[0]
      };
      const updated = [newSlip, ...salarySlips];
      set({ salarySlips: updated });
      saveToLocalStorage("erp_salary_slips", updated);
    },

    deleteSalarySlip: (id) => {
      const salarySlips = get().salarySlips;
      const updated = salarySlips.filter((s) => s.id !== id);
      set({ salarySlips: updated });
      saveToLocalStorage("erp_salary_slips", updated);
    }
  };
});
