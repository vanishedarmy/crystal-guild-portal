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

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
