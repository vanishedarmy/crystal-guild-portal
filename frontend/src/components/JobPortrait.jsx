import { jobPortraitPath } from "../utils/jobPortraits.js";

export default function JobPortrait({ jobName, className = "", eager = false, label = "" }) {
  const src = jobPortraitPath(jobName);
  const safeJobName = String(jobName || "Adventurer").trim() || "Adventurer";
  const classes = ["job-portrait", className, src ? "has-art" : "fallback"].filter(Boolean).join(" ");

  return (
    <div className={classes} data-job-name={safeJobName}>
      {src ? (
        <img
          src={src}
          alt={label || `${safeJobName} Job portrait`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
        />
      ) : (
        <div className="job-portrait-fallback" role="img" aria-label={`${safeJobName} Job portrait not yet illustrated`}>
          <span aria-hidden="true">✦</span>
          <small>{safeJobName}</small>
        </div>
      )}
    </div>
  );
}
