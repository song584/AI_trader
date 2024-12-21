import React from "react";
import ReactDOM from "react-dom/client";  // 이 부분이 수정되었습니다
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
