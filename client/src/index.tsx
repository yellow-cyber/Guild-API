import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./css/tailwind.css";
import "./css/toastify.css";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
