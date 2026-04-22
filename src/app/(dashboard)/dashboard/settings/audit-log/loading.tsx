export default function Loading() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <div style={{ height: 28, width: 120, borderRadius: 6, background: "var(--border-color, #333)", opacity: 0.3, marginBottom: "1.5rem" }} />
      <div style={{ height: 36, width: 200, borderRadius: 6, background: "var(--border-color, #333)", opacity: 0.2, marginBottom: "1rem" }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
          {Array.from({ length: 6 }).map((__, j) => (
            <div key={j} style={{ height: 16, borderRadius: 4, background: "var(--border-color, #333)", opacity: 0.15, flex: j === 4 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
