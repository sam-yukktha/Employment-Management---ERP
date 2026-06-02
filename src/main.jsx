import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import "./index.css";

function AppWrapper() {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);