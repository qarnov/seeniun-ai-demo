import { useState, useRef, useEffect } from "react";
import { colors, gradients } from "../theme";

// ── Suggested questions ────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What are the DLD fees when buying off-plan?",
  "Can I get a Golden Visa with off-plan property?",
  "What's the ROI in JVC vs Business Bay?",
  "How does Oqood registration work?",
  "Do I pay agent commission as a buyer?",
  "What's the minimum investment for Golden Visa?",
  "Can Indians fully own property in Dubai?",
  "What happens if a developer delays my project?",
];

// ── API call ───────────────────────────────────────────────────────────────

async function sendMessage(message, history) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong.");
  }
  const data = await res.json();
  return data.answer;
}

// ── Components ─────────────────────────────────────────────────────────────

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
      <Avatar initials="M" />
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

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ ...styles.msgRow, flexDirection: isUser ? "row-reverse" : "row" }}>
      {!isUser && <Avatar initials="M" />}
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

// ── Main chatbot component ──────────────────────────────────────────────────

export default function InvestorChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "bot",
      text:
        "Welcome. I'm Maya, your Seeniun Properties AI advisor.\n\nAsk me anything about investing in Dubai real estate — DLD fees, Golden Visa thresholds, off-plan process, area-by-area ROI.\n\nWhere would you like to begin?",
      time: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

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
    if (!msg || loading) return;

    setInput("");
    setError(null);

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: msg,
      time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = getHistory();
      const answer = await sendMessage(msg, history);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: answer,
          time: formatTime(new Date()),
        },
      ]);
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

  return (
    <div style={styles.container}>
      <div style={styles.chatHeader}>
        <Avatar initials="M" size={42} />
        <div>
          <div style={styles.chatName}>
            Maya <span style={styles.chatRole}>· Investor Advisor</span>
          </div>
          <div style={styles.chatStatus}>
            <span style={styles.onlineDot} />
            RAG-grounded on Seeniun's Dubai SOP
          </div>
        </div>
        <div style={styles.headerRight}>FAISS · Gemini 2.5</div>
      </div>

      <div style={styles.messageArea}>
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && !loading && (
        <div style={styles.suggestions}>
          <div style={styles.suggestionsLabel}>Try asking</div>
          <div style={styles.chips}>
            {SUGGESTIONS.map((q) => (
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
          placeholder="Ask Maya about Dubai real estate…"
          rows={1}
          style={styles.textarea}
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          style={{
            ...styles.sendBtn,
            ...(input.trim() && !loading ? styles.sendBtnActive : styles.sendBtnDisabled),
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: colors.black,
    color: colors.textPrimary,
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
    letterSpacing: "0.01em",
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
    borderRadius: 0,
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
    maxWidth: "72%",
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
  timestamp: {
    fontSize: 10,
    opacity: 0.55,
    marginTop: 6,
    letterSpacing: "0.05em",
  },
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
    letterSpacing: "0.05em",
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
    letterSpacing: "0.02em",
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
    transition: "border-color 0.2s",
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
};
