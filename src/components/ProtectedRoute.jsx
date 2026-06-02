import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export function ProtectedRoute({ children }) {
  const { currentUser, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#666"
      }}>
        Loading...
      </div>
    );
  }

  if (!currentUser || !useAuthStore.getState().authToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
