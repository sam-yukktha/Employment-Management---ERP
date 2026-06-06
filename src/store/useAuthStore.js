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

const getDefaultUsers = () => [
  {
    id: "user_admin",
    email: "admin@company.com",
    password: "admin123",
    fullName: "Admin User",
    role: "Super Admin"
  },
  {
    id: "user_employee",
    email: "employee@company.com",
    password: "employee123",
    fullName: "Employee User",
    role: "Employee"
  },
  {
    id: "user_manager",
    email: "manager@company.com",
    password: "manager123",
    fullName: "Manager User",
    role: "Manager"
  },
  {
    id: "user_hr",
    email: "hr@company.com",
    password: "hr123",
    fullName: "HR User",
    role: "HR"
  }
];

const loadRegisteredUsers = () => {
  const users = loadFromLocalStorage("erp_registered_users", []);
  if (users.length === 0) {
    saveToLocalStorage("erp_registered_users", getDefaultUsers());
    return getDefaultUsers();
  }
  return users;
};

export const useAuthStore = create((set, get) => {
  const savedUser = loadFromLocalStorage("auth_user", null);
  const savedToken = loadFromLocalStorage("auth_token", null);

  return {
    currentUser: savedUser,
    authToken: savedToken,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });

      try {
        const users = loadRegisteredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user || user.password !== password) {
          throw new Error("Invalid email or password.");
        }

        const loggedInUser = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        };

        set({
          currentUser: loggedInUser,
          authToken: `jwt_token_${loggedInUser.id}`,
          isLoading: false,
          error: null
        });

        saveToLocalStorage("auth_user", loggedInUser);
        saveToLocalStorage("auth_token", `jwt_token_${loggedInUser.id}`);

        return { success: true, user: loggedInUser };
      } catch (error) {
        const errorMessage = error.message || "Login failed";
        set({ isLoading: false, error: errorMessage });
        return { success: false, message: errorMessage };
      }
    },

    signup: async (fullName, email, password) => {
      set({ isLoading: true, error: null });

      try {
        const users = loadRegisteredUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email address is already registered.");
        }

        const newUser = {
          id: `user_${Date.now()}`,
          email,
          password,
          fullName,
          role: "Employee"
        };

        const updatedUsers = [...users, newUser];
        saveToLocalStorage("erp_registered_users", updatedUsers);

        const loggedInUser = {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role
        };

        set({
          currentUser: loggedInUser,
          authToken: `jwt_token_${loggedInUser.id}`,
          isLoading: false,
          error: null
        });

        saveToLocalStorage("auth_user", loggedInUser);
        saveToLocalStorage("auth_token", `jwt_token_${loggedInUser.id}`);

        return { success: true, user: loggedInUser };
      } catch (error) {
        const errorMessage = error.message || "Signup failed";
        set({ isLoading: false, error: errorMessage });
        return { success: false, message: errorMessage };
      }
    },

    logout: () => {
      set({ currentUser: null, authToken: null, error: null });
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    },

    checkAuth: () => {
      const token = loadFromLocalStorage("auth_token", null);
      const user = loadFromLocalStorage("auth_user", null);

      if (token && user) {
        set({ currentUser: user, authToken: token });
        return true;
      }
      return false;
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    }
  };
});
