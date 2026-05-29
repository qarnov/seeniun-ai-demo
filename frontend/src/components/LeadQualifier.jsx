import { useState, useRef, useEffect } from "react";
import { colors, gradients } from "../theme";

// ── API call ───────────────────────────────────────────────────────────────

async function sendQualify(message, history) {
  const res = await fetch("/api/qualify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong.");
  }
  return res.json();
}

const OPENERS = [
  "I want to invest in Dubai property",
  "Looking for a 2BR in Dubai Marina",
  "What can I get for AED 1.5M?",
  "I'm just exploring for now",
];

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Small UI pieces ────────────────────────────────────────────────────────

function Avatar({ initials, size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: gradients.bronze,
        color: "#0a0807",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: "-0.5px",
        boxShadow: "0 0 14px rgba(184,149,106,0.35)",
      }}
    >
      {initials}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={styles.msgRow}>
      <Avatar initials="S" />
      <div style={{ ...styles.bubble, ...styles.bubbleBot }}>
        <div style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ ...styles.msgRow, flexDirection: isUser ? "row-reverse" : "row" }}>
      {!isUser && <Avatar initials="S" />}
      <div style={{ ...styles.bubble, ...(isUser ? styles.bubbleUser : styles.bubbleBot) }}>
        {msg.text.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
        <div style={{ ...styles.timestamp, textAlign: isUser ? "right" : "left" }}>
          {msg.time}
          {isUser && " ✓✓"}
        </div>
      </div>
    </div>
  );
}

function CaptureRow({ label, value }) {
  const done = Boolean(value);
  return (
    <div style={styles.captureRow}>
      <span style={{ ...styles.captureCheck, ...(done ? styles.captureCheckDone : {}) }}>
        {done ? "✓" : ""}
      </span>
      <div style={styles.captureBody}>
        <div style={styles.captureLabel}>{label}</div>
        <div style={{ ...styles.captureValue, color: done ? colors.textPrimary : colors.textMuted }}>
          {value || "Awaiting answer"}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LeadQualifier() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "bot",
      text:
        "Welcome — I'm Sara from Seeniun Properties.\n\nI'll ask a few quick questions to match you with the right Dubai investment, then book a call with one of our senior advisors.\n\nTo start: what are you looking to invest in?",
      time: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState({ budget: null, area: null, timeline: null });
  const [qualified, setQualified] = useState(false);
  const [bookingUrl, setBookingUrl] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, qualified]);

  function getHistory() {
    const pairs = [];
    const bots = messages.filter((m) => m.role === "bot").slice(1);
    const users = messages.filter((m) => m.role === "user");
    const len = Math.min(bots.length, users.length);
    for (let i = 0; i < len; i++) {
      pairs.push({ user: users[i].text, assistant: bots[i].text });
    }
    return pairs;
  }

  async function handleSend(text) {
    const msg = (text || input).trim();
    if (!msg || loading || qualified) return;

    setInput("");
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: msg, time: formatTime(new Date()) },
    ]);
    setLoading(true);

    try {
      const history = getHistory();
      const data = await sendQualify(msg, history);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: data.reply, time: formatTime(new Date()) },
      ]);
      if (data.captured) setCaptured(data.captured);
      if (data.qualified) {
        setQualified(true);
        setBookingUrl(data.bookingUrl);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const progress = [captured.budget, captured.area, captured.timeline].filter(Boolean).length;

  return (
    <div style={styles.layout}>
      {/* ── Chat column ── */}
      <div style={styles.container}>
        <div style={styles.chatHeader}>
          <Avatar initials="S" size={42} />
          <div>
            <div style={styles.chatName}>
              Sara <span style={styles.chatRole}>· Lead Qualifier</span>
            </div>
            <div style={styles.chatStatus}>
              <span style={styles.onlineDot} />
              Qualifies investors 24/7 — never misses a lead
            </div>
          </div>
          <div style={styles.headerRight}>AI Qualification</div>
        </div>

        <div style={styles.messageArea}>
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          {error && <div style={styles.errorBanner}>⚠️ {error}</div>}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && !loading && (
          <div style={styles.suggestions}>
            <div style={styles.suggestionsLabel}>Quick start</div>
            <div style={styles.chips}>
              {OPENERS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={styles.chip}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.bronze;
                    e.currentTarget.style.color = colors.champagne;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.textSecondary;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.inputBar}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={qualified ? "You're all set — see your booking →" : "Type your reply…"}
            rows={1}
            style={styles.textarea}
            disabled={loading || qualified}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || qualified}
            style={{
              ...styles.sendBtn,
              ...(input.trim() && !loading && !qualified
                ? styles.sendBtnActive
                : styles.sendBtnDisabled),
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Qualification panel ── */}
      <aside style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelTitle}>Qualification</div>
          <div style={styles.progressPill}>{progress}/3</div>
        </div>

        <div style={styles.progressBarTrack}>
          <div style={{ ...styles.progressBarFill, width: `${(progress / 3) * 100}%` }} />
        </div>

        <div style={styles.captureList}>
          <CaptureRow label="Budget" value={captured.budget} />
          <CaptureRow label="Area / Property Type" value={captured.area} />
          <CaptureRow label="Timeline" value={captured.timeline} />
        </div>

        {qualified ? (
          <div style={styles.bookingCard}>
            <div style={styles.bookingIcon}>✦</div>
            <div style={styles.bookingTitle}>Lead Qualified</div>
            <div style={styles.bookingText}>
              This investor is ready for a senior advisor. Book the consultation now.
            </div>
            <a href={bookingUrl} target="_blank" rel="noreferrer" style={styles.bookingBtn}>
              Book Consultation Call →
            </a>
            <div style={styles.bookingNote}>
              In production, this fires a CRM record + Calendly invite automatically.
            </div>
          </div>
        ) : (
          <div style={styles.hintCard}>
            <div style={styles.hintTitle}>Why this saves brokers time</div>
            <div style={styles.hintText}>
              Sara captures budget, area and timeline from every after-hours enquiry — so the team
              only ever calls pre-qualified investors. No lead slips through the cracks.
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  layout: { flex: 1, display: "flex", overflow: "hidden", background: colors.black },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 22px",
    background: colors.ink,
    borderBottom: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
  chatName: {
    fontFamily: '"Cormorant Garamond", serif',
    fontWeight: 500,
    fontSize: 22,
    color: colors.textPrimary,
  },
  chatRole: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 12,
    color: colors.bronze,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginLeft: 6,
  },
  chatStatus: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: "0.05em",
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: colors.success,
    boxShadow: `0 0 8px ${colors.success}`,
    display: "inline-block",
  },
  headerRight: {
    marginLeft: "auto",
    fontSize: 10,
    color: colors.bronze,
    background: "rgba(184,149,106,0.08)",
    padding: "5px 12px",
    border: `1px solid ${colors.border}`,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background:
      "radial-gradient(ellipse at top, rgba(184,149,106,0.04) 0%, rgba(0,0,0,0) 50%), " +
      colors.black,
  },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 10 },
  bubble: {
    maxWidth: "78%",
    padding: "12px 16px",
    borderRadius: 4,
    fontSize: 14,
    lineHeight: 1.65,
    wordBreak: "break-word",
  },
  bubbleUser: {
    background: gradients.bronze,
    color: "#0a0807",
    fontWeight: 500,
  },
  bubbleBot: {
    background: colors.surface,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
  },
  timestamp: { fontSize: 10, opacity: 0.55, marginTop: 6, letterSpacing: "0.05em" },
  dots: { display: "flex", gap: 4, padding: "2px 0" },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: colors.bronze,
    display: "inline-block",
    animation: "bounce 1.2s infinite ease-in-out",
  },
  errorBanner: {
    background: colors.dangerBg,
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    padding: "10px 14px",
    fontSize: 13,
    textAlign: "center",
  },
  suggestions: {
    padding: "16px 20px",
    background: colors.ink,
    borderTop: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: colors.bronze,
    textTransform: "uppercase",
    letterSpacing: "0.4em",
    marginBottom: 12,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    fontSize: 12,
    padding: "8px 14px",
    borderRadius: 0,
    border: `1px solid ${colors.border}`,
    background: "transparent",
    color: colors.textSecondary,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  inputBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    padding: "16px 20px",
    background: colors.ink,
    borderTop: `1px solid ${colors.border}`,
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 0,
    border: `1px solid ${colors.border}`,
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "none",
    lineHeight: 1.5,
    background: colors.black,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  sendBtnActive: {
    background: gradients.bronze,
    color: "#0a0807",
    boxShadow: "0 0 20px rgba(184,149,106,0.35)",
  },
  sendBtnDisabled: {
    background: colors.surface,
    color: colors.textMuted,
    cursor: "not-allowed",
    border: `1px solid ${colors.border}`,
  },

  // ── Panel ─────────────────────────────────────────────────────────────
  panel: {
    width: 320,
    flexShrink: 0,
    background: colors.ink,
    borderLeft: `1px solid ${colors.border}`,
    padding: "26px 22px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: 500,
    color: colors.bronze,
    textTransform: "uppercase",
    letterSpacing: "0.5em",
  },
  progressPill: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 18,
    color: colors.champagne,
    fontWeight: 500,
  },
  progressBarTrack: {
    height: 1,
    background: colors.border,
    overflow: "hidden",
    marginBottom: 28,
  },
  progressBarFill: {
    height: "100%",
    background: gradients.bronze,
    boxShadow: "0 0 10px rgba(184,149,106,0.5)",
    transition: "width 0.5s ease",
  },
  captureList: { display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 },
  captureRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  captureCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: `1px solid ${colors.border}`,
    background: "transparent",
    color: "#0a0807",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
    transition: "all 0.3s ease",
  },
  captureCheckDone: {
    background: gradients.bronze,
    borderColor: colors.bronze,
    boxShadow: "0 0 10px rgba(184,149,106,0.4)",
  },
  captureBody: { minWidth: 0 },
  captureLabel: {
    fontSize: 10,
    color: colors.bronze,
    textTransform: "uppercase",
    letterSpacing: "0.4em",
    fontWeight: 500,
  },
  captureValue: {
    fontSize: 14,
    fontWeight: 400,
    marginTop: 4,
    wordBreak: "break-word",
    letterSpacing: "0.01em",
  },

  hintCard: {
    marginTop: "auto",
    background: "rgba(184,149,106,0.05)",
    border: `1px solid ${colors.borderSoft}`,
    padding: 16,
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: 500,
    color: colors.bronze,
    marginBottom: 8,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  },
  hintText: { fontSize: 12, color: colors.textSecondary, lineHeight: 1.7 },

  bookingCard: {
    background: gradients.bronzeSoft,
    border: `1px solid ${colors.bronze}`,
    padding: "26px 20px",
    textAlign: "center",
  },
  bookingIcon: { fontSize: 24, color: colors.bronze, marginBottom: 8 },
  bookingTitle: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 22,
    fontWeight: 500,
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: "0.02em",
  },
  bookingText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: 18,
  },
  bookingBtn: {
    display: "block",
    background: gradients.bronze,
    color: "#0a0807",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 12,
    padding: "13px 18px",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    boxShadow: "0 0 20px rgba(184,149,106,0.4)",
  },
  bookingNote: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 14,
    lineHeight: 1.6,
    letterSpacing: "0.08em",
  },
};
