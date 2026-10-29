import { useState } from "react";
import QueensBlood from "./QueensBlood.jsx";
import TripleTriadHall from "./TripleTriadHall.jsx";
import "../styles/card-hall.css";
import "../styles/triple-triad.css";
import "../styles/card-hall-hub.css";

export default function CardHall({ overview }) {
  const [game, setGame] = useState("blood");
  return <section className="card-hall-hub" aria-label="Card Hall">
    <header className="card-hall-hub-heading">
      <div><p className="eyebrow">Crystal Guild · Games</p><h2>Card Hall</h2><p>Two card games, one home. Play for fun, build your collection, and test your strategy.</p></div>
      <nav className="card-hall-games" aria-label="Choose a card game">
        <button type="button" aria-pressed={game === "blood"} onClick={() => setGame("blood")}>Queen’s Blood</button>
        <button type="button" aria-pressed={game === "triad"} onClick={() => setGame("triad")}>Triple Triad</button>
      </nav>
    </header>
    {game === "blood" ? <QueensBlood overview={overview} /> : <TripleTriadHall overview={overview} />}
  </section>;
}
