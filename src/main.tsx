import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('[main.tsx] Application starting...');
console.log('[main.tsx] Environment:', {
  hasApiKey: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
  apiKeyPrefix: import.meta.env.VITE_ANTHROPIC_API_KEY?.substring(0, 20)
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('[main.tsx] React app rendered');
