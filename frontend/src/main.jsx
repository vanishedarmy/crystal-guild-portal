import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/portal.css";
import "./styles/streamer.css";
import "./styles/retro.css";
import "./styles/retro-phase-ii.css";
import "./styles/character-identity.css";
import "./styles/monster-identity.css";
import "./styles/environment-pass.css";
import "./styles/button-fit.css";
import "./styles/uiux-polish.css";
import "./styles/camp-improvements.css";
import "./styles/trading-post-insights.css";
import "./styles/relic-overhaul.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

