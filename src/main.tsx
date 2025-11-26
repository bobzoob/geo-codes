import "./index.css";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "./state/appContext.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      {" "}
      {/* Wrap the App */}
      <App />
    </AppProvider>
  </React.StrictMode>
);
