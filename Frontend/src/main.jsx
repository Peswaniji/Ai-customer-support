import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { TicketProvider } from "./contexts/TicketContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <TicketProvider>
            <App />
          </TicketProvider>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
