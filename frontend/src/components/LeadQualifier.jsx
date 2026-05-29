import { useState, useRef, useEffect } from "react";

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

// ── Helpers ──────────────────────────────────────────────────────────────────

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
        background: "linear-gradient(135deg, #7c3aed, #db2777)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "-0.5px",
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
        <div style={{ ...styles.captureValue, color: done ? "#0a2540" : "#9ca3af" }}>
          {value || "Not captured yet"}
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
        "Hi! I'm Sara from Seeniun Properties 👋\n\nI'll ask you a couple of quick questions to match you with the right Dubai investment — then book you a call with one of our senior advisors.\n\nTo start: what are you looking to invest in?",
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
          <Avatar initials="S" size={40} />
          <div>
            <div style={styles.chatName}>Sara · Lead Qualifier</div>
            <div style={styles.chatStatus}>
              <span style={styles.onlineDot} />
              Qualifies investors 24/7 — never miss a lead
            </div>
          </div>
          <div style={styles.headerRight}>🎯 AI Qualification</div>
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
            <div style={styles.suggestionsLabel}>Quick start:</div>
            <div style={styles.chips}>
              {OPENERS.map((q) => (
                <button key={q} onClick={() => handleSend(q)} style={styles.chip}>
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
          <div style={styles.panelTitle}>Qualification Progress</div>
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
            <div style={styles.bookingIcon}>✅</div>
            <div style={styles.bookingTitle}>Lead Qualified!</div>
            <div style={styles.bookingText}>
              This investor is ready for a senior advisor. Book the consultation now.
            </div>
            <a href={bookingUrl} target="_blank" rel="noreferrer" style={styles.bookingBtn}>
              📅 Book Consultation Call
            </a>
            <div style={styles.bookingNote}>
              In production this fires a CRM record + Calendly invite automatically.
            </div>
          </div>
        ) : (
          <div style={styles.hintCard}>
            <div style={styles.hintTitle}>How this saves the broker time</div>
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
  layout: { flex: 1, display: "flex", overflow: "hidden", background: "#f0f2f5" },
  container: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e9ecef",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flexShrink: 0,
  },
  chatName: { fontWeight: 600, fontSize: 15, color: "#0a2540" },
  chatStatus: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280", marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" },
  headerRight: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#9ca3af",
    background: "#f9fafb",
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid #e5e7eb",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 1.55,
    wordBreak: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  bubbleUser: {
    background: "linear-gradient(135deg, #7c3aed, #db2777)",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  bubbleBot: { background: "#fff", color: "#1a1a2e", borderBottomLeftRadius: 4, border: "1px solid #f0f0f0" },
  timestamp: { fontSize: 10, opacity: 0.55, marginTop: 4 },
  dots: { display: "flex", gap: 4, padding: "2px 0" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#cbd5e1", display: "inline-block", animation: "bounce 1.2s infinite ease-in-out" },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    textAlign: "center",
  },
  suggestions: { padding: "12px 16px", background: "#fff", borderTop: "1px solid #e9ecef", flexShrink: 0 },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 8,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 16,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  inputBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid #e9ecef",
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 24,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "none",
    lineHeight: 1.5,
    background: "#f9fafb",
    color: "#111827",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  sendBtnActive: {
    background: "linear-gradient(135deg, #7c3aed, #db2777)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
  },
  sendBtnDisabled: { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" },

  // Panel
  panel: {
    width: 300,
    flexShrink: 0,
    background: "#fff",
    borderLeft: "1px solid #e9ecef",
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  panelTitle: { fontSize: 13, fontWeight: 700, color: "#0a2540", textTransform: "uppercase", letterSpacing: "0.5px" },
  progressPill: {
    fontSize: 12,
    fontWeight: 700,
    color: "#7c3aed",
    background: "#f3e8ff",
    padding: "2px 10px",
    borderRadius: 20,
  },
  progressBarTrack: { height: 6, borderRadius: 6, background: "#eef0f3", overflow: "hidden", marginBottom: 20 },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
    background: "linear-gradient(90deg, #7c3aed, #db2777)",
    transition: "width 0.4s ease",
  },
  captureList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 },
  captureRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  captureCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "2px solid #e5e7eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
  captureCheckDone: { background: "#22c55e", borderColor: "#22c55e" },
  captureBody: { minWidth: 0 },
  captureLabel: { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 },
  captureValue: { fontSize: 14, fontWeight: 500, marginTop: 1, wordBreak: "break-word" },

  hintCard: { marginTop: "auto", background: "#f9fafb", border: "1px solid #eef0f3", borderRadius: 12, padding: 14 },
  hintTitle: { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 },
  hintText: { fontSize: 12, color: "#6b7280", lineHeight: 1.6 },

  bookingCard: {
    background: "linear-gradient(135deg, #f3e8ff, #fce7f3)",
    border: "1px solid #e9d5ff",
    borderRadius: 16,
    padding: "22px 18px",
    textAlign: "center",
  },
  bookingIcon: { fontSize: 34, marginBottom: 6 },
  bookingTitle: { fontSize: 17, fontWeight: 700, color: "#0a2540", marginBottom: 6 },
  bookingText: { fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 },
  bookingBtn: {
    display: "block",
    background: "linear-gradient(135deg, #7c3aed, #db2777)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    padding: "11px 16px",
    borderRadius: 24,
    boxShadow: "0 2px 10px rgba(124,58,237,0.35)",
  },
  bookingNote: { fontSize: 11, color: "#9ca3af", marginTop: 12, lineHeight: 1.5 },
};

// Inject keyframes for typing dots (shared name with the advisor module is fine)
if (typeof document !== "undefined" && !document.getElementById("lq-bounce")) {
  const styleTag = document.createElement("style");
  styleTag.id = "lq-bounce";
  styleTag.textContent = `
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1.2); opacity: 1; }
    }
  `;
  document.head.appendChild(styleTag);
}
