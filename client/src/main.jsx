import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "./context/NotificationsContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function MaybeGoogleProvider({ children }) {
  if (!googleClientId) return children;
  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <MaybeGoogleProvider>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </MaybeGoogleProvider>,
);
