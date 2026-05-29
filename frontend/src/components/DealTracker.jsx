import { useState, useEffect } from "react";
import { colors, gradients } from "../theme";

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
  const [hover, setHover] = useState(false);
  const isHandover = deal.stage === stages.length - 1;
  const pct = (deal.stage / (stages.length - 1)) * 100;

  return (
    <div
      style={{
        ...styles.card,
        borderColor: hover || open ? colors.bronze : colors.border,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={styles.cardTop} onClick={() => setOpen((o) => !o)}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={styles.cardClientRow}>
            <span style={styles.cardId}>{deal.id}</span>
            <span style={styles.cardClient}>{deal.client}</span>
          </div>
          <div style={styles.cardProperty}>{deal.property}</div>
          <div style={styles.cardMeta}>
            {deal.developer} <span style={styles.dot}>·</span> {fmtAED(deal.value_aed)}
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
          <span style={{ ...styles.chevron, transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>

      <div style={styles.miniTrack}>
        <div
          style={{
            ...styles.miniFill,
            width: `${pct}%`,
            background: isHandover ? gradients.bronze : gradients.bronze,
            opacity: isHandover ? 1 : 0.85,
          }}
        />
        {stages.map((s, i) => (
          <span
            key={s.key}
            style={{
              ...styles.miniNode,
              left: `${(i / (stages.length - 1)) * 100}%`,
              background: i <= deal.stage ? colors.bronze : colors.border,
              boxShadow: i <= deal.stage ? "0 0 6px rgba(184,149,106,0.5)" : "none",
            }}
            title={s.label}
          />
        ))}
      </div>

      <div style={styles.nextRow}>
        <span style={styles.nextLabel}>Next</span>
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
        <div style={styles.head}>
          <div>
            <div style={styles.eyebrow}>03 · Post-Sale Tracker</div>
            <h2 className="serif" style={styles.title}>
              Live deal pipeline
            </h2>
            <p style={styles.subtitle}>
              Brokers update once, clients always see the truth — from reservation to handover.
            </p>
          </div>
          <div style={styles.liveTag}>
            <span style={styles.liveDot} /> LIVE
          </div>
        </div>

        <div style={styles.statRow}>
          <div style={styles.stat}>
            <div className="serif" style={styles.statValue}>
              {summary.total_deals}
            </div>
            <div style={styles.statLabel}>Active Deals</div>
          </div>
          <div style={styles.stat}>
            <div className="serif" style={styles.statValue}>
              {fmtAED(summary.total_value_aed)}
            </div>
            <div style={styles.statLabel}>Pipeline Value</div>
          </div>
          <div style={styles.stat}>
            <div className="serif" style={styles.statValue}>
              {summary.handovers_complete}
            </div>
            <div style={styles.statLabel}>Handovers Done</div>
          </div>
        </div>

        {/* Stage funnel */}
        <div style={styles.funnel}>
          {stages.map((s, i) => (
            <div key={s.key} style={styles.funnelStage}>
              <div style={styles.funnelIcon}>{s.icon}</div>
              <div className="serif" style={styles.funnelCount}>
                {summary.by_stage[i]}
              </div>
              <div style={styles.funnelLabel}>{s.label}</div>
              {i < stages.length - 1 && <div style={styles.funnelArrow}>→</div>}
            </div>
          ))}
        </div>

        <div style={styles.sectionLabel}>The Book</div>

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
  scroll: { flex: 1, overflowY: "auto", background: colors.black },
  inner: { maxWidth: 980, margin: "0 auto", padding: "40px 28px 60px" },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.black,
  },
  loading: {
    color: colors.bronze,
    fontSize: 12,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  },
  errorBanner: {
    background: colors.dangerBg,
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    padding: "12px 16px",
    fontSize: 13,
  },

  head: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 36,
    gap: 20,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.5em",
    color: colors.bronze,
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: 500,
  },
  title: {
    fontSize: 44,
    fontWeight: 400,
    color: colors.textPrimary,
    margin: 0,
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 1.6,
    maxWidth: 560,
  },
  liveTag: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 10,
    fontWeight: 500,
    color: colors.success,
    border: `1px solid ${colors.success}`,
    padding: "6px 14px",
    letterSpacing: "0.4em",
    flexShrink: 0,
    background: colors.successBg,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: colors.success,
    boxShadow: `0 0 8px ${colors.success}`,
    animation: "pulse 2s infinite",
  },

  statRow: { display: "flex", gap: 16, marginBottom: 28 },
  stat: {
    flex: 1,
    background: colors.surface,
    padding: "24px 22px",
    border: `1px solid ${colors.border}`,
  },
  statValue: {
    fontSize: 40,
    fontWeight: 400,
    color: colors.textPrimary,
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontSize: 10,
    color: colors.bronze,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: "0.4em",
  },

  funnel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: colors.surface,
    padding: "22px 18px",
    border: `1px solid ${colors.border}`,
    marginBottom: 44,
    position: "relative",
  },
  funnelStage: { position: "relative", flex: 1, textAlign: "center" },
  funnelIcon: { fontSize: 18, opacity: 0.85 },
  funnelCount: {
    fontSize: 24,
    fontWeight: 400,
    color: colors.textPrimary,
    marginTop: 4,
  },
  funnelLabel: {
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: "0.25em",
  },
  funnelArrow: {
    position: "absolute",
    right: -6,
    top: 20,
    color: colors.bronzeDeep,
    fontSize: 14,
  },

  sectionLabel: {
    fontSize: 10,
    letterSpacing: "0.5em",
    color: colors.bronze,
    textTransform: "uppercase",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${colors.borderSoft}`,
    fontWeight: 500,
  },

  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: {
    background: colors.surface,
    padding: "20px 22px",
    border: `1px solid ${colors.border}`,
    transition: "border-color 0.25s ease",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    cursor: "pointer",
    gap: 14,
  },
  cardClientRow: { display: "flex", alignItems: "center", gap: 10 },
  cardId: {
    fontSize: 10,
    fontWeight: 500,
    color: colors.bronze,
    background: "rgba(184,149,106,0.10)",
    padding: "2px 8px",
    letterSpacing: "0.15em",
    border: `1px solid ${colors.border}`,
  },
  cardClient: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 22,
    fontWeight: 500,
    color: colors.textPrimary,
    letterSpacing: "0.01em",
  },
  cardProperty: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 1.5 },
  cardMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: "0.05em",
  },
  dot: { color: colors.bronzeDeep, margin: "0 4px" },
  cardRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  stageBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: colors.bronzeLight,
    background: "rgba(184,149,106,0.10)",
    padding: "6px 12px",
    border: `1px solid ${colors.border}`,
    whiteSpace: "nowrap",
    letterSpacing: "0.05em",
  },
  stageBadgeDone: {
    color: colors.success,
    background: colors.successBg,
    borderColor: colors.success,
  },
  chevron: {
    fontSize: 11,
    color: colors.bronze,
    transition: "transform 0.25s ease",
    display: "inline-block",
  },

  miniTrack: {
    position: "relative",
    height: 1,
    background: colors.border,
    margin: "20px 4px 0",
  },
  miniFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    transition: "width 0.4s ease",
  },
  miniNode: {
    position: "absolute",
    top: "50%",
    width: 9,
    height: 9,
    borderRadius: "50%",
    border: "1px solid #0a0807",
    transform: "translate(-50%, -50%)",
    transition: "background 0.3s ease, box-shadow 0.3s ease",
  },

  nextRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 18, flexWrap: "wrap" },
  nextLabel: {
    fontSize: 9,
    fontWeight: 500,
    color: colors.bronze,
    textTransform: "uppercase",
    letterSpacing: "0.4em",
  },
  nextText: { fontSize: 12.5, color: colors.textSecondary, letterSpacing: "0.01em" },
  updated: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: "auto",
    letterSpacing: "0.05em",
  },

  timeline: {
    marginTop: 22,
    paddingTop: 18,
    borderTop: `1px dashed ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  tlRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  tlDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: colors.bronze,
    marginTop: 7,
    flexShrink: 0,
    boxShadow: "0 0 6px rgba(184,149,106,0.5)",
  },
  tlStage: {
    fontSize: 13,
    fontWeight: 500,
    color: colors.textPrimary,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  tlDate: { fontSize: 10, color: colors.bronze, letterSpacing: "0.15em" },
  tlNote: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 1.6,
  },

  footnote: {
    marginTop: 36,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 1.7,
    background: colors.surface,
    border: `1px solid ${colors.borderSoft}`,
    padding: "14px 18px",
    letterSpacing: "0.02em",
  },
};
