export default function ClickableCard({ className = "", detail, onOpen, children }) {
  const open = () => onOpen?.(detail);
  return (
    <article
      className={`${className} clickable-card`}
      tabIndex={0}
      role="button"
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
    >
      {children}
    </article>
  );
}
