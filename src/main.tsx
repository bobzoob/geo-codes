import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./state/appContext.tsx";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      {" "}
      <App />
    </AppProvider>
  </React.StrictMode>
);
