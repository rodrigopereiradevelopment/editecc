export default function FeedbackButton() {
  return (
    <a
      href="https://docs.google.com/forms/d/e/1FAIpQLSetanArm89lu15fZ70vJ-wSw9-yPbphdjMf6YnIdP251cKqvw/viewform?usp=publish-editor"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: "var(--lp-muted)",
        fontSize: "13px",
        textDecoration: "none",
      }}
      title="Enviar feedback"
    >
      💬 Feedback
    </a>
  );
}
