import Hunts from "./Hunts.jsx";

// Uses the established Adventure State / Dungeon action protocol, but renders a
// separate profile tab instead of nesting Job trials beneath the Dungeon Board.
export default function AscensionTrials(props) {
  return <Hunts {...props} mode="ascension" />;
}
