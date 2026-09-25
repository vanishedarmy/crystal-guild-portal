import { number } from "../utils/formatters.js";

export default function StatCard({ current, max = null, label }) {
  const value = max === null ? number(current) : `${number(current)} / ${number(max)}`;
  return <div className="stat-card"><strong>{value}</strong><span>{label}</span></div>;
}
