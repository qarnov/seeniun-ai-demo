import { useState, useEffect } from "react";
import InvestorChatbot from "./components/InvestorChatbot.jsx";
import LeadQualifier from "./components/LeadQualifier.jsx";
import DealTracker from "./components/DealTracker.jsx";
import Landing from "./components/Landing.jsx";
import { colors, gradients } from "./theme.js";

const TABS = [
  { id: "chatbot", num: "01", label: "Investor Advisor", subLabel: "Maya" },
  { id: "qualifier", num: "02", label: "Lead Qualifier", subLabel: "Sara" },
  { id: "tracker", num: "03", label: "Deal Tracker", subLabel: "Pipeline" },
];

export default function App() {
  const [view, setView] = useState("landing"); // "landing" | "tools"
  const [activeTab, setActiveTab] = useState("chatbot");

  // Whenever we enter the tools view, scroll to top.
  useEffect(() => {
    if (view === "tools") window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  function enterTools(tabId = "chatbot") {
    setActiveTab(tabId);
    setView("tools");
  }

  if (view === "landing") {
    return <Landing onEnter={enterTools} />;
  }

  return (
    <div style={styles.shell}>
      {/* ── Top nav ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button
            onClick={() => setView("landing")}
            style={styles.brand}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.9)}
          >
            <div style={styles.diamond} />
            <div style={{ textAlign: "left", lineHeight: 1 }}>
              <div style={styles.brandName}>SEENIUN</div>
              <div style={styles.brandSub}>AI INVESTMENT SUITE</div>
            </div>
          </button>

          <nav style={styles.tabBar}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tab,
                    ...(active ? styles.tabActive : styles.tabInactive),
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = colors.champagne;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = colors.textSecondary;
                  }}
                >
                  <span style={styles.tabNum}>{tab.num}</span>
                  <span style={styles.tabLabelGroup}>
                    <span style={styles.tabLabel}>{tab.label}</span>
                    <span style={styles.tabSubLabel}>{tab.subLabel}</span>
                  </span>
                  {active && <span style={styles.tabUnderline} />}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setView("landing")}
            style={styles.backBtn}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.champagne)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.bronze)}
          >
            ← Overview
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {activeTab === "chatbot" && <InvestorChatbot />}
        {activeTab === "qualifier" && <LeadQualifier />}
        {activeTab === "tracker" && <DealTracker />}
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  shell: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: colors.black,
  },
  header: {
    background: "rgba(8,6,4,0.95)",
    backdropFilter: "blur(14px)",
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textPrimary,
    flexShrink: 0,
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 32,
    padding: "16px 28px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: colors.textPrimary,
    opacity: 0.9,
    transition: "opacity 0.2s ease",
    fontFamily: "inherit",
  },
  diamond: {
    width: 24,
    height: 24,
    background: gradients.bronze,
    borderRadius: 2,
    transform: "rotate(45deg)",
    boxShadow: "0 0 14px rgba(184,149,106,0.4)",
    flexShrink: 0,
  },
  brandName: {
    fontSize: 12,
    letterSpacing: "0.3em",
    color: colors.textPrimary,
    fontWeight: 500,
  },
  brandSub: {
    fontSize: 8.5,
    letterSpacing: "0.35em",
    color: colors.bronze,
    marginTop: 4,
  },
  tabBar: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 18px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: 12,
    transition: "color 0.2s ease",
    position: "relative",
    color: colors.textSecondary,
  },
  tabActive: { color: colors.champagne },
  tabInactive: {},
  tabNum: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 16,
    color: colors.bronze,
    letterSpacing: "0.1em",
  },
  tabLabelGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    lineHeight: 1.1,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  tabSubLabel: {
    fontSize: 9,
    letterSpacing: "0.3em",
    color: colors.bronze,
    marginTop: 3,
  },
  tabUnderline: {
    position: "absolute",
    bottom: -16,
    left: "10%",
    right: "10%",
    height: 1,
    background: gradients.bronze,
    boxShadow: "0 0 10px rgba(184,149,106,0.5)",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: colors.bronze,
    fontSize: 11,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    padding: 0,
    transition: "color 0.2s ease",
  },
  main: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: colors.black,
  },
};
