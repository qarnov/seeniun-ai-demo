import { useEffect, useRef, useState } from "react";
import { colors, gradients } from "../theme";
import PixelBuilding from "./PixelBuilding.jsx";

// ── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

// ── Animated number that counts up when scrolled into view ───────────────────
function CountUp({ to, suffix = "", duration = 1500 }) {
  const [ref, shown] = useReveal();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shown) return;
    const start = performance.now();
    let raf;
    function tick(t) {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(to);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to, duration]);
  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Nav bar ──────────────────────────────────────────────────────────────────
function NavBar({ onEnter }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 30);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 36px",
        background: solid
          ? "rgba(8,6,4,0.85)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))",
        backdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: solid ? `1px solid ${colors.border}` : "1px solid transparent",
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            background: gradients.bronze,
            borderRadius: 2,
            transform: "rotate(45deg)",
            boxShadow: "0 0 18px rgba(184,149,106,0.4)",
          }}
        />
        <div style={{ lineHeight: 1 }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.32em",
              color: colors.textPrimary,
              fontWeight: 500,
            }}
          >
            SEENIUN
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.4em",
              color: colors.bronze,
              marginTop: 4,
            }}
          >
            AI INVESTMENT SUITE
          </div>
        </div>
      </div>
      <button onClick={onEnter} style={ctaSm}>
        Enter the Suite
        <span style={{ marginLeft: 8 }}>→</span>
      </button>
    </nav>
  );
}

const ctaSm = {
  background: "transparent",
  border: `1px solid ${colors.bronze}`,
  color: colors.champagne,
  padding: "10px 22px",
  fontSize: 12,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "inherit",
  borderRadius: 0,
  transition: "background 0.25s ease, color 0.25s ease",
};

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        background: gradients.spotlight + ", " + gradients.pageWarm,
        overflow: "hidden",
      }}
    >
      {/* Faint grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(184,149,106,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(184,149,106,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ textAlign: "center", maxWidth: 980, zIndex: 1 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.55em",
            color: colors.bronze,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Seeniun Properties · Dubai
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(48px, 8vw, 104px)",
            lineHeight: 0.98,
            color: colors.textPrimary,
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          Building Dubai's future,
          <br />
          <span
            style={{
              background: gradients.bronze,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
            }}
          >
            intelligently.
          </span>
        </h1>
        <p
          style={{
            marginTop: 28,
            fontSize: 16,
            color: colors.textSecondary,
            maxWidth: 620,
            margin: "28px auto 0",
            lineHeight: 1.7,
            letterSpacing: "0.01em",
          }}
        >
          An AI investment suite designed for Seeniun Properties — answering investors, qualifying
          leads, and tracking deals from reservation to handover. Built on Gemini 2.5.
        </p>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: colors.bronze,
            animation: "scrollHint 2s ease-in-out infinite",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.4em" }}>SCROLL</div>
          <div style={{ fontSize: 18 }}>↓</div>
        </div>
      </div>
    </section>
  );
}

// ── Stats (Seeniun by the numbers) ───────────────────────────────────────────

const SEENIUN_STATS = [
  { value: 50, suffix: "+", label: "Employees" },
  { value: 1000, suffix: "+", label: "Brokerage Firms" },
  { value: 5, suffix: "+", label: "Developers" },
  { value: 10, suffix: "+", label: "Years of Expertise" },
  { value: 15000, suffix: "+", label: "Real Estate Brokers" },
  { value: 1000, suffix: "+", label: "Units Sold" },
  { value: 5, suffix: "+ BN", label: "AED in Sales" },
  { value: 2000, suffix: "+", label: "Transactions" },
  { value: 10, suffix: "+", label: "Brands" },
];

function Stats() {
  const [headerRef, headerShown] = useReveal();
  return (
    <section
      style={{
        padding: "140px 32px",
        background:
          "linear-gradient(180deg, #0a0807 0%, #161108 50%, #0a0807 100%)",
        position: "relative",
      }}
    >
      <div
        ref={headerRef}
        style={{
          textAlign: "center",
          marginBottom: 80,
          opacity: headerShown ? 1 : 0,
          transform: `translateY(${headerShown ? 0 : 24}px)`,
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        <div style={dividerLine} />
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.6em",
            color: colors.textPrimary,
            textTransform: "uppercase",
            padding: "20px 0",
            fontWeight: 500,
          }}
        >
          Statistics
        </div>
        <div style={dividerLine} />
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          rowGap: 80,
          columnGap: 60,
        }}
      >
        {SEENIUN_STATS.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 80} />
        ))}
      </div>
    </section>
  );
}

const dividerLine = {
  width: 80,
  height: 1,
  background: colors.textPrimary,
  margin: "0 auto",
  opacity: 0.6,
};

function StatCard({ value, suffix, label, delay }) {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        textAlign: "center",
        opacity: shown ? 1 : 0,
        transform: `translateY(${shown ? 0 : 20}px)`,
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      <div
        className="serif"
        style={{
          fontSize: 64,
          color: colors.textPrimary,
          lineHeight: 1,
          fontWeight: 300,
          letterSpacing: "-0.02em",
        }}
      >
        {shown ? <CountUp to={value} /> : 0}
        <span style={{ color: colors.bronze }}>{suffix}</span>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          color: colors.textSecondary,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── AI Modules (intro cards) ─────────────────────────────────────────────────

const MODULES = [
  {
    id: "chatbot",
    num: "01",
    title: "Investor Advisor",
    subtitle: "Maya · 24/7 AI advisor",
    body:
      "Answers any Dubai real-estate question — DLD fees, Golden Visa, ROI by area, off-plan process. Retrieval-grounded on Seeniun's SOPs so it never hallucinates a number.",
    tag: "RAG · FAISS · Gemini",
  },
  {
    id: "qualifier",
    num: "02",
    title: "Lead Qualifier",
    subtitle: "Sara · Never miss a lead",
    body:
      "Captures budget, area, and timeline through natural conversation — then hands off a qualified investor with a booking link. Brokers only call leads worth calling.",
    tag: "Gemini · Structured extraction",
  },
  {
    id: "tracker",
    num: "03",
    title: "Deal Tracker",
    subtitle: "Reservation → Handover",
    body:
      "A client-facing pipeline showing exactly where each deal stands. Broker updates once, clients always see the truth. No more 'what's happening with my deal?' calls.",
    tag: "Live pipeline · 5 stages",
  },
];

function Modules({ onEnter }) {
  const [headerRef, headerShown] = useReveal();
  return (
    <section
      style={{
        padding: "120px 32px 140px",
        background: "#000",
        position: "relative",
      }}
    >
      <div
        ref={headerRef}
        style={{
          textAlign: "center",
          marginBottom: 70,
          opacity: headerShown ? 1 : 0,
          transform: `translateY(${headerShown ? 0 : 24}px)`,
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        <div style={dividerLine} />
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.6em",
            color: colors.textPrimary,
            textTransform: "uppercase",
            padding: "20px 0",
            fontWeight: 500,
          }}
        >
          The AI Suite
        </div>
        <div style={dividerLine} />
        <h2
          className="serif"
          style={{
            marginTop: 28,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: colors.textPrimary,
            lineHeight: 1.1,
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          Three tools.{" "}
          <span style={{ color: colors.bronze, fontStyle: "italic" }}>One brain.</span>
        </h2>
      </div>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {MODULES.map((m, i) => (
          <ModuleCard key={m.id} m={m} delay={i * 120} onEnter={() => onEnter(m.id)} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 70 }}>
        <button onClick={() => onEnter("chatbot")} style={ctaLg}>
          Launch the Suite <span style={{ marginLeft: 10 }}>→</span>
        </button>
      </div>
    </section>
  );
}

const ctaLg = {
  background: gradients.bronze,
  border: "none",
  color: "#0a0807",
  padding: "16px 36px",
  fontSize: 13,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 600,
  boxShadow: "0 8px 30px rgba(184,149,106,0.25)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
};

function ModuleCard({ m, delay, onEnter }) {
  const [ref, shown] = useReveal();
  const [hover, setHover] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onEnter}
      style={{
        background:
          "linear-gradient(160deg, rgba(184,149,106,0.06) 0%, rgba(20,17,13,0.6) 100%)",
        border: `1px solid ${hover ? colors.bronze : colors.border}`,
        padding: "36px 30px",
        position: "relative",
        cursor: "pointer",
        opacity: shown ? 1 : 0,
        transform: `translateY(${shown ? 0 : 30}px)`,
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s ease ${delay}ms, border-color 0.3s ease`,
        minHeight: 340,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.4em",
          color: colors.bronze,
          marginBottom: 24,
        }}
      >
        {m.num}
      </div>
      <h3
        className="serif"
        style={{
          fontSize: 32,
          color: colors.textPrimary,
          lineHeight: 1.1,
          fontWeight: 400,
          marginBottom: 6,
        }}
      >
        {m.title}
      </h3>
      <div
        style={{
          fontSize: 12,
          color: colors.bronzeLight,
          letterSpacing: "0.1em",
          marginBottom: 22,
        }}
      >
        {m.subtitle}
      </div>
      <p
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          lineHeight: 1.7,
          marginBottom: 24,
        }}
      >
        {m.body}
      </p>
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: colors.textMuted,
            textTransform: "uppercase",
            paddingBottom: 16,
            borderBottom: `1px solid ${colors.borderSoft}`,
            marginBottom: 16,
          }}
        >
          {m.tag}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: hover ? colors.champagne : colors.bronze,
            fontSize: 12,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            transition: "color 0.25s ease",
          }}
        >
          <span>Open module</span>
          <span style={{ transform: hover ? "translateX(6px)" : "none", transition: "transform 0.25s ease" }}>
            →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: "#050403",
        padding: "40px 32px",
        textAlign: "center",
        borderTop: `1px solid ${colors.borderSoft}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.4em",
          color: colors.textMuted,
          textTransform: "uppercase",
        }}
      >
        Built for Seeniun Properties · {new Date().getFullYear()}
      </div>
    </footer>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Landing({ onEnter }) {
  return (
    <div style={{ background: "#000", color: colors.textPrimary }}>
      <NavBar onEnter={() => onEnter("chatbot")} />
      <Hero />
      <PixelBuilding />
      <Stats />
      <Modules onEnter={onEnter} />
      <Footer />
    </div>
  );
}
