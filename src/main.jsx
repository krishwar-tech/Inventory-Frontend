import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { StoreProvider } from "./context/StoreContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);