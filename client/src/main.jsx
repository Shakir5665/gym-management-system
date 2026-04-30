import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "./context/NotificationsContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </ThemeProvider>,
);
