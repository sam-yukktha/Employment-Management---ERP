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
        // TODO: Replace with actual backend API call
        // const response = await api.post('/auth/login', { email, password });

        // For now: mock implementation (will be replaced with backend)
        // In production, this will call your backend
        const mockUser = {
          id: `user_${Date.now()}`,
          email,
          fullName: email.split("@")[0],
          role: "Employee"
        };
        const mockToken = `jwt_token_${Date.now()}`;

        set({
          currentUser: mockUser,
          authToken: mockToken,
          isLoading: false,
          error: null
        });

        saveToLocalStorage("auth_user", mockUser);
        saveToLocalStorage("auth_token", mockToken);

        return { success: true, user: mockUser };
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Login failed";
        set({ isLoading: false, error: errorMessage });
        return { success: false, message: errorMessage };
      }
    },

    signup: async (fullName, email, password) => {
      set({ isLoading: true, error: null });

      try {
        // TODO: Replace with actual backend API call
        // const response = await api.post('/auth/signup', { fullName, email, password });

        // For now: mock implementation (will be replaced with backend)
        const mockUser = {
          id: `user_${Date.now()}`,
          email,
          fullName,
          role: "Employee"
        };
        const mockToken = `jwt_token_${Date.now()}`;

        set({
          currentUser: mockUser,
          authToken: mockToken,
          isLoading: false,
          error: null
        });

        saveToLocalStorage("auth_user", mockUser);
        saveToLocalStorage("auth_token", mockToken);

        return { success: true, user: mockUser };
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Signup failed";
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
