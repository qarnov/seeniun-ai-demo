import { useState, useRef, useEffect } from "react";

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

function Avatar({ src, initials, size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #0a2540, #1a6b5e)",
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
      <Avatar initials="M" />
      <div style={{ ...styles.bubble, ...styles.bubbleBot }}>
        <div style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                ...styles.dot,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        ...styles.msgRow,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {!isUser && <Avatar initials="M" />}
      <div
        style={{
          ...styles.bubble,
          ...(isUser ? styles.bubbleUser : styles.bubbleBot),
        }}
      >
        {msg.text.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < msg.text.split("\n").length - 1 && <br />}
          </span>
        ))}
        <div
          style={{
            ...styles.timestamp,
            textAlign: isUser ? "right" : "left",
          }}
        >
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
      text: "Hi! I'm Maya, your Seeniun Properties AI advisor 👋\n\nI can answer any question about investing in Dubai real estate — fees, Golden Visa, off-plan process, yields by area, and more.\n\nWhat would you like to know?",
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
      {/* ── Chat header ── */}
      <div style={styles.chatHeader}>
        <Avatar initials="M" size={40} />
        <div>
          <div style={styles.chatName}>Maya · AI Advisor</div>
          <div style={styles.chatStatus}>
            <span style={styles.onlineDot} />
            Seeniun Properties · Dubai Real Estate
          </div>
        </div>
        <div style={styles.headerRight}>🔒 Powered by RAG + FAISS</div>
      </div>

      {/* ── Message list ── */}
      <div style={styles.messageArea}>
        {/* Watermark background */}
        <div style={styles.watermark}>🏙️</div>

        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips ── */}
      {messages.length <= 1 && !loading && (
        <div style={styles.suggestions}>
          <div style={styles.suggestionsLabel}>Try asking:</div>
          <div style={styles.chips}>
            {SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={styles.chip}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e8f0fe")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={styles.inputBar}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about DLD fees, Golden Visa, off-plan ROI…"
          rows={1}
          style={styles.textarea}
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          style={{
            ...styles.sendBtn,
            ...(input.trim() && !loading
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
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#f0f2f5",
  },
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
  chatName: {
    fontWeight: 600,
    fontSize: 15,
    color: "#0a2540",
  },
  chatStatus: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
  },
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
    position: "relative",
  },
  watermark: {
    position: "fixed",
    bottom: "35%",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 120,
    opacity: 0.04,
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    zIndex: 1,
    position: "relative",
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 1.55,
    wordBreak: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  bubbleUser: {
    background: "linear-gradient(135deg, #0a3d7a, #0a5540)",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    background: "#fff",
    color: "#1a1a2e",
    borderBottomLeftRadius: 4,
    border: "1px solid #f0f0f0",
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.55,
    marginTop: 4,
  },
  dots: {
    display: "flex",
    gap: 4,
    padding: "2px 0",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#cbd5e1",
    display: "inline-block",
    animation: "bounce 1.2s infinite ease-in-out",
  },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    textAlign: "center",
  },
  suggestions: {
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid #e9ecef",
    flexShrink: 0,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 8,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 16,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
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
    transition: "border-color 0.15s",
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
    background: "linear-gradient(135deg, #0a3d7a, #0a5540)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(10,61,122,0.35)",
  },
  sendBtnDisabled: {
    background: "#e5e7eb",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
};

// Inject keyframes for typing dots
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1.2); opacity: 1; }
  }
`;
document.head.appendChild(styleTag);
