import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./App.jsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";
import { initPwaInstallPrompt } from "./lib/pwaInstallPrompt";

registerServiceWorker();
initPwaInstallPrompt();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
