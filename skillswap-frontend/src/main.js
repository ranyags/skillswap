import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
// 🌐 Initialisation de la configuration i18n (multilingue)
import "./i18n/i18n";
const rootElement = document.getElementById("root");
if (rootElement) {
    createRoot(rootElement).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }));
}
else {
    console.error("❌ L'élément root est introuvable dans index.html !");
}
