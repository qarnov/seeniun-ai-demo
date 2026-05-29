import { useState, useEffect } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtAED(n) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n}`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Deal card ──────────────────────────────────────────────────────────────

function DealCard({ deal, stages }) {
  const [open, setOpen] = useState(false);
  const isHandover = deal.stage === stages.length - 1;
  const pct = (deal.stage / (stages.length - 1)) * 100;

  return (
    <div style={styles.card}>
      <div style={styles.cardTop} onClick={() => setOpen((o) => !o)}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.cardClientRow}>
            <span style={styles.cardId}>{deal.id}</span>
            <span style={styles.cardClient}>{deal.client}</span>
          </div>
          <div style={styles.cardProperty}>{deal.property}</div>
          <div style={styles.cardMeta}>
            {deal.developer} · {fmtAED(deal.value_aed)}
          </div>
        </div>
        <div style={styles.cardRight}>
          <span
            style={{
              ...styles.stageBadge,
              ...(isHandover ? styles.stageBadgeDone : {}),
            }}
          >
            {stages[deal.stage].icon} {stages[deal.stage].label}
          </span>
          <span style={styles.chevron}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Mini pipeline progress */}
      <div style={styles.miniTrack}>
        <div
          style={{
            ...styles.miniFill,
            width: `${pct}%`,
            background: isHandover
              ? "linear-gradient(90deg,#16a34a,#22c55e)"
              : "linear-gradient(90deg,#0a3d7a,#0a5540)",
          }}
        />
        {stages.map((s, i) => (
          <span
            key={s.key}
            style={{
              ...styles.miniNode,
              left: `${(i / (stages.length - 1)) * 100}%`,
              background: i <= deal.stage ? (isHandover ? "#16a34a" : "#0a3d7a") : "#d1d5db",
            }}
            title={s.label}
          />
        ))}
      </div>

      <div style={styles.nextRow}>
        <span style={styles.nextLabel}>Next:</span>
        <span style={styles.nextText}>{deal.next_milestone}</span>
        <span style={styles.updated}>Updated {fmtDate(deal.updated)}</span>
      </div>

      {open && (
        <div style={styles.timeline}>
          {deal.history.map((h, i) => (
            <div key={i} style={styles.tlRow}>
              <div style={styles.tlDot} />
              <div>
                <div style={styles.tlStage}>
                  {stages[h.stage].icon} {stages[h.stage].label}
                  <span style={styles.tlDate}>{fmtDate(h.date)}</span>
                </div>
                <div style={styles.tlNote}>{h.note}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DealTracker() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load deals.");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.errorBanner}>⚠️ {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.center}>
        <div style={styles.loading}>Loading deal pipeline…</div>
      </div>
    );
  }

  const { stages, deals, summary } = data;

  return (
    <div style={styles.scroll}>
      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.head}>
          <div>
            <h2 style={styles.title}>Post-Sale Deal Tracker</h2>
            <p style={styles.subtitle}>
              Live client-facing pipeline · brokers update once, clients always see the truth
            </p>
          </div>
          <div style={styles.liveTag}>
            <span style={styles.liveDot} /> Live
          </div>
        </div>

        {/* Summary stats */}
        <div style={styles.statRow}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{summary.total_deals}</div>
            <div style={styles.statLabel}>Active Deals</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{fmtAED(summary.total_value_aed)}</div>
            <div style={styles.statLabel}>Pipeline Value</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{summary.handovers_complete}</div>
            <div style={styles.statLabel}>Handovers Done</div>
          </div>
        </div>

        {/* Stage funnel */}
        <div style={styles.funnel}>
          {stages.map((s, i) => (
            <div key={s.key} style={styles.funnelStage}>
              <div style={styles.funnelIcon}>{s.icon}</div>
              <div style={styles.funnelCount}>{summary.by_stage[i]}</div>
              <div style={styles.funnelLabel}>{s.label}</div>
              {i < stages.length - 1 && <div style={styles.funnelArrow}>→</div>}
            </div>
          ))}
        </div>

        {/* Deal list */}
        <div style={styles.list}>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} stages={stages} />
          ))}
        </div>

        <div style={styles.footnote}>
          Demo data. In production a broker updates a Google Sheet → n8n pushes the change here in
          real time, and each client gets a private link — no login, no "what's happening with my
          deal?" calls.
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  scroll: { flex: 1, overflowY: "auto", background: "#f0f2f5" },
  inner: { maxWidth: 860, margin: "0 auto", padding: "24px 20px 48px" },
  center: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" },
  loading: { color: "#6b7280", fontSize: 14 },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
  },

  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: "#0a2540", margin: 0 },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  liveTag: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "#16a34a",
    background: "#dcfce7",
    padding: "5px 12px",
    borderRadius: 20,
    flexShrink: 0,
  },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" },

  statRow: { display: "flex", gap: 12, marginBottom: 22 },
  stat: {
    flex: 1,
    background: "#fff",
    borderRadius: 14,
    padding: "16px 18px",
    border: "1px solid #eef0f3",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statValue: { fontSize: 22, fontWeight: 700, color: "#0a2540" },
  statLabel: { fontSize: 12, color: "#9ca3af", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.4px" },

  funnel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    borderRadius: 14,
    padding: "18px 16px",
    border: "1px solid #eef0f3",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    marginBottom: 24,
  },
  funnelStage: { position: "relative", flex: 1, textAlign: "center" },
  funnelIcon: { fontSize: 20 },
  funnelCount: { fontSize: 20, fontWeight: 700, color: "#0a2540", marginTop: 2 },
  funnelLabel: { fontSize: 10.5, color: "#6b7280", marginTop: 2, lineHeight: 1.3 },
  funnelArrow: {
    position: "absolute",
    right: -6,
    top: 18,
    color: "#d1d5db",
    fontSize: 16,
  },

  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "16px 18px",
    border: "1px solid #eef0f3",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", gap: 12 },
  cardClientRow: { display: "flex", alignItems: "center", gap: 8 },
  cardId: {
    fontSize: 11,
    fontWeight: 700,
    color: "#7c3aed",
    background: "#f3e8ff",
    padding: "1px 7px",
    borderRadius: 6,
  },
  cardClient: { fontSize: 15, fontWeight: 600, color: "#0a2540" },
  cardProperty: { fontSize: 13, color: "#374151", marginTop: 3 },
  cardMeta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  cardRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  stageBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0a3d7a",
    background: "#eef4ff",
    padding: "5px 10px",
    borderRadius: 20,
    whiteSpace: "nowrap",
  },
  stageBadgeDone: { color: "#16a34a", background: "#dcfce7" },
  chevron: { fontSize: 10, color: "#9ca3af" },

  miniTrack: { position: "relative", height: 6, borderRadius: 6, background: "#eef0f3", margin: "16px 4px 0" },
  miniFill: { position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 6, transition: "width 0.4s ease" },
  miniNode: {
    position: "absolute",
    top: "50%",
    width: 11,
    height: 11,
    borderRadius: "50%",
    border: "2px solid #fff",
    transform: "translate(-50%, -50%)",
  },

  nextRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" },
  nextLabel: { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" },
  nextText: { fontSize: 13, color: "#374151" },
  updated: { fontSize: 11, color: "#9ca3af", marginLeft: "auto" },

  timeline: { marginTop: 16, paddingTop: 14, borderTop: "1px dashed #e5e7eb", display: "flex", flexDirection: "column", gap: 12 },
  tlRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  tlDot: { width: 8, height: 8, borderRadius: "50%", background: "#0a3d7a", marginTop: 5, flexShrink: 0 },
  tlStage: { fontSize: 13, fontWeight: 600, color: "#0a2540", display: "flex", alignItems: "center", gap: 8 },
  tlDate: { fontSize: 11, color: "#9ca3af", fontWeight: 400 },
  tlNote: { fontSize: 12.5, color: "#6b7280", marginTop: 2, lineHeight: 1.5 },

  footnote: {
    marginTop: 24,
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 1.6,
    background: "#fff",
    border: "1px solid #eef0f3",
    borderRadius: 12,
    padding: "14px 16px",
  },
};

// Pulse keyframes (shared)
if (typeof document !== "undefined" && !document.getElementById("dt-pulse")) {
  const styleTag = document.createElement("style");
  styleTag.id = "dt-pulse";
  styleTag.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
  `;
  document.head.appendChild(styleTag);
}
