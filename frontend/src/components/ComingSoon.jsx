export default function ComingSoon({ icon, title, description, features }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconRing}>{icon}</div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.description}>{description}</p>

        <div style={styles.featureList}>
          {features.map((f) => (
            <div key={f} style={styles.featureItem}>
              <span style={styles.check}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          In Development — Coming Soon
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "48px 40px",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f0f0f0",
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #eef2ff, #e0f2fe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    margin: "0 auto 20px",
    border: "2px solid #dbeafe",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0a2540",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.7,
    marginBottom: 28,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
    marginBottom: 28,
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 14,
    color: "#374151",
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 16px",
    borderRadius: 20,
    background: "#fefce8",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 600,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#f59e0b",
    animation: "pulse 2s infinite",
    display: "inline-block",
  },
};
