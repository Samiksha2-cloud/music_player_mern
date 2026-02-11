import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; //here we are finished with importing all necessary things we needed for the files

import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  //this function helps us render our react app
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
); //here we have rendered our app in the root id .

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
