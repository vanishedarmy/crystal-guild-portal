import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GuildDirectory from "./pages/GuildDirectory.jsx";
import FellowshipPage from "./pages/FellowshipPage.jsx";
import PlayerProfile from "./pages/PlayerProfile.jsx";
import StreamerDashboard from "./pages/StreamerDashboard.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

const GuidePage = lazy(() => import("./guide/GuidePage.jsx"));

function GuideLoader() {
  return <div className="state-message">Opening the Crystal Guild archives...</div>;
}

function NotFound() {
  return (
    <main className="shell">
      <div className="state-message">
        The Tonberry checked the registry twice. That page still does not exist. <a href="/players">Return to Guild Heroes.</a>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/players" />} />
      <Route path="/players" element={<GuildDirectory />} />
      <Route path="/fellowship" element={<FellowshipPage />} />
      <Route path="/player/:username" element={<PlayerProfile />} />
      <Route path="/streamer" element={<StreamerDashboard />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/guide/*" element={<Suspense fallback={<GuideLoader />}><GuidePage /></Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
