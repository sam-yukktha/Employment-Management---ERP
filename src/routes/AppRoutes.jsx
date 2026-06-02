import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/login.jsx";
import Signup from "../pages/Signup/signup.jsx";
import Dashboard from "../pages/Dashboard/dashboard.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;