export default function ProgressBar({ value, className = "" }) {
  const progress = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="progress-track" aria-hidden="true">
      <div className={`progress-fill ${className}`} style={{ "--progress": `${progress}%` }} />
    </div>
  );
}
