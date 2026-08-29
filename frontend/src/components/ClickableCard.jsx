export default function ClickableCard({ className = "", detail, onOpen, children }) {
  const open = (event) => {
    event?.currentTarget?.focus?.({ preventScroll: true });
    onOpen?.(detail);
  };
  return (
    <article
      className={`${className} clickable-card`}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(event);
        }
      }}
    >
      {children}
    </article>
  );
}
