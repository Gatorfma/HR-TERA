import { BadgeCheck, Search } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useMemo, useEffect } from "react";
import { DashboardProduct } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProducts } from "@/api/supabaseApi";

interface HeroSectionProps {
  products?: DashboardProduct[];
}

// ─── Network Animation Data ────────────────────────────────────────────────────

interface NodeDef {
  x: number; y: number; r: number;
  freqX: number; freqY: number;
  phaseX: number; phaseY: number;
  ampX: number; ampY: number;
  large: boolean;
}

interface ConnDef { from: number; to: number }
interface BeamDef { connIdx: number; cycleDur: number; travelFrac: number; phase: number }

// 16 nodes: 8 large (indices 0-7) + 8 medium (indices 8-15)
const NODES: NodeDef[] = [
  // Large nodes
  { x: 150, y: 120, r: 22, freqX: 0.17, freqY: 0.23, phaseX: 0.0, phaseY: 1.2, ampX: 2.0, ampY: 1.5, large: true },
  { x: 500, y: 150, r: 26, freqX: 0.22, freqY: 0.18, phaseX: 2.1, phaseY: 0.5, ampX: 1.5, ampY: 2.0, large: true },
  { x: 900, y: 140, r: 20, freqX: 0.19, freqY: 0.27, phaseX: 1.0, phaseY: 3.1, ampX: 1.5, ampY: 1.0, large: true },
  { x: 380, y: 380, r: 24, freqX: 0.15, freqY: 0.21, phaseX: 3.5, phaseY: 0.8, ampX: 1.0, ampY: 1.5, large: true },
  { x: 750, y: 420, r: 22, freqX: 0.25, freqY: 0.16, phaseX: 0.7, phaseY: 2.4, ampX: 1.0, ampY: 2.0, large: true },
  { x: 250, y: 480, r: 18, freqX: 0.20, freqY: 0.30, phaseX: 4.0, phaseY: 1.0, ampX: 2.0, ampY: 1.0, large: true },
  { x: 700, y: 520, r: 20, freqX: 0.28, freqY: 0.19, phaseX: 1.5, phaseY: 3.8, ampX: 1.5, ampY: 1.5, large: true },
  { x: 1100, y: 420, r: 18, freqX: 0.18, freqY: 0.24, phaseX: 2.8, phaseY: 0.3, ampX: 1.0, ampY: 1.5, large: true },
  // Medium nodes
  { x: 320, y: 200, r: 16, freqX: 0.23, freqY: 0.17, phaseX: 0.4, phaseY: 2.6, ampX: 1.5, ampY: 1.0, large: false },
  { x: 700, y: 220, r: 18, freqX: 0.16, freqY: 0.26, phaseX: 3.0, phaseY: 0.9, ampX: 1.0, ampY: 1.5, large: false },
  { x: 1050, y: 200, r: 14, freqX: 0.21, freqY: 0.15, phaseX: 1.8, phaseY: 4.2, ampX: 1.5, ampY: 1.0, large: false },
  { x: 100, y: 320, r: 14, freqX: 0.30, freqY: 0.22, phaseX: 0.6, phaseY: 1.7, ampX: 1.5, ampY: 1.5, large: false },
  { x: 600, y: 350, r: 16, freqX: 0.18, freqY: 0.28, phaseX: 2.3, phaseY: 3.5, ampX: 1.0, ampY: 1.0, large: false },
  { x: 950, y: 350, r: 15, freqX: 0.26, freqY: 0.20, phaseX: 4.5, phaseY: 0.2, ampX: 1.0, ampY: 1.5, large: false },
  { x: 450, y: 550, r: 14, freqX: 0.19, freqY: 0.33, phaseX: 1.3, phaseY: 2.0, ampX: 1.5, ampY: 1.0, large: false },
  { x: 900, y: 560, r: 16, freqX: 0.24, freqY: 0.18, phaseX: 3.2, phaseY: 1.4, ampX: 1.0, ampY: 1.5, large: false },
];

// 26 connections (indices into NODES)
const CONNECTIONS: ConnDef[] = [
  { from: 0, to: 8 },   // 0: 150,120 → 320,200
  { from: 8, to: 1 },   // 1: 320,200 → 500,150
  { from: 1, to: 9 },   // 2: 500,150 → 700,220
  { from: 9, to: 2 },   // 3: 700,220 → 900,140
  { from: 2, to: 10 },  // 4: 900,140 → 1050,200
  { from: 8, to: 3 },   // 5: 320,200 → 380,380
  { from: 1, to: 12 },  // 6: 500,150 → 600,350
  { from: 9, to: 4 },   // 7: 700,220 → 750,420
  { from: 2, to: 13 },  // 8: 900,140 → 950,350
  { from: 0, to: 11 },  // 9: 150,120 → 100,320
  { from: 11, to: 5 },  // 10: 100,320 → 250,480
  { from: 3, to: 12 },  // 11: 380,380 → 600,350
  { from: 12, to: 4 },  // 12: 600,350 → 750,420
  { from: 4, to: 13 },  // 13: 750,420 → 950,350
  { from: 13, to: 7 },  // 14: 950,350 → 1100,420
  { from: 5, to: 14 },  // 15: 250,480 → 450,550
  { from: 14, to: 6 },  // 16: 450,550 → 700,520
  { from: 6, to: 15 },  // 17: 700,520 → 900,560
  { from: 15, to: 7 },  // 18: 900,560 → 1100,420
  { from: 3, to: 5 },   // 19: 380,380 → 250,480
  { from: 12, to: 6 },  // 20: 600,350 → 700,520
  { from: 4, to: 15 },  // 21: 750,420 → 900,560
  { from: 0, to: 1 },   // 22: 150,120 → 500,150
  { from: 11, to: 3 },  // 23: 100,320 → 380,380
  { from: 9, to: 10 },  // 24: 700,220 → 1050,200
  { from: 14, to: 15 }, // 25: 450,550 → 900,560
];

// 8 beams — sparse and elegant, ~1 visible at a time, well-staggered phases
const BEAMS: BeamDef[] = [
  { connIdx: 0,  cycleDur: 7.0,  travelFrac: 0.14, phase: 0.0 },
  { connIdx: 2,  cycleDur: 8.5,  travelFrac: 0.12, phase: 2.8 },
  { connIdx: 5,  cycleDur: 9.0,  travelFrac: 0.15, phase: 5.5 },
  { connIdx: 10, cycleDur: 7.5,  travelFrac: 0.13, phase: 1.5 },
  { connIdx: 12, cycleDur: 8.0,  travelFrac: 0.14, phase: 4.0 },
  { connIdx: 14, cycleDur: 9.5,  travelFrac: 0.12, phase: 6.5 },
  { connIdx: 17, cycleDur: 7.0,  travelFrac: 0.15, phase: 3.2 },
  { connIdx: 22, cycleDur: 10.0, travelFrac: 0.11, phase: 7.8 },
];

// 14 decorative dots (independent CSS/SVG animate — no JS)
const DOTS = [
  { cx: 230, cy: 160, r: 4, dur: "4s", begin: "0s", rMax: 5.5, hasOpacity: true },
  { cx: 410, cy: 170, r: 3.5, dur: "5s", begin: "1s", rMax: 5, hasOpacity: true },
  { cx: 610, cy: 180, r: 4, dur: "6s", begin: "2s", rMax: 5.5, hasOpacity: true },
  { cx: 800, cy: 180, r: 3, dur: "4.5s", begin: "0.5s", rMax: 4.5, hasOpacity: true },
  { cx: 980, cy: 170, r: 3.5, dur: "5.5s", begin: "1.5s", rMax: 5, hasOpacity: false },
  { cx: 200, cy: 400, r: 3, dur: "4s", begin: "2.5s", rMax: 4.5, hasOpacity: true },
  { cx: 490, cy: 460, r: 4, dur: "5s", begin: "0.8s", rMax: 5.5, hasOpacity: false },
  { cx: 830, cy: 490, r: 3.5, dur: "6.5s", begin: "1.2s", rMax: 5, hasOpacity: false },
  { cx: 1020, cy: 310, r: 3, dur: "4.2s", begin: "3s", rMax: 4.5, hasOpacity: true },
  { cx: 60, cy: 220, r: 3, dur: "5s", begin: "0s", rMax: 3, hasOpacity: true, opacityOnly: true },
  { cx: 1150, cy: 300, r: 3.5, dur: "4.5s", begin: "1s", rMax: 3.5, hasOpacity: true, opacityOnly: true },
  { cx: 550, cy: 250, r: 3, dur: "5s", begin: "2s", rMax: 4.5, hasOpacity: false },
  { cx: 340, cy: 290, r: 3.5, dur: "6s", begin: "0.5s", rMax: 3.5, hasOpacity: true, opacityOnly: true },
  { cx: 850, cy: 320, r: 3, dur: "4.8s", begin: "1.5s", rMax: 4.5, hasOpacity: false },
];

// Icon definitions keyed by node index
const NODE_ICONS: Record<number, "people" | "briefcase" | "chart" | "graduation" | "resume"> = {
  0: "people",
  4: "briefcase",
  5: "graduation",
  7: "chart",
  11: "resume",
};

// ─── Animated HR Network Pattern Component ──────────────────────────────────────

const AnimatedHRNetworkPattern = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Collect element references
    const nodeGroups: SVGGElement[] = [];
    const nodeCircles: SVGCircleElement[] = [];
    const connLines: SVGLineElement[] = [];
    const beamEllipses: SVGEllipseElement[] = [];

    for (let i = 0; i < NODES.length; i++) {
      const g = svg.getElementById(`node-${i}`) as SVGGElement | null;
      const c = svg.getElementById(`node-circle-${i}`) as SVGCircleElement | null;
      if (g) nodeGroups.push(g); else return;
      if (c) nodeCircles.push(c); else return;
    }
    for (let j = 0; j < CONNECTIONS.length; j++) {
      const l = svg.getElementById(`conn-${j}`) as SVGLineElement | null;
      if (l) connLines.push(l); else return;
    }
    for (let k = 0; k < BEAMS.length; k++) {
      const e = svg.getElementById(`beam-${k}`) as SVGEllipseElement | null;
      if (e) beamEllipses.push(e); else return;
    }

    // Glow state per node
    const glow = new Float32Array(NODES.length);
    // Base opacities
    const baseFillOpacity = NODES.map(n => n.large ? 0.15 : 0.10);
    const baseStrokeOpacity = NODES.map(n => n.large ? 0.25 : 0.20);

    // Offset cache
    const offsetX = new Float32Array(NODES.length);
    const offsetY = new Float32Array(NODES.length);

    const startTime = performance.now();
    let lastT = 0;

    const tick = (now: number) => {
      const t = (now - startTime) / 1000;
      const dt = t - lastT;
      lastT = t;

      // 1. Node positions — sinusoidal float
      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i];
        offsetX[i] = Math.sin(t * n.freqX * Math.PI * 2 + n.phaseX) * n.ampX;
        offsetY[i] = Math.cos(t * n.freqY * Math.PI * 2 + n.phaseY) * n.ampY;
        nodeGroups[i].setAttribute("transform", `translate(${offsetX[i].toFixed(2)},${offsetY[i].toFixed(2)})`);
      }

      // 2. Connection lines — endpoints follow nodes
      for (let j = 0; j < CONNECTIONS.length; j++) {
        const c = CONNECTIONS[j];
        const sf = NODES[c.from], st = NODES[c.to];
        connLines[j].setAttribute("x1", (sf.x + offsetX[c.from]).toFixed(2));
        connLines[j].setAttribute("y1", (sf.y + offsetY[c.from]).toFixed(2));
        connLines[j].setAttribute("x2", (st.x + offsetX[c.to]).toFixed(2));
        connLines[j].setAttribute("y2", (st.y + offsetY[c.to]).toFixed(2));
      }

      // 3. Beams — tapered ellipse traveling along connection
      // Reset glow decay
      for (let i = 0; i < glow.length; i++) {
        glow[i] = Math.max(0, glow[i] - dt * 2.0);
      }

      for (let k = 0; k < BEAMS.length; k++) {
        const b = BEAMS[k];
        const conn = CONNECTIONS[b.connIdx];
        const cycleProgress = ((t + b.phase) % b.cycleDur) / b.cycleDur;
        const visible = cycleProgress < b.travelFrac;

        if (!visible) {
          beamEllipses[k].setAttribute("opacity", "0");
          continue;
        }

        const beamProgress = cycleProgress / b.travelFrac; // 0→1

        // Animated positions
        const srcX = NODES[conn.from].x + offsetX[conn.from];
        const srcY = NODES[conn.from].y + offsetY[conn.from];
        const tgtX = NODES[conn.to].x + offsetX[conn.to];
        const tgtY = NODES[conn.to].y + offsetY[conn.to];

        const dx = tgtX - srcX;
        const dy = tgtY - srcY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) { beamEllipses[k].setAttribute("opacity", "0"); continue; }

        const ux = dx / len, uy = dy / len;
        const srcR = NODES[conn.from].r;
        const tgtR = NODES[conn.to].r;

        // Start/end at circle circumference
        const startX = srcX + ux * srcR;
        const startY = srcY + uy * srcR;
        const endX = tgtX - ux * tgtR;
        const endY = tgtY - uy * tgtR;

        // Lerp
        const cx = startX + (endX - startX) * beamProgress;
        const cy = startY + (endY - startY) * beamProgress;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // Dynamic taper: slim at edges, subtle swell at center of journey
        const taperRy = 0.8 + 1.0 * Math.sin(beamProgress * Math.PI);
        // Opacity envelope: graceful fade-in → pulse → fade-out
        const opacityEnv = Math.sin(beamProgress * Math.PI);
        const beamOpacity = 0.12 + 0.28 * opacityEnv;

        beamEllipses[k].setAttribute("cx", cx.toFixed(2));
        beamEllipses[k].setAttribute("cy", cy.toFixed(2));
        beamEllipses[k].setAttribute("ry", taperRy.toFixed(2));
        beamEllipses[k].setAttribute("transform", `rotate(${angle.toFixed(1)},${cx.toFixed(2)},${cy.toFixed(2)})`);
        beamEllipses[k].setAttribute("opacity", beamOpacity.toFixed(3));

        // 4. Node glow — on beam arrival
        if (beamProgress > 0.82) {
          const intensity = (beamProgress - 0.82) / 0.18;
          const targetNode = conn.to;
          glow[targetNode] = Math.max(glow[targetNode], intensity * 0.4);
        }
      }

      // Apply glow to node circles
      for (let i = 0; i < NODES.length; i++) {
        if (glow[i] > 0.001) {
          nodeCircles[i].setAttribute("fill-opacity", (baseFillOpacity[i] + glow[i]).toFixed(3));
          nodeCircles[i].setAttribute("stroke-opacity", (baseStrokeOpacity[i] + glow[i] * 0.5).toFixed(3));
        } else {
          nodeCircles[i].setAttribute("fill-opacity", baseFillOpacity[i].toString());
          nodeCircles[i].setAttribute("stroke-opacity", baseStrokeOpacity[i].toString());
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    let frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1200 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Connection lines */}
      <g stroke="rgba(255,255,255,0.10)" strokeWidth="1">
        {CONNECTIONS.map((c, j) => (
          <line
            key={j}
            id={`conn-${j}`}
            x1={NODES[c.from].x}
            y1={NODES[c.from].y}
            x2={NODES[c.to].x}
            y2={NODES[c.to].y}
          />
        ))}
      </g>

      {/* Beam ellipses */}
      <g>
        {BEAMS.map((_, k) => (
          <ellipse
            key={k}
            id={`beam-${k}`}
            rx="12"
            ry="0.8"
            fill="rgba(255,255,255,0.40)"
            filter="url(#beam-glow)"
            opacity="0"
          />
        ))}
      </g>

      {/* Node groups */}
      {NODES.map((n, i) => (
        <g key={i} id={`node-${i}`}>
          <circle
            id={`node-circle-${i}`}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={n.large ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.10)"}
            stroke={n.large ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.20)"}
            strokeWidth={n.large ? 1.5 : 1}
            fillOpacity={n.large ? 0.15 : 0.10}
            strokeOpacity={n.large ? 0.25 : 0.20}
          />
          {/* Icons inside nodes */}
          {NODE_ICONS[i] === "people" && (
            <g fill="rgba(255,255,255,0.35)">
              <circle cx={n.x - 5} cy={n.y - 7} r="3" />
              <path d={`M${n.x - 10} ${n.y + 2} Q${n.x - 5} ${n.y - 3} ${n.x} ${n.y + 2}`} strokeWidth="0" />
              <circle cx={n.x + 5} cy={n.y - 7} r="3" />
              <path d={`M${n.x} ${n.y + 2} Q${n.x + 5} ${n.y - 3} ${n.x + 10} ${n.y + 2}`} strokeWidth="0" />
            </g>
          )}
          {NODE_ICONS[i] === "briefcase" && (
            <g fill="rgba(255,255,255,0.30)">
              <rect x={n.x - 7} y={n.y - 3} width="14" height="10" rx="1.5" />
              <path d={`M${n.x - 3} ${n.y - 3} L${n.x - 3} ${n.y - 6} L${n.x + 3} ${n.y - 6} L${n.x + 3} ${n.y - 3}`} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.2" />
              <line x1={n.x - 7} y1={n.y + 1} x2={n.x + 7} y2={n.y + 1} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            </g>
          )}
          {NODE_ICONS[i] === "chart" && (
            <g fill="rgba(255,255,255,0.30)">
              <rect x={n.x - 8} y={n.y} width="4" height="8" rx="1" />
              <rect x={n.x - 2} y={n.y - 4} width="4" height="12" rx="1" />
              <rect x={n.x + 4} y={n.y - 8} width="4" height="16" rx="1" />
            </g>
          )}
          {NODE_ICONS[i] === "graduation" && (
            <g fill="rgba(255,255,255,0.30)">
              <polygon points={`${n.x},${n.y - 6} ${n.x + 8},${n.y - 1} ${n.x},${n.y + 3} ${n.x - 8},${n.y - 1}`} />
              <line x1={n.x + 6} y1={n.y} x2={n.x + 6} y2={n.y + 5} stroke="rgba(255,255,255,0.30)" strokeWidth="1" />
              <circle cx={n.x + 6} cy={n.y + 6} r="1" />
            </g>
          )}
          {NODE_ICONS[i] === "resume" && (
            <g>
              <rect x={n.x - 4} y={n.y - 5} width="8" height="10" rx="1" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1" />
              <line x1={n.x - 2} y1={n.y - 2} x2={n.x + 2} y2={n.y - 2} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <line x1={n.x - 2} y1={n.y} x2={n.x + 2} y2={n.y} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <line x1={n.x - 2} y1={n.y + 2} x2={n.x + 1} y2={n.y + 2} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            </g>
          )}
        </g>
      ))}

      {/* Small decorative dots — independent SVG animations */}
      <g fill="rgba(255,255,255,0.22)">
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r}>
            {!(d as any).opacityOnly && (
              <animate attributeName="r" values={`${d.r};${d.rMax};${d.r}`} dur={d.dur} begin={d.begin} repeatCount="indefinite" />
            )}
            {d.hasOpacity && (
              <animate
                attributeName="opacity"
                values={`${(d as any).opacityOnly ? "0.8;0.2;0.8" : "1;0.4;1"}`}
                dur={d.dur}
                begin={d.begin}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </g>
    </svg>
  );
};

// ─── Search Result Type ─────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  name: string;
  logo: string;
  category: string;
}

const HeroSection = ({ products = [] }: HeroSectionProps) => {
  const [topRowPaused, setTopRowPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Parallax transforms for different layers
  const y1 = useTransform(scrollY, [0, 500], [0, 80]);
  const y2 = useTransform(scrollY, [0, 500], [0, 120]);
  const y3 = useTransform(scrollY, [0, 500], [0, 60]);

  // Map DashboardProduct to carousel format and create duplicated arrays for seamless infinite scroll
  const mappedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.product_id,
      product_id: product.product_id,
      image: product.logo,
      category: product.main_category,
      name: product.product_name,
      isVerified: product.is_verified,
    }));
  }, [products]);

  const topRowProducts = useMemo(() => [...mappedProducts, ...mappedProducts], [mappedProducts]);

  // Debounced search — only fetches when user has typed 2+ chars
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await getProducts({
          n: 5,
          page: 1,
          productFilter: searchQuery.trim(),
          vendorFilter: null,
          categoryFilter: null,
          languageFilter: null,
          countryFilter: null,
          tierFilter: null,
        });
        setSearchResults(
          (data ?? []).map((p: any) => ({
            id: p.product_id,
            name: p.product_name,
            logo: p.logo,
            category: p.main_category,
          }))
        );
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowResults(false);
      navigate(`/products${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ""}`);
    }
  };

  return (
    <section className="relative">
      {/* Hero Band */}
      <div ref={heroRef} className="relative h-[65vh] min-h-[550px] max-h-[750px] pt-24">
        {/* Background layers — clipped so gradient/pattern don't overflow */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Background — bright center radial matching logo */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 90% at 50% 40%, hsl(36 95% 62%) 0%, hsl(36 95% 54%) 40%, hsl(36 95% 45%) 100%)',
            }}
          />

          {/* Animated HR Network Pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatedHRNetworkPattern />
          </div>

          {/* Noise/Grain Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Smooth Bottom Transition */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)',
            }}
          />
        </div>

        {/* Hero Content — NOT inside overflow-hidden so search dropdown can extend */}
        <div className="container relative z-20 flex flex-col items-center justify-center text-center px-4 py-2 md:py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3"
          >
            <span className="inline-block bg-white/90 backdrop-blur-sm text-[#111827] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white max-w-4xl leading-tight drop-shadow-sm"
          >
            <span className="block leading-snug">
              {t("hero.title1")}
            </span>
            <span className="block">
              {t("hero.title2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-base md:text-lg text-white/85 max-w-3xl"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 w-full max-w-xl"
          >
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("hero.searchPlaceholder")}
                className="w-full bg-card text-foreground rounded-full py-3.5 pl-14 pr-6 text-base shadow-card focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50"
                  >
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            to={`/products/${result.id}`}
                            onClick={() => setShowResults(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={result.logo} alt={result.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{result.category}</p>
                            </div>
                          </Link>
                        ))}
                        {/* Browse all link */}
                        <Link
                          to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted transition-colors border-t border-border"
                        >
                          {t("products.browseAll")} →
                        </Link>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">{t("products.noProducts")}</p>
                        <Link
                          to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => setShowResults(false)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {t("products.browseAll")} →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Product Carousels - Overlapping into both zones */}
      <div className="relative -mt-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="overflow-hidden"
        >
          {/* Top Row - Scrolls Left to Right */}
          <div
            className="relative"
            onMouseEnter={() => setTopRowPaused(true)}
            onMouseLeave={() => setTopRowPaused(false)}
          >
            <div
              className="flex gap-4 will-change-transform"
              style={{
                animation: 'scroll-left 30s linear infinite',
                animationPlayState: topRowPaused ? 'paused' : 'running',
              }}
            >
              {topRowProducts.map((product, index) => (
                <Link
                  key={`top-${product.product_id}-${index}`}
                  to={`/products/${product.product_id}`}
                  className="flex-shrink-0 group"
                >
                  <div className="w-48 md:w-56 lg:w-64 bg-card rounded-xl overflow-hidden shadow-card border border-border/50 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                    <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Category Label */}
                      <span className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      {product.isVerified && (
                        <span className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                          <BadgeCheck className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar - On normal background */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="container mt-12 pb-12 relative z-10"
      >
        <div className="bg-card rounded-2xl p-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-heading font-bold text-foreground">{t("hero.stat1.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.stat1.desc")}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-heading font-bold text-foreground">{t("hero.stat2.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.stat2.desc")}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-heading font-bold text-foreground">{t("hero.stat3.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.stat3.desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
