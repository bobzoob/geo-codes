import "./index.css";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "./state/appContext.tsx";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      {" "}
      {/* Wrap the App */}
      <App />
    </AppProvider>
  </React.StrictMode>
);
