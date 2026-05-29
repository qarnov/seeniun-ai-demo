import { useRef, useEffect, useState } from "react";
import { colors } from "../theme";

// ── Building silhouette ──────────────────────────────────────────────────────
// Stylised Dubai stepped tower. Each entry is [startRow, endRow, leftCol, rightCol].
// Grid is COLS × ROWS, origin at bottom-left.

const COLS = 56;
const ROWS = 112;

const SILHOUETTE = [
  { row0: 0,  row1: 6,   c0: 14, c1: 41 }, // ground plinth (widest)
  { row0: 6,  row1: 12,  c0: 16, c1: 39 }, // base shoulder
  { row0: 12, row1: 32,  c0: 19, c1: 36 }, // lower podium
  { row0: 32, row1: 58,  c0: 21, c1: 34 }, // mid tower
  { row0: 58, row1: 84,  c0: 23, c1: 32 }, // upper tower
  { row0: 84, row1: 98,  c0: 25, c1: 30 }, // crown
  { row0: 98, row1: 106, c0: 26, c1: 29 }, // spire base
  { row0: 106, row1: 112, c0: 27, c1: 28 }, // antenna
];

function isBuilding(col, row) {
  for (const s of SILHOUETTE) {
    if (row >= s.row0 && row < s.row1 && col >= s.c0 && col < s.c1) return true;
  }
  return false;
}

// Pre-compute pixel list (cached at module level)
const PIXELS = (() => {
  const list = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!isBuilding(col, row)) continue;
      // Window pattern — brighter "lit windows" form a vertical grid
      // Avoid windows on the spire/crown (single-cell wide)
      const wide = SILHOUETTE.find((s) => row >= s.row0 && row < s.row1);
      const width = wide ? wide.c1 - wide.c0 : 0;
      const isWindow =
        width >= 6 &&
        row % 3 === 1 &&
        ((col - (wide.c0 + 1)) % 2 === 0) &&
        col !== wide.c0 &&
        col !== wide.c1 - 1;
      // Edge highlight — outer columns brighter (lit-up corners)
      const isEdge = wide && (col === wide.c0 || col === wide.c1 - 1);
      list.push({ col, row, isWindow, isEdge });
    }
  }
  return list;
})();

// ── Component ──────────────────────────────────────────────────────────────

export default function PixelBuilding() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const rafRef = useRef(0);
  const [caption, setCaption] = useState(0); // 0..3

  // Resize canvas to fit container
  useEffect(() => {
    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      // Pixel scale based on viewport height. Aim for building ~80% of viewport height.
      const targetH = Math.min(window.innerHeight * 0.82, 880);
      const pixel = Math.max(4, Math.floor(targetH / ROWS));
      c.width = COLS * pixel;
      c.height = ROWS * pixel;
      // Re-render at new size
      drawAt(progressRef.current);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll listener
  useEffect(() => {
    function onScroll() {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const raw = Math.min(1, scrolled / Math.max(1, total));
      // Ease-out cubic for tasteful pacing
      const eased = 1 - Math.pow(1 - raw, 2);
      progressRef.current = eased;

      // Caption stage
      const stage = eased < 0.25 ? 0 : eased < 0.55 ? 1 : eased < 0.85 ? 2 : 3;
      setCaption((prev) => (prev === stage ? prev : stage));

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawAt(progressRef.current));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function drawAt(progress) {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const pixel = c.width / COLS;
    ctx.clearRect(0, 0, c.width, c.height);

    // Subtle ground glow (lights up as building rises)
    const groundAlpha = 0.12 * progress;
    const grad = ctx.createRadialGradient(
      c.width / 2, c.height - 4, 0,
      c.width / 2, c.height - 4, c.width * 0.6
    );
    grad.addColorStop(0, `rgba(184, 149, 106, ${groundAlpha})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);

    // Draw pixels (bottom-up)
    for (const p of PIXELS) {
      const threshold = p.row / ROWS;
      const span = 0.08; // how gradual the row reveal is
      const stagger = ((p.col * 9301 + 49297) % 233) / 233 * 0.02;
      const t = Math.min(1, Math.max(0, (progress - threshold - stagger) / span));
      if (t <= 0) continue;

      const x = p.col * pixel;
      // Flip Y (row 0 at bottom)
      const y = c.height - (p.row + 1) * pixel;

      let r, g, b;
      if (p.isWindow) {
        // Champagne lit window
        r = 232; g = 212; b = 176;
      } else if (p.isEdge) {
        // Bronze highlight edge
        r = 212; g = 183; b = 138;
      } else {
        // Structural bronze
        r = 139; g = 111; b = 71;
      }
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${t})`;
      ctx.fillRect(x, y, pixel - 0.5, pixel - 0.5);

      // Window glow once fully lit
      if (p.isWindow && t > 0.85) {
        ctx.fillStyle = `rgba(232, 212, 176, ${(t - 0.85) * 1.5})`;
        ctx.fillRect(x - 0.5, y - 0.5, pixel + 0.5, pixel + 0.5);
      }
    }
  }

  const captions = [
    { label: "01", title: "Laying the foundation", text: "FastAPI · LangChain · FAISS" },
    { label: "02", title: "Frame rises", text: "RAG over Seeniun's Dubai SOP" },
    { label: "03", title: "Topping out", text: "Three AI tools, one suite" },
    { label: "04", title: "Lights on", text: "Built in 72 hours · Live on Railway" },
  ];

  return (
    <section
      ref={stageRef}
      style={{
        height: "350vh",
        position: "relative",
        background:
          "radial-gradient(ellipse at top, rgba(184,149,106,0.06) 0%, rgba(0,0,0,0) 60%), #000",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: "0 40px",
        }}
      >
        {/* Side rail copy */}
        <div style={{ flex: 1, maxWidth: 320, textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.4em",
              color: colors.bronze,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            How it's built
          </div>
          {captions.map((c, i) => (
            <div
              key={i}
              style={{
                opacity: caption === i ? 1 : caption > i ? 0.35 : 0.18,
                transform: `translateY(${(i - caption) * 4}px)`,
                transition: "opacity 0.5s ease, transform 0.6s ease",
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: colors.bronzeLight,
                  letterSpacing: "0.3em",
                  marginBottom: 4,
                }}
              >
                {c.label}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 28,
                  color: colors.textPrimary,
                  lineHeight: 1.1,
                  marginBottom: 4,
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, letterSpacing: "0.05em" }}>
                {c.text}
              </div>
            </div>
          ))}
        </div>

        {/* Building canvas */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block", imageRendering: "pixelated" }} />
          {/* Reflection */}
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: 0,
              right: 0,
              height: 60,
              background:
                "linear-gradient(to bottom, rgba(184,149,106,0.08), rgba(0,0,0,0))",
              filter: "blur(8px)",
              transform: "scaleY(-1)",
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Right spacer for balance */}
        <div style={{ flex: 1, maxWidth: 320 }} />
      </div>
    </section>
  );
}
