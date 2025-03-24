import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import store from "./redux/store";

// Importing styles
import "./css/style.css";
import "./css/satoshi.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Required styles
import "react-datepicker/dist/react-datepicker.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    
  );
} else {
  console.error("Root element not found!");
}
