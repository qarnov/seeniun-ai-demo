import { useState } from "react";
import InvestorChatbot from "./components/InvestorChatbot.jsx";
import LeadQualifier from "./components/LeadQualifier.jsx";
import DealTracker from "./components/DealTracker.jsx";

const TABS = [
  {
    id: "chatbot",
    label: "Investor Advisor",
    icon: "💬",
    badge: "LIVE",
  },
  {
    id: "qualifier",
    label: "Lead Qualifier",
    icon: "🎯",
    badge: "LIVE",
  },
  {
    id: "tracker",
    label: "Deal Tracker",
    icon: "📊",
    badge: "LIVE",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chatbot");

  return (
    <div style={styles.shell}>
      {/* ── Top header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏙️</span>
            <div>
              <div style={styles.logoName}>Seeniun Properties</div>
              <div style={styles.logoTagline}>AI Investment Suite · Dubai</div>
            </div>
          </div>
          <div style={styles.poweredBy}>Powered by Gemini 2.5 Flash</div>
        </div>

        {/* ── Tab bar ── */}
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
              >
                <span style={styles.tabIcon}>{tab.icon}</span>
                <span style={styles.tabLabel}>{tab.label}</span>
                <span
                  style={{
                    ...styles.badge,
                    ...(tab.badge === "LIVE"
                      ? styles.badgeLive
                      : styles.badgeSoon),
                  }}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Tab content ── */}
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
    background: "#f0f2f5",
  },
  header: {
    background: "linear-gradient(135deg, #0a2540 0%, #1a4070 100%)",
    color: "#fff",
    flexShrink: 0,
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px 10px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoName: {
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "-0.3px",
  },
  logoTagline: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 1,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  poweredBy: {
    fontSize: 11,
    opacity: 0.5,
    letterSpacing: "0.3px",
  },
  tabBar: {
    display: "flex",
    padding: "0 16px",
    gap: 4,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px 8px 0 0",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    position: "relative",
    bottom: 0,
  },
  tabActive: {
    background: "#f0f2f5",
    color: "#0a2540",
  },
  tabInactive: {
    background: "transparent",
    color: "rgba(255,255,255,0.65)",
  },
  tabIcon: {
    fontSize: 15,
  },
  tabLabel: {
    letterSpacing: "-0.1px",
  },
  badge: {
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 5px",
    borderRadius: 4,
    letterSpacing: "0.5px",
  },
  badgeLive: {
    background: "#22c55e",
    color: "#fff",
  },
  badgeSoon: {
    background: "rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.7)",
  },
  main: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};
