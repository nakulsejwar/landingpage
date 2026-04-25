/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import type { LandingPageResponse, LandingSectionRecord, LandingTheme } from "../../lib/landing";

type Props = { page: Pick<LandingPageResponse, "brand_name" | "tagline" | "theme" | "sections" | "page_id"> };

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(t = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t });
    o.observe(el); return () => o.disconnect();
  }, [t]);
  return { ref, v };
}
function useCount(target: string, run: boolean) {
  const [d, setD] = useState("0");
  useEffect(() => {
    if (!run) return;
    const n = parseFloat(target.replace(/[^0-9.]/g, "")), sf = target.replace(/[0-9.]/g, "");
    if (isNaN(n)) { setD(target); return; }
    let raf: number;
    const t0 = performance.now(), dur = 1600;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1), c = Math.round((1 - Math.pow(1 - p, 3)) * n * 10) / 10;
      setD((c % 1 === 0 ? c.toFixed(0) : c.toFixed(1)) + sf);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);
  return d;
}
function useScroll() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => { const d = document.documentElement; setP(d.scrollHeight > d.clientHeight ? d.scrollTop / (d.scrollHeight - d.clientHeight) * 100 : 0); };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return p;
}

// ─── Data helpers ─────────────────────────────────────────────────────────────
const $ = (v: unknown, f = "") => typeof v === "string" ? v : f;
const $a = (v: unknown): string[] => Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : [];
const $o = (v: unknown): Rec[] => Array.isArray(v) ? v.filter((i): i is Rec => !!i && typeof i === "object") : [];
const $m = (d: Rec) => { const m = d.media; return m && typeof m === "object" ? m as Rec : null; };
type Rec = Record<string, unknown>;

// ─── 40 SVG icons ─────────────────────────────────────────────────────────────
const ICONS: Record<string, string[]> = {
  zap:["M13 2L3 14h9l-1 8 10-12h-9z"],shield:["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  lock:["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z","M7 11V7a5 5 0 0110 0v4"],
  chart:["M18 20V10","M12 20V4","M6 20v-6"],trending:["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"],
  users:["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75"],
  target:["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 18a6 6 0 100-12 6 6 0 000 12z","M12 14a2 2 0 100-4 2 2 0 000 4z"],
  rocket:["M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z","M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"],
  globe:["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M2 12h20","M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"],
  cpu:["M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"],
  code:["M16 18l6-6-6-6","M8 6l-6 6 6 6"],terminal:["M4 17l6-6-6-6","M12 19h8"],
  database:["M12 2c5.523 0 8 1.343 8 3s-2.477 3-8 3-8-1.343-8-3 2.477-3 8-3z","M4 5v3c0 1.657 3.582 3 8 3s8-1.343 8-3V5","M4 11v3c0 1.657 3.582 3 8 3s8-1.343 8-3v-3","M4 17v3c0 1.657 3.582 3 8 3s8-1.343 8-3v-3"],
  cloud:["M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"],
  mail:["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  heart:["M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"],
  star:["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  check:["M20 6L9 17l-5-5"],
  bulb:["M9 18h6","M10 22h4","M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"],
  settings:["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  eye:["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"],
  refresh:["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0114.85-3.36L23 10","M1 14l4.64 4.36A9 9 0 0020.49 15"],
  link:["M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71","M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"],
  package:["M16.5 9.4l-9-5.19","M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z","M3.27 6.96L12 12.01l8.73-5.05","M12 22.08V12"],
  activity:["M22 12h-4l-3 9L9 3l-3 9H2"],award:["M12 15a7 7 0 100-14 7 7 0 000 14z","M8.21 13.89L7 23l5-3 5 3-1.21-9.12"],
  map:["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z","M8 2v16","M16 6v16"],
  grid:["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  layers:["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  message:["M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
  bell:["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 01-3.46 0"],
  search:["M11 17.25a6.25 6.25 0 110-12.5 6.25 6.25 0 010 12.5z","M16 16l4.5 4.5"],
  dollar:["M12 1v22","M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"],
  box:["M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"],
  tool:["M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"],
  smile:["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M8 14s1.5 2 4 2 4-2 4-2","M9 9h.01","M15 9h.01"],
  flash:["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  layout:["M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z","M3 9h18","M9 21V9"],
};
function resolveIcon(name: string): string[] {
  if (!name) return ICONS.zap;
  const low = name.toLowerCase().replace(/[^a-z]/g, "");
  if (ICONS[low]) return ICONS[low];
  for (const k of Object.keys(ICONS)) if (low.includes(k) || k.includes(low.slice(0, 4))) return ICONS[k];
  const map: Record<string,string> = { secure:"shield",protect:"shield",fast:"zap",speed:"zap",analytic:"chart",data:"chart",growth:"trending",team:"users",people:"users",collab:"users",ai:"cpu",ml:"cpu",api:"code",dev:"terminal",build:"package",global:"globe",auto:"refresh",sync:"refresh",monitor:"eye",connect:"link",smart:"bulb",idea:"bulb",notify:"bell",find:"search",pay:"dollar",track:"activity",health:"heart",config:"settings" };
  for (const [kw, ic] of Object.entries(map)) if (low.includes(kw)) return ICONS[ic] || ICONS.zap;
  return ICONS.layers;
}
function SvgIcon({ name, size=20, color="currentColor", sw=1.75 }: { name:string; size?:number; color?:string; sw?:number }) {
  const ps = resolveIcon(name);
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>{ps.map((d,i)=><path key={i} d={d}/>)}</svg>;
}

// ─── 8 Font pairs ──────────────────────────────────────────────────────────────
// [import-params, head-family, body-family, head-weight, head-ls]
const FONTS: Record<string,[string,string,string,number,string]> = {
  "glassmorphism dark": ["Bricolage+Grotesque:opsz,wght@12..96,400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600","'Bricolage Grotesque'","'Plus Jakarta Sans'",800,"-.044em"],
  "editorial magazine": ["Fraunces:ital,opsz,wght@0,9..144,300;700;900;1,9..144,700;900&family=Lora:ital,wght@0,400;0,600;1,400","'Fraunces'","'Lora'",900,"-.02em"],
  "brutalist raw":      ["Syne:wght@400;700;800&family=Space+Mono:wght@400;700","'Syne'","'Space Mono'",800,"-.01em"],
  "neon glow electric": ["Space+Mono:wght@400;700&family=Inter:wght@300;400;500","'Space Mono'","'Inter'",700,".02em"],
  "cinematic dark":     ["Outfit:wght@300;400;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300","'Outfit'","'DM Sans'",800,"-.045em"],
  "minimal light":      ["DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600","'DM Serif Display'","'DM Sans'",400,"-.025em"],
  "tech futuristic":    ["Exo+2:ital,wght@0,300;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@300;400;500","'Exo 2'","'JetBrains Mono'",700,"-.03em"],
  "organic warm":       ["Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:wght@300;400;600","'Playfair Display'","'Source Serif 4'",700,"-.01em"],
};
function getFont(vs: string) {
  const low = vs.toLowerCase();
  for (const [k,v] of Object.entries(FONTS)) if (low.includes(k.split(" ")[0])) return v;
  if (low.includes("brutal")) return FONTS["brutalist raw"];
  if (low.includes("edit")||low.includes("magaz")) return FONTS["editorial magazine"];
  if (low.includes("neon")||low.includes("glow")||low.includes("elect")) return FONTS["neon glow electric"];
  if (low.includes("cinem")) return FONTS["cinematic dark"];
  if (low.includes("minim")||low.includes("light")) return FONTS["minimal light"];
  if (low.includes("tech")||low.includes("futur")) return FONTS["tech futuristic"];
  if (low.includes("organ")||low.includes("warm")) return FONTS["organic warm"];
  return FONTS["glassmorphism dark"];
}

// ─── Theme context ─────────────────────────────────────────────────────────────
type TC = { acc:string; hi:string; bg:string; surf:string; text:string; muted:string; border:string; cardBg:string; cardHov:string; isBrut:boolean; isNeon:boolean; isEdit:boolean; isLight:boolean; headFont:string; bodyFont:string; headW:number; headLS:string; fontImp:string };
function mkCtx(t: LandingTheme): TC {
  const vs = (t.visual_style||"").toLowerCase(), bg = t.background_tone||"#020617";
  const isLight = bg.startsWith("#f")||bg.startsWith("#e")||bg==="#fff"||bg==="white"||vs.includes("light")||vs.includes("white");
  const isBrut = vs.includes("brutal")||vs.includes("raw");
  const isNeon = vs.includes("neon")||vs.includes("glow")||vs.includes("elect");
  const isEdit = vs.includes("edit")||vs.includes("magaz");
  const acc = t.accent_color||"#22d3ee", hi = t.highlight_tone||"#a855f7";
  const [fontImp,headFont,bodyFont,headW,headLS] = getFont(vs);
  return { acc, hi, bg, surf:t.surface_tone||"#0f172a", text:isLight?"#0f172a":"#f1f5f9", muted:isLight?"#6b7280":"#94a3b8",
    border:isLight?"rgba(0,0,0,.09)":"rgba(255,255,255,.08)", cardBg:isLight?"rgba(0,0,0,.025)":"rgba(255,255,255,.03)",
    cardHov:isLight?"rgba(0,0,0,.05)":"rgba(255,255,255,.06)", isBrut, isNeon, isEdit, isLight, headFont, bodyFont, headW, headLS, fontImp };
}

// ─── Responsive CSS engine ─────────────────────────────────────────────────────
// ALL layout is done via CSS classes. Inline styles are ONLY for dynamic colors.
function buildCSS(c: TC): string {
  const {acc,hi,bg,surf,text,muted,border,cardBg,cardHov,isBrut,isNeon,isLight,headFont,bodyFont} = c;
  const sh = isLight?".12":".5";
  return `
@import url('https://fonts.googleapis.com/css2?family=${c.fontImp}&display=swap');

/* ── Root ── */
.lpr{--acc:${acc};--hi:${hi};--bg:${bg};--surf:${surf};--text:${text};--mu:${muted};--bd:${border};--cb:${cardBg};--ch:${cardHov};--fh:${headFont},sans-serif;--fb:${bodyFont},sans-serif;background:var(--bg);color:var(--text);font-family:var(--fb);overflow-x:hidden;scroll-behavior:smooth}
.lpr *{box-sizing:border-box}
.lpr a{text-decoration:none}
.lpr button,.lpr input{font-family:var(--fb)}
.lpr img{max-width:100%;height:auto;display:block}

/* ── Scroll animations ── */
.ai,.al,.ar,.as,.aup{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(.16,1,.3,1);transition-duration:.65s}
.ai{transform:translateY(22px)}.al{transform:translateX(-38px)}.ar{transform:translateX(38px)}.as{transform:scale(.9);transition-duration:.58s}.aup{transform:translateY(40px) scale(.95)}
.ai.v,.al.v,.ar.v,.as.v,.aup.v{opacity:1;transform:none}
.d1{transition-delay:0ms}.d2{transition-delay:80ms}.d3{transition-delay:160ms}.d4{transition-delay:240ms}.d5{transition-delay:320ms}.d6{transition-delay:400ms}

/* ── Keyframes ── */
@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}45%{transform:translate(20px,-18px) scale(1.04)}75%{transform:translate(-14px,12px) scale(.97)}}
@keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes pulse{0%,100%{opacity:.8;transform:scale(1)}50%{opacity:.3;transform:scale(1.4)}}
@keyframes glow-p{0%,100%{box-shadow:0 0 0 1px ${acc}44}50%{box-shadow:0 0 0 1px ${acc}aa,0 0 30px ${acc}33}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

/* ── Gradient text ── */
.gt{background:linear-gradient(135deg,var(--acc),var(--hi));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
${isNeon?`.gt{background:linear-gradient(90deg,${acc},${hi},${acc});background-size:200%;animation:shimmer 3s linear infinite;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}`:""}

/* ── Shimmer border ── */
.sbrd{position:relative}.sbrd::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(90deg,var(--acc),var(--hi),var(--acc));background-size:200%;animation:shimmer 3.5s linear infinite;z-index:-1;opacity:.5}

/* ── Glow button ── */
.gbtn{position:relative;overflow:hidden;transition:transform .2s,box-shadow .28s}
.gbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);transform:translateX(-100%);transition:transform .45s}
.gbtn:hover::before{transform:translateX(100%)}
.gbtn:hover{transform:translateY(-2px);box-shadow:0 0 36px ${acc}66,0 8px 28px rgba(0,0,0,.35)}

/* ── Brutalist button ── */
.bb{display:inline-block;border:2px solid var(--text)!important;border-radius:2px!important;padding:12px 28px;font-weight:700;box-shadow:3px 3px 0 var(--text);transition:box-shadow .14s,transform .14s;color:#000;background:var(--acc)}
.bb:hover{box-shadow:5px 5px 0 var(--acc);transform:translate(-1px,-1px)}

/* ── Brutalist card ── */
.bc{border:2px solid var(--text)!important;border-radius:2px!important;box-shadow:4px 4px 0 var(--text);transition:box-shadow .15s}
.bc:hover{box-shadow:6px 6px 0 var(--acc)!important}

/* ── Neon card ── */
.nc{border:1px solid ${acc}44!important;background:${acc}08!important;box-shadow:inset 0 0 30px ${acc}06;transition:border-color .25s,box-shadow .25s}
.nc:hover{border-color:${acc}88!important;box-shadow:inset 0 0 40px ${acc}10,0 0 40px ${acc}18!important}

/* ── 3D card ── */
.c3d{transition:transform .32s cubic-bezier(.16,1,.3,1),box-shadow .32s}
.c3d:hover{transform:perspective(900px) rotateX(-3deg) rotateY(4deg) translateZ(8px);box-shadow:0 28px 70px rgba(0,0,0,${sh})}

/* ── Glow ring ── */
.gring{transition:box-shadow .28s}
.gring:hover{box-shadow:0 0 0 1px ${acc}55,0 0 30px ${acc}14,0 20px 48px rgba(0,0,0,${sh})}

/* ── FAQ ── */
.fqb{max-height:0;overflow:hidden;transition:max-height .38s cubic-bezier(.16,1,.3,1),opacity .28s;opacity:0}
.fqb.open{max-height:600px;opacity:1}

/* ── Marquee ── */
.mq-track{animation:mq 32s linear infinite;display:flex;gap:16px;width:max-content}
.mq-track:hover{animation-play-state:paused}

/* ── Progress bar ── */
.pbar{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--acc),var(--hi));z-index:9999;transition:width .1s;box-shadow:0 0 10px var(--acc)}

/* ── Max width container ── */
.mx{max-width:1280px;margin:0 auto;padding:0 clamp(16px,4vw,32px)}

/* ── Section padding ── */
.sec{padding:clamp(60px,8vw,120px) clamp(16px,4vw,32px)}

/* ── ═══════════════════════════════════════════════ ── */
/* ── RESPONSIVE GRID SYSTEM (all layouts use these) ── */
/* ── ═══════════════════════════════════════════════ ── */

/* Two column equal */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,5vw,80px);align-items:center}
/* Two column 55/45 */
.g2a{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(20px,4vw,60px);align-items:center}
/* Two column text-heavy left */
.g2b{display:grid;grid-template-columns:1.4fr .6fr;gap:clamp(20px,4vw,60px)}
/* Two column 40/60 stats-left */
.g2c{display:grid;grid-template-columns:.42fr 1fr;gap:clamp(24px,5vw,72px);align-items:start}
/* Three column equal */
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,20px)}
/* Four column */
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,1.5vw,16px)}
/* Auto-fill min 280px */
.gauto{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:clamp(14px,2vw,20px)}
/* Six column bento */
.g6{display:grid;grid-template-columns:repeat(6,1fr);gap:clamp(12px,1.5vw,16px)}
/* Two column fixed contact */
.g-contact{display:grid;grid-template-columns:1fr auto;gap:clamp(24px,4vw,56px);align-items:center}
/* Feature table row */
.g-table-row{display:grid;grid-template-columns:52px 1fr 1fr;gap:24px;align-items:center}
/* Side FAQ */
.g-side-faq{display:grid;grid-template-columns:.45fr 1fr;border-radius:inherit}
/* Flex row with wrap */
.flex-wrap{display:flex;flex-wrap:wrap;gap:clamp(10px,2vw,14px)}
/* Stack (flex column) */
.stack{display:flex;flex-direction:column;gap:clamp(10px,2vw,14px)}

/* Card base */
.card{border-radius:${isBrut?"2px":"22px"};background:var(--cb);border:1px solid var(--bd);transition:background .25s;cursor:default}
.card:hover{background:var(--ch)}
.card-p{padding:clamp(18px,2.5vw,28px)}
.card-pl{padding:clamp(24px,4vw,44px)}

/* ── HEADER responsive ── */
.hdr{position:sticky;top:0;z-index:50;transition:background .35s,border-color .35s}
.hdr-inner{max-width:1280px;margin:0 auto;padding:0 clamp(16px,4vw,32px);display:flex;align-items:center;justify-content:space-between;height:68px}
.hdr-nav{display:flex;align-items:center;gap:clamp(16px,2.5vw,28px)}
.hdr-nav-link{font-size:14px;font-weight:${isBrut?"700":"500"};color:var(--mu);transition:color .2s;text-transform:${isBrut?"uppercase":"none"};letter-spacing:${isBrut?".08em":"0"}}
.hdr-nav-link:hover{color:var(--text)}
.hdr-toggle{display:none;background:none;border:1px solid var(--bd);padding:8px 14px;border-radius:8px;color:var(--text);cursor:pointer;font-size:13px}
.hdr-mobile{display:none;padding:16px clamp(16px,4vw,32px) 20px;border-top:1px solid var(--bd)}
.hdr-mobile.open{display:block}
.hdr-mobile a{display:block;padding:10px 0;font-size:15px;color:var(--mu);border-bottom:1px solid var(--bd)}
.hdr-mobile a:hover{color:var(--text)}

/* ── HERO responsive ── */
.hero-sec{position:relative;overflow:hidden;min-height:100vh;display:flex;align-items:center;padding:clamp(80px,10vw,120px) clamp(16px,4vw,32px)}
.hero-inner{max-width:1280px;margin:0 auto;width:100%;position:relative;z-index:1}
.hero-text{max-width:560px}
.hero-h1{font-family:var(--fh);font-size:clamp(2.4rem,6vw,5.2rem);font-weight:${c.headW};line-height:1.02;letter-spacing:${c.headLS};margin:0 0 clamp(16px,2vw,26px);font-style:${c.isEdit?"italic":"normal"}}
.hero-sub{font-size:clamp(15px,2vw,18px);line-height:1.75;color:var(--mu);margin:0 0 clamp(24px,3vw,38px);max-width:520px}
.hero-ctas{display:flex;flex-wrap:wrap;gap:12px}
.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,1.5vw,14px);margin-top:clamp(28px,4vw,44px)}
.hero-media{position:relative}
.hero-media-inner{border-radius:${isBrut?"4px":"26px"};overflow:hidden;position:relative}
.hero-media-glow{position:absolute;inset:-30px;border-radius:50%;filter:blur(40px);z-index:-1}
.hero-ph{height:clamp(280px,35vw,460px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;overflow:hidden;position:relative}

/* ── Orbs ── */
.orb{position:absolute;border-radius:50%;filter:blur(55px);pointer-events:none}
.orb1{top:-15%;left:-5%;width:clamp(300px,45vw,640px);height:clamp(300px,45vw,640px);animation:orb 14s ease-in-out infinite}
.orb2{top:58%;left:68%;width:clamp(250px,38vw,520px);height:clamp(250px,38vw,520px);animation:orb 18s ease-in-out infinite 3s}
.orb3{top:30%;left:35%;width:clamp(150px,22vw,300px);height:clamp(150px,22vw,300px);animation:orb 10s ease-in-out infinite 6s}
.orbs-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}

/* ── Badge ── */
.badge{display:inline-flex;align-items:center;gap:7px;padding:4px 14px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px}
.badge-dot{width:5px;height:5px;border-radius:50%;animation:pulse 2s infinite}
.badge-brut{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:16px;border-left:3px solid var(--acc);padding-left:10px}
.badge-edit{font-size:13px;font-style:italic;color:var(--mu);margin-bottom:14px;font-family:var(--fh)}
.badge-neon{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;display:inline-block;border-bottom:1px solid ${acc}44;padding-bottom:8px}

/* ── Heading ── */
.hdg-h2{font-family:var(--fh);font-size:clamp(1.7rem,3.5vw,2.9rem);font-weight:${c.headW};line-height:1.06;letter-spacing:${c.headLS};margin:0 0 16px;font-style:${c.isEdit?"italic":"normal"};color:var(--text)}
.hdg-h2-xl{font-size:clamp(1.9rem,4.5vw,3.8rem)}
.hdg-desc{font-size:clamp(14px,2vw,17px);line-height:1.75;color:var(--mu)}
.hdg-bar{width:40px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--acc),var(--hi));margin-bottom:20px}
.hdg-bar.center{margin-left:auto;margin-right:auto}

/* ── Stat counter card ── */
.ctr-val{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;font-family:var(--fh);letter-spacing:-.03em}
.ctr-lbl{font-size:12px;color:var(--mu);margin-top:5px;font-weight:500}
.ctr-card{padding:clamp(12px,2vw,18px) 14px;border-radius:${isBrut?"2px":"18px"};text-align:center}

/* ── Icon box ── */
.ibox{display:flex;align-items:center;justify-content:center;margin-bottom:16px;flex-shrink:0}
.ibox-sm{width:44px;height:44px;border-radius:${isBrut?"2px":isNeon?"10px":"12px"}}
.ibox-lg{width:52px;height:52px;border-radius:${isBrut?"2px":isNeon?"12px":"14px"}}

/* ── Media block ── */
.media-wrap{border-radius:${isBrut?"4px":"24px"};overflow:hidden;position:relative}
.media-img{width:100%;height:clamp(240px,30vw,440px);object-fit:cover;display:block}
.media-ph{height:clamp(240px,30vw,440px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px}

/* ── Testimonial card ── */
.tc-stars{display:flex;gap:2px;margin-bottom:14px}
.tc-quote{font-size:clamp(13px,1.8vw,15px);line-height:1.8;font-style:italic;margin-bottom:18px;color:var(--text)}
.tc-quote-lg{font-size:clamp(14px,2vw,17px)}
.tc-bottom{display:flex;align-items:center;gap:12px;border-top:1px solid var(--bd);padding-top:14px}
.tc-avatar{width:36px;height:36px;border-radius:${isBrut?"2px":"50%"};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.tc-name{font-size:13px;font-weight:700;color:var(--text)}
.tc-role{font-size:11px;color:var(--mu)}

/* ── Button base ── */
.btn-primary{display:inline-flex;align-items:center;gap:8px;padding:clamp(11px,1.5vw,14px) clamp(22px,3vw,32px);font-weight:700;font-size:clamp(14px,1.8vw,15px);border:none;cursor:pointer;background:linear-gradient(135deg,var(--acc),var(--hi));color:#000}
.btn-primary:not(.bb){border-radius:100px}
.btn-ghost{display:inline-block;padding:clamp(11px,1.5vw,14px) clamp(22px,3vw,32px);font-weight:600;font-size:clamp(14px,1.8vw,15px);border:1px solid var(--bd);color:var(--text);background:transparent;border-radius:100px;transition:background .25s}
.btn-ghost:hover{background:var(--cb)}
.btn-ghost.brut{border-radius:2px;border-width:2px}

/* ── Divider line ── */
.divider{height:1px;background:var(--bd);margin:0}
.divider-thick{height:2px;background:var(--text);margin:0}

/* ── Footer / contact card ── */
.contact-card{border-radius:${isBrut?"4px":"34px"};padding:clamp(36px,5vw,72px) clamp(24px,5vw,72px);overflow:hidden;position:relative}
.contact-card-inner{position:relative}
.links-panel{padding:clamp(20px,3vw,30px);border-radius:${isBrut?"4px":"22px"};border:1px solid var(--bd);background:var(--cb);min-width:220px}

/* ── Noise overlay ── */
.noise::after{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");pointer-events:none;border-radius:inherit}

/* ── Grid pattern bg ── */
.grid-bg{position:absolute;inset:0;z-index:0;background-image:linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse at 50% 40%,black 15%,transparent 72%)}

/* ── Scrollbar thin ── */
.lpr::-webkit-scrollbar{width:6px}.lpr::-webkit-scrollbar-track{background:var(--bg)}.lpr::-webkit-scrollbar-thumb{background:var(--acc);border-radius:3px}

/* ════════════════════════════════════════════════ */
/* TABLET: 768px and below                          */
/* ════════════════════════════════════════════════ */
@media (max-width:768px){
  .g2,.g2a,.g2b,.g2c{grid-template-columns:1fr!important}
  .g2 .al,.g2a .al,.g2b .al,.g2c .al{transform:none!important;opacity:0}
  .g2 .al.v,.g2a .al.v,.g2b .al.v,.g2c .al.v{opacity:1}
  .g3{grid-template-columns:repeat(2,1fr)!important}
  .g4{grid-template-columns:repeat(2,1fr)!important}
  .g6{grid-template-columns:repeat(2,1fr)!important}
  .g-contact{grid-template-columns:1fr!important}
  .g-table-row{grid-template-columns:40px 1fr!important}
  .g-table-row > *:last-child{display:none}
  .g-side-faq{grid-template-columns:1fr!important}
  .hdr-nav{display:none!important}
  .hdr-toggle{display:flex!important}
  .hero-stats{grid-template-columns:repeat(3,1fr)}
  .hero-text{max-width:100%}
  .contact-card{padding:clamp(24px,5vw,40px)!important}
  .links-panel{min-width:unset;width:100%}
  .hero-sec{min-height:auto!important;padding:clamp(60px,8vw,100px) clamp(16px,4vw,32px) clamp(40px,5vw,60px)}
  .magazine-rule{display:none}
  .two-col-about{grid-template-columns:1fr!important}
  .story-card-overlay{position:relative!important;width:100%!important;height:280px!important;clip-path:none!important}
  .bento-span-4,.bento-span-3,.bento-span-2{grid-column:span 2!important}
  .bento-span-1{grid-column:span 2!important}
  .hero-h1{font-size:clamp(2rem,8vw,3.5rem)!important}
  .hero-big-text{font-size:clamp(2.4rem,9vw,4rem)!important}
  .magazine-h1{font-size:clamp(2.2rem,8vw,3.5rem)!important}
  .hide-tablet{display:none!important}
  .sec{padding:clamp(50px,7vw,80px) clamp(16px,4vw,24px)}
  .numbered-sticky{position:static!important;top:auto!important}
  .side-q-panel{display:none}
  .timeline-line{display:none}
}

/* ════════════════════════════════════════════════ */
/* MOBILE: 480px and below                          */
/* ════════════════════════════════════════════════ */
@media (max-width:480px){
  .g3{grid-template-columns:1fr!important}
  .g4{grid-template-columns:1fr!important}
  .g6{grid-template-columns:1fr!important}
  .gauto{grid-template-columns:1fr!important}
  .hero-stats{grid-template-columns:repeat(${c.isLight?"2":"3"},1fr)}
  .hero-h1{font-size:clamp(1.9rem,9vw,3rem)!important}
  .contact-card{padding:clamp(20px,5vw,32px)!important}
  .two-col-faq{grid-template-columns:1fr!important}
  .magazine-h1{font-size:clamp(1.9rem,9vw,2.8rem)!important}
  .hero-big-text{font-size:clamp(2rem,10vw,3.2rem)!important}
  .ctr-val{font-size:clamp(1.4rem,5vw,1.8rem)!important}
  .hdg-h2{font-size:clamp(1.5rem,6vw,2.2rem)!important}
  .hdg-h2-xl{font-size:clamp(1.6rem,7vw,2.5rem)!important}
  .btn-primary,.btn-ghost{padding:11px 22px!important;font-size:14px!important}
}
`;
}

// ─── Anim wrapper ──────────────────────────────────────────────────────────────
function A({ ch, t="ai", d=0, sx={} }: { ch:React.ReactNode; t?:string; d?:number; sx?:React.CSSProperties }) {
  const { ref, v } = useInView();
  return <div ref={ref} className={`${t} ${v?"v":""} d${Math.min(d/80+1,6)|0}`} style={sx}>{ch}</div>;
}
// ─── Orbs ─────────────────────────────────────────────────────────────────────
function Orbs({ c }: { c: TC }) {
  if (c.isLight) return null;
  return <div className="orbs-wrap">
    <div className="orb orb1" style={{ background: `radial-gradient(circle,${c.acc}18 0%,transparent 70%)` }} />
    <div className="orb orb2" style={{ background: `radial-gradient(circle,${c.hi}16 0%,transparent 70%)` }} />
    <div className="orb orb3" style={{ background: `radial-gradient(circle,${c.acc}14 0%,transparent 70%)` }} />
  </div>;
}
// ─── Progress bar ─────────────────────────────────────────────────────────────
function Pbar() {
  const p = useScroll();
  return <div className="pbar" style={{ width: `${p}%` }} />;
}
// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ text, c }: { text:string; c:TC }) {
  if (!text) return null;
  if (c.isBrut) return <div className="badge-brut" style={{ color: c.acc }}>{text}</div>;
  if (c.isEdit) return <div className="badge-edit">— {text}</div>;
  if (c.isNeon) return <div className="badge-neon" style={{ color: c.acc, borderColor: c.acc + "44", textShadow: `0 0 14px ${c.acc}` }}>{text}</div>;
  return <div className="badge" style={{ border: `1px solid ${c.acc}44`, background: `${c.acc}0f`, color: c.acc }}>
    <span className="badge-dot" style={{ background: c.acc }} />{text}
  </div>;
}
// ─── Icon box ────────────────────────────────────────────────────────────────
function IBox({ name, c, lg=false }: { name:string; c:TC; lg?:boolean }) {
  const sz = lg ? 52 : 44, cls = `ibox ${lg?"ibox-lg":"ibox-sm"}`;
  const iconSz = Math.round(sz * .46);
  if (c.isBrut) return <div className={cls} style={{ border: `2px solid ${c.acc}` }}><SvgIcon name={name} size={iconSz} color={c.acc} sw={2} /></div>;
  if (c.isNeon) return <div className={cls} style={{ border: `1px solid ${c.acc}55`, background: `${c.acc}0e`, animation: "glow-p 3s infinite" }}><SvgIcon name={name} size={iconSz} color={c.acc} sw={1.5} /></div>;
  return <div className={cls} style={{ background: `linear-gradient(135deg,${c.acc}33,${c.hi}22)` }}><SvgIcon name={name} size={iconSz} color={c.acc} sw={1.75} /></div>;
}
// ─── Heading ─────────────────────────────────────────────────────────────────
function Hdg({ ey, ti, de, c, center=false, xl=false }: { ey:string; ti:string; de?:string; c:TC; center?:boolean; xl?:boolean }) {
  return <div style={{ textAlign: center?"center":"left" }}>
    <Badge text={ey} c={c} />
    {!c.isBrut && !c.isEdit && <div className={`hdg-bar${center?" center":""}`} />}
    <h2 className={`hdg-h2${xl?" hdg-h2-xl":""}`}>{ti}</h2>
    {de && <p className="hdg-desc" style={{ maxWidth: center?"560px":"520px", margin: center?"0 auto":"0" }}>{de}</p>}
  </div>;
}
// ─── Counter card ────────────────────────────────────────────────────────────
function Ctr({ value, label, run, c }: { value:string; label:string; run:boolean; c:TC }) {
  const v = useCount(value, run);
  return <div className={`ctr-card ${c.isBrut?"bc":"sbrd"}`} style={{ background: c.isBrut?"transparent":c.cardBg, border: c.isBrut?undefined:`1px solid ${c.border}` }}>
    <div className={`ctr-val${c.isBrut?"":" gt"}`} style={{ color: c.isBrut?c.acc:undefined }}>{v}</div>
    <div className="ctr-lbl">{label}</div>
  </div>;
}
// ─── Media ───────────────────────────────────────────────────────────────────
function Media({ src, alt, h, c }: { src?:string; alt?:string; h?:string; c:TC }) {
  return <div className={`media-wrap${c.isBrut?" bc":""}`}>
    {src ? <img src={src} alt={alt||""} className="media-img" style={h?{height:h,objectFit:"cover"}:{}} />
      : <div className="media-ph" style={{ background: `linear-gradient(135deg,${c.acc}18,${c.hi}12)`, height: h||undefined }}>
          <div style={{ width:64,height:64,borderRadius:16,background:`linear-gradient(135deg,${c.acc},${c.hi})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 40px ${c.acc}55` }}>
            <SvgIcon name="rocket" size={30} color="#000" sw={1.5} />
          </div>
        </div>}
  </div>;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOVER CARD — proper component, useState never inside .map()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HCard({ children, base, hover }: { children: React.ReactNode; base: React.CSSProperties; hover?: React.CSSProperties }) {
  const [h, setH] = useState(false);
  return <div style={{ ...base, ...(h && hover ? hover : {}) }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>{children}</div>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POPUP FORM — triggered by any CTA with onClick={triggerPopup}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PopupForm({ pageId, acc, hi }: { pageId?: string; acc: string; hi: string }) {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<Rec | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!pageId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/`)
      .then(r => r.json()).then(d => { if (d?.fields_config?.length) setCfg(d); }).catch(() => {});
    const h = () => setOpen(true);
    document.addEventListener("open-popup", h);
    return () => document.removeEventListener("open-popup", h);
  }, [pageId]);

  if (!cfg) return null;
  const fields = $o(cfg.fields_config);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ne: Record<string, string> = {};
    fields.forEach(f => { if (f.required && !vals[$(f.label)]?.trim()) ne[$(f.label)] = `${$(f.label)} is required`; });
    if (Object.keys(ne).length) { setErrs(ne); return; }
    setSending(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/submit/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: vals }),
      });
      const data = await r.json();
      if (data.success) setDone(true); else setErrs({ _: data.error || "Failed" });
    } catch { setErrs({ _: "Network error" }); }
    finally { setSending(false); }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "white", outline: "none", fontFamily: "inherit" };

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }} onClick={() => setOpen(false)} />
      <div style={{ position: "relative", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "#0f172a", borderRadius: 24, border: `1px solid ${acc}44`, boxShadow: `0 0 80px ${acc}22,0 40px 100px rgba(0,0,0,.7)`, padding: "clamp(24px,4vw,40px)" }}>
        <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "none", color: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        {done
          ? <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "0 0 10px" }}>Sent!</h3>
              <p style={{ color: "#94a3b8", fontSize: 15 }}>{$(cfg.success_message, "We'll be in touch soon.")}</p>
              <button onClick={() => { setOpen(false); setDone(false); setVals({}); }} style={{ marginTop: 24, padding: "10px 28px", borderRadius: 100, background: `linear-gradient(135deg,${acc},${hi})`, color: "#000", fontWeight: 700, border: "none", cursor: "pointer" }}>Close</button>
            </div>
          : <form onSubmit={submit} noValidate>
              <h3 style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, color: "white", margin: "0 0 8px" }}>{$(cfg.title, "Get In Touch")}</h3>
              {$(cfg.subtitle) && <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 24px" }}>{$(cfg.subtitle)}</p>}
              {fields.map((f, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{$(f.label)}{f.required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}</label>
                  {$(f.type) === "textarea" ? <textarea style={{ ...inp, minHeight: 80, resize: "vertical" as const }} placeholder={$(f.placeholder)} value={vals[$(f.label)] || ""} onChange={e => setVals(v => ({ ...v, [$(f.label)]: e.target.value }))} />
                    : $(f.type) === "dropdown" ? <select style={{ ...inp, cursor: "pointer" }} value={vals[$(f.label)] || ""} onChange={e => setVals(v => ({ ...v, [$(f.label)]: e.target.value }))}><option value="">Select…</option>{$a(f.options).map((o, j) => <option key={j}>{o}</option>)}</select>
                    : <input type={$(f.type) === "phone" ? "tel" : $(f.type) || "text"} style={{ ...inp }} placeholder={$(f.placeholder)} value={vals[$(f.label)] || ""} onChange={e => setVals(v => ({ ...v, [$(f.label)]: e.target.value }))} />}
                  {errs[$(f.label)] && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errs[$(f.label)]}</p>}
                </div>
              ))}
              {errs._ && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13, marginBottom: 14 }}>{errs._}</div>}
              <button type="submit" disabled={sending} style={{ width: "100%", padding: 13, borderRadius: 100, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${acc},${hi})`, color: "#000", opacity: sending ? .7 : 1 }}>{sending ? "Sending…" : $(cfg.submit_label, "Send Message")}</button>
            </form>}
      </div>
    </div>
  );
}


function triggerPopup() { document.dispatchEvent(new Event("open-popup")); }

// ━━━ ROOT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function LandingRenderer({ page }: Props) {
  const ctx = useMemo(() => mkCtx(page.theme), [page.theme]);
  const css = useMemo(() => buildCSS(ctx), [ctx]);
  return <>
    <style dangerouslySetInnerHTML={{ __html: css }} />
    <Pbar />
    <PopupForm pageId={page.page_id} acc={ctx.acc} hi={ctx.hi} />
    <main className="lpr">
      {page.sections.map(sec => <RS key={sec.name} sec={sec} brand={page.brand_name} tagline={page.tagline} ctx={ctx} pageId={page.page_id} />)}
    </main>
  </>;
}

function RS({ sec, brand, tagline, ctx, pageId }: { sec: LandingSectionRecord; brand: string; tagline: string; ctx: TC; pageId?: string }) {
  const d = sec.data || {};
  if ($(d.custom_html)) return <div dangerouslySetInnerHTML={{ __html: $(d.custom_html) }} id={sec.name} />;
  switch (sec.name) {
    case "header":        return <Header d={d} brand={brand} ctx={ctx} />;
    case "hero":          return <Hero d={d} brand={brand} tagline={tagline} ctx={ctx} />;
    case "features":      return <Features d={d} ctx={ctx} />;
    case "about":         return <About d={d} ctx={ctx} />;
    case "testimonials":  return <Testimonials d={d} ctx={ctx} />;
    case "faq":           return <Faq d={d} ctx={ctx} />;
    case "contact":       return <Contact d={d} brand={brand} ctx={ctx} pageId={pageId} />;
    default: return null;
  }
}

// ━━━ HEADER (7 variants) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Header({ d, brand, ctx }: { d: Rec; brand: string; ctx: TC }) {
  const [sc, setSc] = useState(false);
  const [mob, setMob] = useState(false);
  const { acc, hi, isBrut, isNeon, isLight, border } = ctx;
  const nav = $a(d.nav_items).length ? $a(d.nav_items) : ["Features","About","Testimonials","FAQ","Contact"];
  const vt = $(d.nav_variant,"glass");
  useEffect(() => { const f = () => setSc(window.scrollY>40); window.addEventListener("scroll",f,{passive:true}); return ()=>window.removeEventListener("scroll",f); },[]);
  const Cta = () => <a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"9px 22px",borderRadius:isBrut?2:100,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${acc},${hi})`,color:"#000",cursor:"pointer",whiteSpace:"nowrap" as const,display:"inline-block"}}>{$(d.cta_label,"Get Started")}</a>;
  const nl: React.CSSProperties = {fontSize:14,fontWeight:500,color:"var(--mu)",cursor:"pointer"};
  const Logo = () => <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${acc},${hi})`,flexShrink:0}}/><span style={{fontSize:16,fontWeight:700,fontFamily:"var(--fh)"}}>{brand}</span></div>;
  const Mob = () => mob?<div style={{borderTop:`1px solid ${border}`,padding:"16px 24px 20px",background:isLight?"rgba(255,255,255,.97)":"rgba(2,6,23,.97)"}}>{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} onClick={()=>setMob(false)} style={{display:"block",padding:"10px 0",fontSize:15,color:"var(--mu)",borderBottom:`1px solid ${border}`}}>{n}</a>)}<div style={{paddingTop:14}}><Cta/></div></div>:null;
  const bg = sc?(isLight?"rgba(255,255,255,.92)":"rgba(2,6,23,.9)"):"transparent";
  const sticky: React.CSSProperties = {position:"sticky",top:0,zIndex:50,transition:"all .3s"};

  if (vt==="editorial") return <><header style={{borderBottom:`1px solid ${border}`,background:isLight?"rgba(255,255,255,.97)":"rgba(2,6,23,.95)",backdropFilter:"blur(20px)"}}><div style={{maxWidth:1280,margin:"0 auto",padding:"16px clamp(16px,4vw,32px) 14px",textAlign:"center"}}><div style={{fontSize:"clamp(20px,3vw,26px)",fontWeight:900,fontFamily:"var(--fh)",fontStyle:"italic",letterSpacing:"-.03em",marginBottom:12}}>{brand}</div><div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"clamp(16px,2.5vw,28px)",flexWrap:"wrap" as const}}>{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={nl}>{n}</a>)}<Cta/></div></div><Mob/></header></>;

  if (vt==="neon") return <><header style={{...sticky,borderBottom:`1px solid ${acc}22`,background:sc?"rgba(2,6,23,.95)":"transparent",backdropFilter:sc?"blur(20px)":"none"}}><div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}><span style={{fontSize:17,fontWeight:700,fontFamily:"var(--fh)",color:acc,textShadow:`0 0 20px ${acc}88`}}>{brand}</span><nav className="hdr-nav">{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={nl}>{n}</a>)}<a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"8px 20px",border:`1px solid ${acc}`,borderRadius:4,fontSize:13,fontWeight:700,color:acc}}>{$(d.cta_label,"Start")}</a></nav><button className="hdr-toggle" onClick={()=>setMob(!mob)}>☰</button></div><Mob/></header></>;

  if (vt==="brutalist") return <><header style={{borderBottom:"2px solid var(--text)",background:"var(--bg)"}}><div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",height:58}}><span style={{fontSize:18,fontWeight:800,fontFamily:"var(--fh)",borderBottom:`2px solid ${acc}`}}>{brand}</span><nav className="hdr-nav" style={{gap:"clamp(14px,2vw,24px)"}}>{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={{...nl,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:".07em"}}>{n}</a>)}<Cta/></nav><button className="hdr-toggle" onClick={()=>setMob(!mob)}>☰</button></div><Mob/></header></>;

  if (vt==="pill") return <><header style={{...sticky,padding:"14px clamp(16px,4vw,32px)"}}><div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}><Logo/><nav className="hdr-nav" style={{background:isLight?"rgba(0,0,0,.06)":"rgba(255,255,255,.07)",borderRadius:100,padding:"6px 8px",backdropFilter:"blur(20px)",border:`1px solid ${border}`}}>{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={{...nl,padding:"6px 14px",borderRadius:100}}>{n}</a>)}</nav><Cta/><button className="hdr-toggle" onClick={()=>setMob(!mob)}>☰</button></div><Mob/></header></>;

  if (vt==="minimal") return <><header style={{...sticky,background:isLight?"rgba(255,255,255,.97)":"transparent",backdropFilter:"blur(20px)"}}><div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,borderBottom:`1px solid ${border}`}}><span style={{fontSize:15,fontWeight:600,fontFamily:"var(--fh)",letterSpacing:"-.02em"}}>{brand}</span><nav className="hdr-nav" style={{gap:"clamp(14px,2vw,22px)"}}>{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={nl}>{n}</a>)}<a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{fontSize:13,fontWeight:700,color:acc}}>↗ {$(d.cta_label,"Start")}</a></nav><button className="hdr-toggle" onClick={()=>setMob(!mob)}>☰</button></div><Mob/></header></>;

  if (vt==="announcement" && $(d.announcement)) return <><div style={{background:`linear-gradient(90deg,${acc},${hi})`,padding:"8px 16px",textAlign:"center",fontSize:13,fontWeight:600,color:"#000"}}>{$(d.announcement)}</div><header style={{...sticky,borderBottom:`1px solid ${sc?border:"transparent"}`,background:bg,backdropFilter:sc?"blur(20px)":"none"}}><div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}><Logo/><nav className="hdr-nav">{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={nl}>{n}</a>)}<Cta/></nav><button className="hdr-toggle" onClick={()=>setMob(!mob)}>☰</button></div><Mob/></header></>;

  return <><header style={{...sticky,borderBottom:`1px solid ${sc?border:"transparent"}`,background:bg,backdropFilter:sc?"blur(20px)":"none"}}><div style={{maxWidth:1280,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",height:68}}><Logo/><nav className="hdr-nav">{nav.map(n=><a key={n} href={`#${n.toLowerCase()}`} style={nl}>{n}</a>)}<Cta/></nav><button className="hdr-toggle" onClick={()=>setMob(!mob)}>☰</button></div><Mob/></header></>;
}

// ━━━ HERO (9 variants, all structurally distinct) ━━━━━━━━━━━━━
function Hero({ d, brand, tagline, ctx }: { d: Rec; brand: string; tagline: string; ctx: TC }) {
  const {ref,v:iv} = useInView(0.04);
  const stats=$o(d.stats), media=$m(d), layout=$(d.layout_variant,"split-right");
  const {acc,hi,isBrut,isLight,border,cardBg} = ctx;
  const hl=$(d.headline,brand), words=hl.split(" "), sp=Math.ceil(words.length*.52);
  const GW = ({sz="clamp(2.6rem,6vw,5rem)",center=false})=><h1 style={{fontFamily:"var(--fh)",fontSize:sz,fontWeight:ctx.headW,lineHeight:1.02,letterSpacing:ctx.headLS,margin:"0 0 clamp(14px,2.5vw,22px)",textAlign:center?"center":"left"}}>{words.map((w,i)=>i>=sp?<span key={i} className="gt">{w} </span>:<span key={i}>{w} </span>)}</h1>;
  const Sub=({center=false})=><p style={{fontSize:"clamp(15px,1.8vw,18px)",lineHeight:1.78,color:"var(--mu)",maxWidth:520,margin:center?"0 auto clamp(24px,3.5vw,36px)":"0 0 clamp(24px,3.5vw,36px)"}}>{$(d.subheadline)}</p>;
  const Btns=({center=false})=><div style={{display:"flex",gap:12,flexWrap:"wrap" as const,justifyContent:center?"center":"flex-start"}}><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"clamp(12px,1.5vw,14px) clamp(22px,3vw,32px)",borderRadius:isBrut?2:100,fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",background:`linear-gradient(135deg,${acc},${hi})`,color:"#000",boxShadow:`0 0 28px ${acc}44`,display:"inline-flex",alignItems:"center",gap:8}}>{$(d.primary_cta,"Get Started")} {!isBrut&&"→"}</a><a href="#features" style={{padding:"clamp(12px,1.5vw,14px) clamp(22px,3vw,32px)",borderRadius:isBrut?2:100,fontWeight:600,fontSize:"clamp(13px,1.6vw,15px)",border:`1px solid ${border}`,color:"var(--text)",display:"inline-block"}}>{$(d.secondary_cta,"See Features")}</a></div>;
  const Stats=({center=false})=>stats.length>0?<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,gap:"clamp(10px,1.5vw,14px)",marginTop:"clamp(28px,4vw,44px)",...(center?{maxWidth:580,marginLeft:"auto",marginRight:"auto"}:{})}}>{stats.map((st,i)=><Ctr key={i} value={$(st.value)} label={$(st.label)} run={iv} c={ctx}/>)}</div>:null;
  const Img=({h="clamp(300px,38vw,460px)"})=>{const src=$(media?.url);return <div style={{borderRadius:isBrut?4:24,overflow:"hidden"}}>{src?<img src={src} alt={$(media?.alt)} style={{width:"100%",height:h,objectFit:"cover",display:"block"}}/>:<div style={{height:h,background:`linear-gradient(135deg,${acc}22,${hi}14)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:72,height:72,borderRadius:18,background:`linear-gradient(135deg,${acc},${hi})`,display:"flex",alignItems:"center",justifyContent:"center"}}><SvgIcon name="rocket" size={32} color="#000" sw={1.5}/></div></div>}</div>;};
  const pad="clamp(80px,10vw,120px) clamp(16px,4vw,32px)";
  const mw={maxWidth:1280,margin:"0 auto",width:"100%",position:"relative" as const,zIndex:1};
  const Glow=()=><div style={{position:"absolute",inset:"-30px",background:`radial-gradient(ellipse,${acc}1e 0%,${hi}14 60%,transparent 80%)`,filter:"blur(40px)",borderRadius:"50%",zIndex:-1}}/>;

  if (layout==="split-right") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",background:"var(--bg)"}}><Orbs c={ctx}/><div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)",backgroundSize:"60px 60px",maskImage:"radial-gradient(ellipse at 40% 40%,black 15%,transparent 70%)",zIndex:0}}/><div ref={ref} style={{...mw,padding:pad}}><div className="g2"><div className={`al ${iv?"v":""}`}><Badge text={$(d.eyebrow,tagline)} c={ctx}/><GW/><Sub/><Btns/><Stats/></div><div className={`ar ${iv?"v":""} d2`} style={{position:"relative"}}><Glow/><Img/></div></div></div></section>;

  if (layout==="centered") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",background:`radial-gradient(ellipse at 50% 0%,${acc}18,${hi}0a 50%,var(--bg) 70%)`}}><div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(${acc}22 1px,transparent 1px)`,backgroundSize:"32px 32px",opacity:.3,pointerEvents:"none"}}/><div ref={ref} style={{...mw,padding:pad,textAlign:"center",maxWidth:900}}><A t="ai" ch={<Badge text={$(d.eyebrow,tagline)} c={ctx}/>}/><A t="ai" d={60} ch={<GW sz="clamp(3rem,7vw,5.5rem)" center/>}/><A t="ai" d={130} ch={<Sub center/>}/><A t="ai" d={200} ch={<Btns center/>}/><A t="ai" d={280} ch={<Stats center/>}/></div></section>;

  if (layout==="full-bg") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden"}}>{$(media?.url)?<img src={$(media?.url)} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.3)",zIndex:0}}/>:<div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${acc}22,${hi}18)`,zIndex:0}}/>}<div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.8) 0%,rgba(0,0,0,.15) 100%)",zIndex:1}}/><div ref={ref} style={{maxWidth:820,padding:pad,position:"relative",zIndex:2}}><A t="ai" ch={<div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",borderRadius:100,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.1)",fontSize:12,color:"rgba(255,255,255,.9)",marginBottom:20,backdropFilter:"blur(10px)"}}>{$(d.eyebrow,tagline)}</div>}/><A t="ai" d={60} ch={<h1 style={{fontFamily:"var(--fh)",fontSize:"clamp(2.8rem,6.5vw,5.5rem)",fontWeight:ctx.headW,lineHeight:1.01,letterSpacing:ctx.headLS,color:"#fff",margin:"0 0 clamp(18px,2.5vw,28px)"}}>{hl}</h1>}/><A t="ai" d={130} ch={<p style={{fontSize:"clamp(15px,1.8vw,19px)",lineHeight:1.78,color:"rgba(255,255,255,.78)",maxWidth:560,margin:"0 0 clamp(28px,4vw,40px)"}}>{$(d.subheadline)}</p>}/><A t="ai" d={200} ch={<div style={{display:"flex",gap:12,flexWrap:"wrap" as const}}><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"14px 32px",borderRadius:isBrut?2:100,fontWeight:700,fontSize:15,background:acc,color:"#000"}}>{$(d.primary_cta,"Get Started")}</a><a href="#features" style={{padding:"14px 32px",borderRadius:isBrut?2:100,fontWeight:600,fontSize:15,border:"1px solid rgba(255,255,255,.3)",color:"#fff",background:"rgba(255,255,255,.1)",backdropFilter:"blur(10px)"}}>{$(d.secondary_cta,"See More")}</a></div>}/>{stats.length>0&&<A t="ai" d={270} ch={<div style={{display:"flex",gap:"clamp(24px,4vw,48px)",marginTop:"clamp(32px,5vw,56px)",flexWrap:"wrap" as const}}>{stats.map((st,i)=><div key={i}><div style={{fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:800,fontFamily:"var(--fh)",color:acc}}>{$(st.value)}</div><div style={{fontSize:13,color:"rgba(255,255,255,.65)"}}>{$(st.label)}</div></div>)}</div>}/>}</div></section>;

  if (layout==="stacked-showcase") return <section id="hero" style={{position:"relative",overflow:"hidden",background:"var(--bg)"}}><Orbs c={ctx}/><div ref={ref} style={{maxWidth:1280,margin:"0 auto",position:"relative",zIndex:1}}><div style={{textAlign:"center",maxWidth:780,margin:"0 auto",padding:`clamp(80px,10vw,120px) clamp(16px,4vw,32px) clamp(48px,6vw,72px)`}}><A t="ai" ch={<Badge text={$(d.eyebrow,tagline)} c={ctx}/>}/><A t="ai" d={60} ch={<GW sz="clamp(2.6rem,5.5vw,4.8rem)" center/>}/><A t="ai" d={130} ch={<Sub center/>}/><A t="ai" d={200} ch={<Btns center/>}/></div><A t="as" d={300} ch={<div style={{borderRadius:isBrut?"4px 4px 0 0":"26px 26px 0 0",overflow:"hidden",border:`1px solid ${border}`,borderBottom:"none",boxShadow:`0 -20px 80px ${acc}1e`}}>{$(media?.url)?<img src={$(media?.url)} alt={$(media?.alt)} style={{width:"100%",height:"clamp(280px,35vw,500px)",objectFit:"cover",display:"block"}}/>:<div style={{height:"clamp(280px,35vw,500px)",background:`linear-gradient(180deg,${acc}18,${hi}08)`,display:"flex",alignItems:"center",justifyContent:"center"}}><SvgIcon name="globe" size={80} color={acc} sw={1}/></div>}</div>}/>{stats.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${stats.length},1fr)`,background:border,gap:1}}>{stats.map((st,i)=><div key={i} style={{padding:"clamp(16px,2.5vw,28px)",background:"var(--bg)",textAlign:"center"}}><div className="gt" style={{fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:800,fontFamily:"var(--fh)"}}>{$(st.value)}</div><div style={{fontSize:13,color:"var(--mu)",marginTop:4}}>{$(st.label)}</div></div>)}</div>}</div></section>;

  if (layout==="big-text") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",background:"var(--bg)"}}><Orbs c={ctx}/><div ref={ref} style={{...mw,padding:pad}}><A t="ai" ch={<Badge text={$(d.eyebrow,tagline)} c={ctx}/>}/><A t="ai" d={50} ch={<h1 style={{fontFamily:"var(--fh)",fontSize:"clamp(3.5rem,9vw,8.5rem)",fontWeight:ctx.headW,lineHeight:.92,letterSpacing:"-.06em",margin:"0 0 clamp(24px,4vw,48px)"}}>{words.map((w,i)=>i>=sp?<span key={i} className="gt" style={{display:"block"}}>{w}</span>:<span key={i}>{w} </span>)}</h1>}/><div className="g2" style={{alignItems:"start"}}><A t="al" d={120} ch={<><Sub/><Btns/></>}/>{stats.length>0&&<A t="ar" d={160} ch={<div style={{display:"flex",flexDirection:"column" as const,gap:16}}>{stats.map((st,i)=><div key={i} style={{borderTop:`1px solid ${border}`,paddingTop:16}}><div className="gt" style={{fontSize:"clamp(1.8rem,3.5vw,2.8rem)",fontWeight:800,fontFamily:"var(--fh)"}}>{$(st.value)}</div><div style={{fontSize:13,color:"var(--mu)",marginTop:4}}>{$(st.label)}</div></div>)}</div>}/>}</div></div></section>;

  if (layout==="magazine") return <section id="hero" style={{position:"relative",overflow:"hidden",background:"var(--bg)",borderBottom:`1px solid ${border}`}}><div style={{maxWidth:1280,margin:"0 auto",padding:`clamp(40px,6vw,80px) clamp(16px,4vw,32px)`}}><div style={{borderBottom:`2px solid var(--text)`,paddingBottom:"clamp(14px,2vw,22px)",marginBottom:"clamp(24px,4vw,40px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:12}}><span style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".14em",color:"var(--mu)"}}>{$(d.eyebrow,tagline)}</span><span style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".14em",color:"var(--mu)"}}>{new Date().getFullYear()} — Vol. I</span></div><div ref={ref} className="g2" style={{alignItems:"start"}}><div className={`al ${iv?"v":""}`}><h1 style={{fontFamily:"var(--fh)",fontSize:"clamp(2.8rem,7vw,6rem)",fontWeight:ctx.headW,lineHeight:.93,letterSpacing:"-.04em",margin:"0 0 clamp(20px,3vw,32px)",fontStyle:ctx.isEdit?"italic":"normal"}}>{words.map((w,i)=>i>=sp?<span key={i} style={{color:acc}}>{w} </span>:<span key={i}>{w} </span>)}</h1><div style={{borderTop:`2px solid var(--text)`,paddingTop:"clamp(18px,2.5vw,28px)"}}><Sub/><Btns/></div></div><div className={`ar ${iv?"v":""} d2`}><Img h="clamp(300px,40vw,520px)"/>{stats.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,gap:1,background:border,marginTop:16}}>{stats.map((st,i)=><div key={i} style={{padding:"clamp(12px,2vw,18px)",background:"var(--bg)"}}><div style={{fontSize:"clamp(1.4rem,2.5vw,2rem)",fontWeight:800,fontFamily:"var(--fh)",color:acc}}>{$(st.value)}</div><div style={{fontSize:11,color:"var(--mu)",marginTop:3}}>{$(st.label)}</div></div>)}</div>}</div></div></div></section>;

  if (layout==="brut-banner") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",background:"var(--bg)",borderBottom:"2px solid var(--text)",position:"relative",overflow:"hidden"}}><div ref={ref} style={{...mw,padding:pad}}><div style={{borderBottom:"2px solid var(--text)",paddingBottom:"clamp(16px,2.5vw,24px)",marginBottom:"clamp(24px,4vw,40px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:12}}><span style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".16em"}}>{$(d.eyebrow,tagline)}</span><span style={{fontSize:11,color:"var(--mu)"}}>{new Date().getFullYear()}</span></div><div className="g2"><div className={`al ${iv?"v":""}`}><h1 style={{fontFamily:"var(--fh)",fontSize:"clamp(2.8rem,6.5vw,5.5rem)",fontWeight:800,lineHeight:.94,letterSpacing:"-.03em",margin:"0 0 clamp(20px,3.5vw,32px)"}}>{words.map((w,i)=>i>=sp?<span key={i} style={{color:acc}}>{w} </span>:<span key={i}>{w} </span>)}</h1><Sub/><div style={{display:"flex",gap:12,flexWrap:"wrap" as const}}><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"13px 30px",border:`2px solid ${acc}`,fontWeight:700,fontSize:14,background:acc,color:"#000"}}>{$(d.primary_cta,"Get Started")}</a><a href="#features" style={{padding:"13px 30px",border:"2px solid var(--text)",fontWeight:600,fontSize:14,color:"var(--text)"}}>{$(d.secondary_cta,"More")}</a></div></div><div className={`ar ${iv?"v":""} d2`}><div style={{border:"2px solid var(--text)",overflow:"hidden"}}><Img/></div>{stats.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,border:"2px solid var(--text)",borderTop:"none"}}>{stats.map((st,i)=><div key={i} style={{padding:"clamp(12px,2vw,18px)",borderRight:i<stats.length-1?"2px solid var(--text)":"none"}}><div style={{fontSize:"clamp(1.4rem,2.5vw,2rem)",fontWeight:800,fontFamily:"var(--fh)",color:acc}}>{$(st.value)}</div><div style={{fontSize:11,color:"var(--mu)",marginTop:3}}>{$(st.label)}</div></div>)}</div>}</div></div></div></section>;

  if (layout==="neon-frame") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",background:"var(--bg)"}}><div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${acc}18 1px,transparent 1px),linear-gradient(90deg,${acc}18 1px,transparent 1px)`,backgroundSize:"48px 48px",opacity:.35,pointerEvents:"none"}}/><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(600px,90vw)",height:"min(600px,90vw)",borderRadius:"50%",background:`radial-gradient(circle,${acc}14,transparent 70%)`,filter:"blur(60px)",pointerEvents:"none"}}/><div ref={ref} style={{...mw,padding:pad}}><div className="g2"><div className={`al ${iv?"v":""}`}><div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",border:`1px solid ${acc}44`,background:`${acc}0e`,fontSize:11,color:acc,marginBottom:20,letterSpacing:".1em",textTransform:"uppercase" as const}}>{$(d.eyebrow,tagline)}</div><GW/><Sub/><div style={{display:"flex",gap:12,flexWrap:"wrap" as const}}><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"12px 28px",border:`1px solid ${acc}`,borderRadius:4,fontWeight:700,fontSize:14,background:`${acc}18`,color:acc,boxShadow:`0 0 20px ${acc}44`}}>{$(d.primary_cta,"Get Started")}</a><a href="#features" style={{padding:"12px 28px",border:`1px solid ${border}`,borderRadius:4,fontWeight:600,fontSize:14,color:"var(--mu)"}}>{$(d.secondary_cta,"Learn More")}</a></div><Stats/></div><div className={`ar ${iv?"v":""} d2`}><div style={{border:`1px solid ${acc}44`,borderRadius:16,overflow:"hidden",boxShadow:`0 0 60px ${acc}22`}}><Img/></div></div></div></div></section>;

  // diagonal — default fallback
  if (layout==="diagonal") return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",right:0,top:0,width:"48%",height:"100%",background:isLight?`${acc}0d`:`${acc}14`,clipPath:"polygon(10% 0,100% 0,100% 100%,0 100%)"}}/><div ref={ref} style={{...mw,padding:pad}}><div className="g2"><div className={`al ${iv?"v":""}`}><Badge text={$(d.eyebrow,tagline)} c={ctx}/><GW/><Sub/><Btns/><Stats/></div><div className={`ar ${iv?"v":""} d2`} style={{position:"relative"}}><Glow/><Img/></div></div></div></section>;

  // default
  return <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",background:"var(--bg)"}}><Orbs c={ctx}/><div ref={ref} style={{...mw,padding:pad}}><div className="g2"><div className={`al ${iv?"v":""}`}><Badge text={$(d.eyebrow,tagline)} c={ctx}/><GW/><Sub/><Btns/><Stats/></div><div className={`ar ${iv?"v":""} d2`} style={{position:"relative"}}><Glow/><Img/></div></div></div></section>;
}

// ━━━ FEATURE CARD (extracted component) ━━━━━━━━━━━━━━━━━━━━━━
function FCard({it,ctx,lg=false,num}:{it:Rec;ctx:TC;lg?:boolean;num?:number}) {
  const [h,setH]=useState(false);
  const {acc,hi,isBrut,border,cardBg,cardHov}=ctx;
  return <div style={{padding:lg?"clamp(24px,4vw,44px)":"clamp(16px,2.5vw,28px)",borderRadius:isBrut?2:22,background:h?cardHov:cardBg,border:`1px solid ${h?acc+"55":border}`,height:"100%",cursor:"default",transition:"all .25s"}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
    {num!==undefined?<div style={{width:36,height:36,borderRadius:isBrut?2:"50%",background:`linear-gradient(135deg,${acc},${hi})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#000",marginBottom:16}}>{num+1}</div>:<IBox name={$(it.icon)} c={ctx} lg={lg}/>}
    <h3 style={{fontSize:lg?"clamp(17px,2vw,22px)":"clamp(14px,1.8vw,17px)",fontWeight:700,marginBottom:10,color:"var(--text)",fontFamily:"var(--fh)",letterSpacing:"-.02em"}}>{$(it.title)}</h3>
    <p style={{fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.description)}</p>
    {!isBrut&&<div style={{marginTop:14,height:2,borderRadius:1,background:`linear-gradient(90deg,${acc},${hi})`,opacity:h?1:0,transform:h?"scaleX(1)":"scaleX(0)",transformOrigin:"left",transition:"opacity .28s,transform .32s"}}/>}
  </div>;
}

// ━━━ FEATURES (50 structurally distinct variants) ━━━━━━━━━━━━
function Features({d,ctx}:{d:Rec;ctx:TC}) {
  const [tab,setTab]=useState(0);
  const [acc2,setAcc2]=useState(0);
  const items=$o(d.items), layout=$(d.layout_variant,"cards-3");
  const {acc,hi,isBrut,isLight,border,cardBg,cardHov}=ctx;
  const sp="clamp(60px,8vw,120px) clamp(16px,4vw,32px)";
  const H=(c=false)=><A t="ai" sx={{marginBottom:"clamp(32px,5vw,56px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center={c}/>}/>;
  const safe=(n:number)=>Math.max(0,n); // safe array index

  switch(layout) {
    // F1 — 3-column glass cards
    case "cards-3": return <section id="features" style={{padding:sp,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,${acc}09,transparent 60%)`,pointerEvents:"none"}}/><div className="mx">{H()}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*55} ch={<FCard it={it} ctx={ctx}/>}/>)}</div></div></section>;

    // F2 — 2-column wide cards
    case "cards-2": return <section id="features" style={{padding:sp}}><div className="mx">{H()}<div className="g2" style={{gap:"clamp(14px,2vw,20px)"}}>{items.map((it,i)=><A key={i} t="as" d={i*60} ch={<FCard it={it} ctx={ctx}/>}/>)}</div></div></section>;

    // F3 — 4-column compact
    case "cards-4": return <section id="features" style={{padding:sp}}><div className="mx">{H()}<div className="g4">{items.map((it,i)=><A key={i} t="as" d={i*50} ch={<FCard it={it} ctx={ctx}/>}/>)}</div></div></section>;

    // F4 — glass float with hover lift
    case "glass-float": return <section id="features" style={{padding:sp,background:`radial-gradient(ellipse at 50% -20%,${acc}14,transparent 60%)`}}><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*60} ch={<HCard base={{padding:"clamp(20px,3vw,32px)",borderRadius:28,background:isLight?"rgba(255,255,255,.7)":"rgba(255,255,255,.05)",backdropFilter:"blur(20px)",border:`1px solid ${isLight?"rgba(255,255,255,.8)":"rgba(255,255,255,.1)"}`,boxShadow:"0 4px 24px rgba(0,0,0,.1)",cursor:"default"}} hover={{transform:"translateY(-8px)",boxShadow:`0 20px 60px rgba(0,0,0,${isLight?".15":".5"}),0 0 0 1px ${acc}33`}}><IBox name={$(it.icon)} c={ctx} lg/><h3 style={{fontSize:"clamp(15px,1.8vw,18px)",fontWeight:700,marginBottom:10,fontFamily:"var(--fh)",color:"var(--text)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(12px,1.4vw,14px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.description)}</p></HCard>}/>)}</div></div></section>;

    // F5 — spotlight first (big left card)
    case "spotlight-first": return items.length>0?<section id="features" style={{padding:sp,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,${acc}0c,transparent 55%)`,pointerEvents:"none"}}/><div className="mx">{H()}<div className="g2b" style={{alignItems:"stretch"}}><A t="al" ch={<FCard it={items[0]} ctx={ctx} lg/>}/><div className="stack">{items.slice(1).map((it,i)=><A key={i} t="ar" d={i*60} ch={<FCard it={it} ctx={ctx}/>}/>)}</div></div></div></section>:null;

    // F6 — alternating left/right rows
    case "alternating": return <section id="features" style={{padding:sp}}><div className="mx">{H()}<div className="stack">{items.map((it,i)=><A key={i} t={i%2===0?"al":"ar"} ch={<HCard base={{display:"flex",alignItems:"center",gap:"clamp(16px,3vw,28px)",flexDirection:i%2===0?"row":"row-reverse",padding:"clamp(16px,2.5vw,24px)",borderRadius:isBrut?2:16,border:`1px solid ${border}`,background:cardBg,cursor:"default"}} hover={{background:cardHov,borderColor:acc+"44"}}><IBox name={$(it.icon)} c={ctx} lg/><div style={{flex:1}}><h3 style={{fontSize:"clamp(15px,2vw,18px)",fontWeight:700,marginBottom:8,color:"var(--text)",fontFamily:"var(--fh)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(13px,1.5vw,14px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div></HCard>}/>)}</div></div></section>;

    // F7 — numbered list (sticky heading left)
    case "numbered-list": return <section id="features" style={{padding:sp}}><div className="mx"><div className="g2c"><A t="al" sx={{position:"sticky" as any,top:"100px",alignSelf:"start"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} xl/>}/><div className="stack">{items.map((it,i)=><A key={i} t="ar" d={i*60} ch={<FCard it={it} ctx={ctx} num={i}/>}/>)}</div></div></div></section>;

    // F8 — icon row (centered icons, minimal)
    case "icon-row": return <section id="features" style={{padding:sp}}><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*50} ch={<HCard base={{padding:"clamp(18px,3vw,28px) 16px",textAlign:"center",borderRadius:isBrut?2:16,border:`1px solid ${border}`,background:"transparent",cursor:"default"}} hover={{background:cardHov,borderColor:acc+"55"}}><div style={{display:"flex",justifyContent:"center",marginBottom:14}}><IBox name={$(it.icon)} c={ctx}/></div><h3 style={{fontSize:"clamp(13px,1.8vw,15px)",fontWeight:700,color:"var(--text)",marginBottom:8,fontFamily:"var(--fh)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(11px,1.3vw,13px)",lineHeight:1.65,color:"var(--mu)",margin:0}}>{$(it.description)}</p></HCard>}/>)}</div></div></section>;

    // F9 — bento grid (mixed col spans)
    case "bento": return items.length>=4?<section id="features" style={{padding:sp,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,${acc}0a,transparent 60%)`,pointerEvents:"none"}}/><div className="mx">{H()}<div className="g6">{items.map((it,i)=>{const cols=[[3],[3],[2],[2],[2],[6]][Math.min(i,5)][0];return <A key={i} t="as" d={i*55} sx={{gridColumn:`span ${cols}`}} ch={<FCard it={it} ctx={ctx} lg={cols>=3}/>}/>;})}</div></div></section>:null;

    // F10 — feature table (row layout)
    case "feature-table": return <section id="features" style={{padding:sp}}><div className="mx">{H()}<div style={{border:`1px solid ${border}`,borderRadius:isBrut?2:24,overflow:"hidden"}}>{items.map((it,i)=><A key={i} t="ai" d={i*50} ch={<HCard base={{display:"grid",gridTemplateColumns:"52px 1fr 1fr",gap:24,alignItems:"center",padding:"clamp(16px,2.5vw,24px) clamp(20px,3vw,32px)",borderBottom:i<items.length-1?`1px solid ${border}`:"none",cursor:"default"}} hover={{background:cardHov}}><IBox name={$(it.icon)} c={ctx}/><h3 style={{fontSize:"clamp(14px,1.8vw,16px)",fontWeight:700,color:"var(--text)",fontFamily:"var(--fh)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.7,color:"var(--mu)",margin:0}}>{$(it.description)}</p></HCard>}/>)}</div></div></section>;

    // F11 — ticker tape (auto-scrolling pills)
    case "ticker": {const dbl=[...items,...items];return <section id="features" style={{padding:sp,overflow:"hidden"}}><style dangerouslySetInnerHTML={{__html:`@keyframes tk1{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes tk2{from{transform:translateX(-50%)}to{transform:translateX(0)}}`}}/><div className="mx">{H(true)}</div>{[0,1].map(row=><div key={row} style={{overflow:"hidden",marginBottom:row===0?12:0}}><div style={{display:"flex",gap:12,width:"max-content",animation:`${row===0?"tk1":"tk2"} 28s linear infinite`,padding:"4px 0"}}>{dbl.map((it,i)=><div key={i} style={{flexShrink:0,display:"flex",alignItems:"center",gap:12,padding:"clamp(12px,2vw,16px) clamp(16px,2.5vw,24px)",borderRadius:isBrut?2:100,border:`1px solid ${border}`,background:cardBg,whiteSpace:"nowrap" as const}}><IBox name={$(it.icon)} c={ctx}/><span style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",color:"var(--text)",fontFamily:"var(--fh)"}}>{$(it.title)}</span></div>)}</div></div>)}</section>;}

    // F12 — terminal / CLI style
    case "terminal": return <section id="features" style={{padding:sp}}><div className="mx">{H()}<div style={{background:"#0d0d0d",borderRadius:isBrut?4:16,overflow:"hidden",border:`1px solid ${acc}44`}}><div style={{padding:"12px 20px",background:"rgba(255,255,255,.04)",borderBottom:`1px solid ${acc}22`,display:"flex",gap:8,alignItems:"center"}}>{["#ff5f56","#ffbd2e","#27c93f"].map((c,i)=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:c}}/>)}<span style={{fontSize:12,color:"#666",marginLeft:8,fontFamily:"monospace"}}>features.sh</span></div><div style={{padding:"clamp(16px,3vw,32px)"}}>{items.map((it,i)=><A key={i} t="ai" d={i*60} ch={<div style={{marginBottom:"clamp(16px,2.5vw,24px)",fontFamily:"'Fira Code',monospace"}}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{color:acc,fontSize:14,flexShrink:0}}>$ </span><div><div style={{color:"#a6e3a1",fontSize:"clamp(13px,1.6vw,15px)",fontWeight:700,marginBottom:4}}>{$(it.title).toLowerCase().replace(/\s+/g,"_")}</div><div style={{color:"#cdd6f4",fontSize:"clamp(11px,1.3vw,13px)",lineHeight:1.7,opacity:.85}}>{$(it.description)}</div></div></div></div>}/>)}<div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}><span style={{color:acc,fontFamily:"monospace",fontSize:14}}>$ </span><div style={{width:8,height:18,background:acc,animation:"pulse 1.2s infinite"}}/></div></div></div></div></section>;

    // F13 — accordion (click to expand)
    case "accordion-features": return <section id="features" style={{padding:sp}}><div className="mx">{H()}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(20px,4vw,60px)",alignItems:"start"}} className="two-col-about"><div style={{display:"flex",flexDirection:"column" as const,gap:4}}>{items.map((it,i)=><button key={i} onClick={()=>setAcc2(i)} style={{textAlign:"left" as const,padding:"clamp(14px,2vw,20px) clamp(16px,2.5vw,24px)",borderRadius:isBrut?2:14,border:`${acc2===i?"2px":"1px"} solid ${acc2===i?acc:border}`,background:acc2===i?`${acc}12`:cardBg,cursor:"pointer",transition:"all .22s",fontFamily:"var(--fb)"}}><div style={{display:"flex",alignItems:"center",gap:12}}><IBox name={$(it.icon)} c={ctx}/><span style={{fontWeight:700,fontSize:"clamp(14px,1.7vw,16px)",color:acc2===i?"var(--text)":"var(--mu)",fontFamily:"var(--fh)"}}>{$(it.title)}</span><span style={{marginLeft:"auto",color:acc,transform:acc2===i?"rotate(90deg)":"none",transition:"transform .22s"}}>›</span></div></button>)}</div><div style={{position:"sticky",top:100}}>{items[acc2]&&<A t="as" ch={<div style={{padding:"clamp(24px,4vw,40px)",borderRadius:isBrut?4:24,background:`linear-gradient(135deg,${acc}14,${hi}0a)`,border:`1px solid ${acc}33`}}><IBox name={$(items[acc2].icon)} c={ctx} lg/><h3 style={{fontSize:"clamp(18px,2.5vw,26px)",fontWeight:800,marginBottom:"clamp(12px,2vw,16px)",fontFamily:"var(--fh)",color:"var(--text)"}}>{$(items[acc2].title)}</h3><p style={{fontSize:"clamp(14px,1.8vw,16px)",lineHeight:1.8,color:"var(--mu)",margin:0}}>{$(items[acc2].description)}</p></div>}/>}</div></div></div></section>;

    // F14 — tab switcher (horizontal tabs)
    case "tab-switcher": return <section id="features" style={{padding:sp}}><div className="mx">{H(true)}<div style={{display:"flex",gap:"clamp(6px,1vw,10px)",overflowX:"auto",paddingBottom:8,marginBottom:"clamp(20px,3vw,32px)",flexWrap:"wrap" as const}}>{items.map((it,i)=><button key={i} onClick={()=>setTab(i)} style={{flexShrink:0,padding:"clamp(8px,1.5vw,12px) clamp(14px,2vw,20px)",borderRadius:isBrut?2:100,border:`${tab===i?"2px":"1px"} solid ${tab===i?acc:border}`,background:tab===i?`${acc}14`:"transparent",cursor:"pointer",fontFamily:"var(--fb)",fontSize:"clamp(12px,1.5vw,14px)",fontWeight:tab===i?700:500,color:tab===i?acc:"var(--mu)"}}><span style={{display:"flex",alignItems:"center",gap:6}}><SvgIcon name={$(it.icon)} size={14} color={tab===i?acc:"var(--mu)"} sw={2}/>{$(it.title)}</span></button>)}</div>{items[tab]&&<A t="as" ch={<div style={{padding:"clamp(24px,4vw,48px)",borderRadius:isBrut?4:28,background:`linear-gradient(135deg,${acc}14,${hi}0a)`,border:`1px solid ${acc}33`,display:"grid",gridTemplateColumns:"1fr auto",gap:"clamp(20px,4vw,60px)",alignItems:"center"}} className="two-col-about"><div><h3 style={{fontSize:"clamp(20px,3vw,32px)",fontWeight:800,marginBottom:"clamp(12px,2vw,16px)",fontFamily:"var(--fh)",color:"var(--text)"}}>{$(items[tab].title)}</h3><p style={{fontSize:"clamp(14px,1.8vw,17px)",lineHeight:1.8,color:"var(--mu)",margin:0}}>{$(items[tab].description)}</p></div><div style={{width:"clamp(80px,12vw,140px)",height:"clamp(80px,12vw,140px)",borderRadius:isBrut?4:"50%",background:`linear-gradient(135deg,${acc},${hi})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><SvgIcon name={$(items[tab].icon)} size={60} color="#000" sw={1.25}/></div></div>}/>}</div></section>;

    // F15 — numbered magazine (editorial big numbers)
    case "numbered-magazine": return <section id="features" style={{padding:sp}}><div className="mx">{H()}{items.map((it,i)=><A key={i} t="ai" d={i*50} ch={<div style={{display:"flex",gap:"clamp(20px,4vw,60px)",alignItems:"flex-start",paddingBottom:"clamp(24px,4vw,48px)",borderBottom:`1px solid ${border}`,marginBottom:"clamp(24px,4vw,48px)"}}><div style={{fontSize:"clamp(3rem,8vw,7rem)",fontWeight:900,fontFamily:"var(--fh)",lineHeight:.85,color:isLight?`${acc}22`:`${acc}18`,flexShrink:0,minWidth:"clamp(60px,8vw,100px)",userSelect:"none" as const}}>{String(i+1).padStart(2,"0")}</div><div style={{flex:1,paddingTop:"clamp(4px,1vw,12px)"}}><h3 style={{fontSize:"clamp(16px,2.2vw,22px)",fontWeight:800,marginBottom:"clamp(8px,1.2vw,12px)",fontFamily:"var(--fh)",color:"var(--text)",letterSpacing:"-.02em"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(13px,1.6vw,15px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div><div style={{flexShrink:0,paddingTop:8}}><SvgIcon name={$(it.icon)} size={32} color={acc} sw={1.5}/></div></div>}/>)}</div></section>;

    // F16 — split half-screen (dark panel left, cards right)
    case "half-screen": return <section id="features" style={{position:"relative",overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}} className="two-col-about"><div style={{padding:"clamp(60px,8vw,120px) clamp(24px,5vw,72px)",background:`linear-gradient(135deg,${acc}1a,${hi}10)`,display:"flex",flexDirection:"column" as const,justifyContent:"center",minHeight:"clamp(400px,60vh,700px)"}}><A t="al" ch={<><Badge text={$(d.eyebrow)} c={ctx}/><h2 style={{fontFamily:"var(--fh)",fontSize:"clamp(1.8rem,4vw,3.5rem)",fontWeight:ctx.headW,lineHeight:1.05,letterSpacing:ctx.headLS,color:"var(--text)",margin:"0 0 clamp(16px,2.5vw,24px)"}}>{$(d.title)}</h2><p style={{fontSize:"clamp(14px,1.8vw,17px)",lineHeight:1.75,color:"var(--mu)"}}>{$(d.description)}</p><div style={{marginTop:"clamp(24px,3vw,40px)",display:"flex",gap:8,flexWrap:"wrap" as const}}>{items.slice(0,3).map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:100,background:`${acc}18`,border:`1px solid ${acc}33`,fontSize:13,color:acc}}><SvgIcon name={$(it.icon)} size={14} color={acc} sw={2}/>{$(it.title)}</div>)}</div></>}/></div><div style={{padding:"clamp(40px,6vw,80px) clamp(24px,5vw,60px)",display:"flex",flexDirection:"column" as const,gap:"clamp(14px,2vw,20px)",justifyContent:"center"}}>{items.map((it,i)=><A key={i} t="ar" d={i*60} ch={<HCard base={{display:"flex",gap:"clamp(14px,2vw,20px)",alignItems:"flex-start",padding:"clamp(14px,2vw,20px)",borderRadius:isBrut?2:16,background:cardBg,border:`1px solid ${border}`,cursor:"default"}} hover={{background:cardHov,borderColor:acc+"44"}}><IBox name={$(it.icon)} c={ctx}/><div><h3 style={{fontSize:"clamp(14px,1.7vw,16px)",fontWeight:700,marginBottom:6,fontFamily:"var(--fh)",color:"var(--text)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(11px,1.3vw,13px)",lineHeight:1.65,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div></HCard>}/>)}</div></div></section>;

    // F17 — diagonal stripe rows (alternating full-width)
    case "stripe-rows": return (
      <section id="features" style={{ overflow: "hidden" }}>
        {items.map((it, i) => {
          const even = i % 2 === 0;

          const icon = $(it.icon);
          const title = $(it.title);
          const desc = $(it.description);

          return (
            <A
              key={i}
              t={even ? "al" : "ar"}
              ch={
                <div
                  style={{
                    background: even ? cardBg : "transparent",
                    borderTop: `1px solid ${border}`,
                    padding: "clamp(40px,6vw,80px) clamp(16px,4vw,32px)",
                  }}
                >
                  <div
                    style={{
                      maxWidth: 1280,
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      gap: "clamp(32px,5vw,80px)",
                      flexDirection: even ? "row" : "row-reverse",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* LEFT CONTENT */}
                    <div style={{ flex: "1 1 clamp(260px,40vw,480px)" }}>
                      <div
                        style={{
                          width: "clamp(60px,8vw,100px)",
                          height: "clamp(60px,8vw,100px)",
                          borderRadius: isBrut ? 4 : 24,
                          background: `linear-gradient(135deg,${acc},${hi})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "clamp(16px,2.5vw,24px)",
                        }}
                      >
                        <SvgIcon name={icon} size={40} color="#000" sw={1.5} />
                      </div>

                      <h3
                        style={{
                          fontSize: "clamp(20px,3vw,32px)",
                          fontWeight: 800,
                          marginBottom: "clamp(12px,2vw,16px)",
                          fontFamily: "var(--fh)",
                          color: "var(--text)",
                          letterSpacing: "-.03em",
                        }}
                      >
                        {title}
                      </h3>

                      <p
                        style={{
                          fontSize: "clamp(14px,1.8vw,16px)",
                          lineHeight: 1.8,
                          color: "var(--mu)",
                          margin: 0,
                          maxWidth: "clamp(260px,35vw,480px)",
                        }}
                      >
                        {desc}
                      </p>
                    </div>

                    {/* RIGHT VISUAL */}
                    <div
                      style={{
                        flex: "1 1 clamp(200px,30vw,360px)",
                        height: "clamp(160px,20vw,260px)",
                        borderRadius: isBrut ? 4 : 20,
                        background: `linear-gradient(${even ? "135" : "315"}deg,${acc}18,${hi}12)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SvgIcon name={icon} size={80} color={acc} sw={0.75} />
                    </div>
                  </div>
                </div>
              }
            />
          );
        })}
      </section>
    );

    // F18 — stat forward (big numbered items)
    case "stat-forward": return <section id="features" style={{padding:sp,background:isLight?`linear-gradient(135deg,${acc}06,${hi}04)`:`linear-gradient(135deg,${acc}0c,${hi}08)`}}><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="aup" d={i*70} ch={<div style={{textAlign:"center",padding:"clamp(24px,3.5vw,40px) clamp(16px,2.5vw,24px)"}}><div className="gt" style={{fontSize:"clamp(2.5rem,5vw,4.5rem)",fontWeight:900,fontFamily:"var(--fh)",lineHeight:.9,marginBottom:"clamp(12px,2vw,16px)",display:"block"}}>{String(i+1).padStart(2,"0")}</div><div style={{width:40,height:2,background:`linear-gradient(90deg,${acc},${hi})`,margin:"0 auto clamp(12px,2vw,16px)"}}/><h3 style={{fontSize:"clamp(14px,1.8vw,18px)",fontWeight:700,marginBottom:"clamp(8px,1.2vw,12px)",fontFamily:"var(--fh)",color:"var(--text)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(12px,1.4vw,14px)",lineHeight:1.7,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div>}/>)}</div></div></section>;

    // F19 — card with gradient image top
    case "card-image-top": return <section id="features" style={{padding:sp}}><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*60} ch={<HCard base={{borderRadius:isBrut?2:20,border:`1px solid ${border}`,overflow:"hidden",background:cardBg,cursor:"default"}} hover={{borderColor:acc+"44"}}><div style={{height:"clamp(100px,12vw,160px)",background:`linear-gradient(135deg,${acc}${["22","18","14"][i%3]},${hi}${["14","18","22"][i%3]})`,display:"flex",alignItems:"center",justifyContent:"center"}}><SvgIcon name={$(it.icon)} size={48} color={acc} sw={1.25}/></div><div style={{padding:"clamp(16px,2.5vw,24px)"}}><h3 style={{fontSize:"clamp(14px,1.7vw,16px)",fontWeight:700,marginBottom:8,fontFamily:"var(--fh)",color:"var(--text)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(12px,1.4vw,13px)",lineHeight:1.7,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div></HCard>}/>)}</div></div></section>;

    // F20 — sticky scroll (left sticky, right scrolls)
    case "sticky-scroll": return <section id="features" style={{padding:sp}}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(32px,5vw,80px)",alignItems:"start"}} className="two-col-about"><div style={{position:"sticky",top:"clamp(60px,10vw,100px)"}}><A t="al" ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} xl/>}/><div style={{marginTop:"clamp(20px,3vw,32px)",display:"flex",flexWrap:"wrap" as const,gap:8}}>{items.map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:100,border:`1px solid ${border}`,background:cardBg,fontSize:12,color:"var(--mu)"}}><SvgIcon name={$(it.icon)} size={12} color={acc} sw={2}/>{$(it.title)}</div>)}</div></div><div style={{display:"flex",flexDirection:"column" as const,gap:"clamp(16px,2.5vw,24px)"}}>{items.map((it,i)=><A key={i} t="ar" d={i*70} ch={<div style={{padding:"clamp(20px,3vw,32px)",borderRadius:isBrut?4:20,border:`1px solid ${border}`,background:cardBg}}><div style={{display:"flex",gap:"clamp(14px,2vw,20px)",alignItems:"flex-start"}}><div style={{width:48,height:48,borderRadius:isBrut?2:12,background:`linear-gradient(135deg,${acc}33,${hi}22)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><SvgIcon name={$(it.icon)} size={22} color={acc} sw={1.75}/></div><div><h3 style={{fontSize:"clamp(14px,1.8vw,18px)",fontWeight:700,marginBottom:8,fontFamily:"var(--fh)",color:"var(--text)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div></div></div>}/>)}</div></div></div></section>;

    // F21 — before/after comparison
    case "comparison": return <section id="features" style={{padding:sp}}><div className="mx">{H(true)}<div style={{border:`1px solid ${border}`,borderRadius:isBrut?2:24,overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:`1px solid ${border}`}}><div style={{padding:"clamp(16px,2.5vw,24px)",borderRight:`1px solid ${border}`,display:"flex",alignItems:"center",gap:12}}><div style={{width:32,height:32,borderRadius:"50%",background:"rgba(239,68,68,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#ef4444",fontSize:16,fontWeight:700}}>✕</span></div><span style={{fontWeight:700,color:"var(--mu)",fontSize:"clamp(13px,1.6vw,15px)"}}>Without {$(d.title,"this").split(" ")[0]}</span></div><div style={{padding:"clamp(16px,2.5vw,24px)",background:`${acc}08`,display:"flex",alignItems:"center",gap:12}}><div style={{width:32,height:32,borderRadius:"50%",background:`${acc}22`,display:"flex",alignItems:"center",justifyContent:"center"}}><SvgIcon name="check" size={16} color={acc} sw={2.5}/></div><span style={{fontWeight:700,color:acc,fontSize:"clamp(13px,1.6vw,15px)"}}>With {$(d.title,"it").split(" ")[0]}</span></div></div>{items.map((it,i)=><A key={i} t="ai" d={i*45} ch={<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:i<items.length-1?`1px solid ${border}`:"none"}}><div style={{padding:"clamp(14px,2vw,20px) clamp(16px,2.5vw,24px)",borderRight:`1px solid ${border}`,display:"flex",alignItems:"center",gap:10}}><span style={{color:"#ef4444",opacity:.5}}>✕</span><span style={{fontSize:"clamp(12px,1.5vw,14px)",color:"var(--mu)",textDecoration:"line-through",opacity:.6}}>{$(it.description).slice(0,50)}…</span></div><div style={{padding:"clamp(14px,2vw,20px) clamp(16px,2.5vw,24px)",background:`${acc}05`,display:"flex",alignItems:"center",gap:10}}><SvgIcon name="check" size={14} color={acc} sw={2.5}/><span style={{fontSize:"clamp(12px,1.5vw,14px)",color:"var(--text)",fontWeight:500}}>{$(it.title)}</span></div></div>}/>)}</div></div></section>;

    // F22 — neon glow cards (dark bg)
    case "neon-cards": return <section id="features" style={{padding:sp,background:"#050508"}}><style dangerouslySetInnerHTML={{__html:`@keyframes np{0%,100%{box-shadow:0 0 20px ${acc}44,inset 0 0 20px ${acc}08}50%{box-shadow:0 0 40px ${acc}66,inset 0 0 30px ${acc}14}}`}}/><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*60} ch={<HCard base={{padding:"clamp(20px,3vw,32px)",borderRadius:isBrut?2:20,border:`1px solid ${acc}33`,background:`${acc}06`,cursor:"default"}} hover={{borderColor:acc+"88",background:`${acc}12`,animation:"np 2s infinite"}}><div style={{marginBottom:20}}><SvgIcon name={$(it.icon)} size={32} color={acc} sw={1.5}/></div><h3 style={{fontSize:"clamp(14px,1.8vw,17px)",fontWeight:700,marginBottom:10,fontFamily:"var(--fh)",color:"white"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(12px,1.4vw,13px)",lineHeight:1.75,color:"#94a3b8",margin:0}}>{$(it.description)}</p></HCard>}/>)}</div></div></section>;

    // F23 — brutalist grid (stark)
    case "brutalist-grid": return <section id="features" style={{padding:sp,borderTop:"2px solid var(--text)",borderBottom:"2px solid var(--text)"}}><div className="mx"><div style={{borderBottom:"2px solid var(--text)",paddingBottom:"clamp(24px,4vw,40px)",marginBottom:"clamp(24px,4vw,40px)"}}>{H()}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(200px,28vw,320px),1fr))"}}>{items.map((it,i)=><A key={i} t="ai" d={i*50} ch={<HCard base={{padding:"clamp(20px,3vw,32px)",borderRight:`2px solid var(--text)`,borderBottom:`2px solid var(--text)`,cursor:"default"}} hover={{background:`${acc}14`}}><div style={{fontSize:"clamp(24px,4vw,40px)",fontWeight:900,color:acc,fontFamily:"var(--fh)",marginBottom:8,lineHeight:1}}>{String(i+1).padStart(2,"0")}</div><h3 style={{fontSize:"clamp(14px,1.8vw,18px)",fontWeight:800,marginBottom:8,fontFamily:"var(--fh)",color:"var(--text)",textTransform:"uppercase",letterSpacing:"-.01em"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(11px,1.3vw,13px)",lineHeight:1.65,color:"var(--mu)",margin:0}}>{$(it.description)}</p></HCard>}/>)}</div></div></section>;

    // F24 — editorial pull-quote style
    case "editorial-features": return <section id="features" style={{padding:sp,borderTop:`2px solid ${border}`}}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"1fr 3fr",gap:"clamp(32px,5vw,80px)",marginBottom:"clamp(40px,6vw,80px)"}} className="two-col-about"><A t="al" ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} c={ctx}/>}/><A t="ar" ch={<p style={{fontSize:"clamp(1.2rem,2.5vw,1.8rem)",fontFamily:"var(--fh)",lineHeight:1.5,color:"var(--text)",fontWeight:ctx.isEdit?400:600,fontStyle:ctx.isEdit?"italic":"normal",margin:0}}>{$(d.description)}</p>}/></div>{items.map((it,i)=><A key={i} t="ai" d={i*50} ch={<div style={{display:"grid",gridTemplateColumns:"clamp(40px,5vw,60px) 1fr clamp(120px,18vw,200px)",gap:"clamp(16px,3vw,40px)",paddingBottom:"clamp(20px,3vw,32px)",borderBottom:`1px solid ${border}`,marginBottom:"clamp(20px,3vw,32px)",alignItems:"start"}}><div style={{paddingTop:6}}><SvgIcon name={$(it.icon)} size={28} color={acc} sw={1.5}/></div><div><h3 style={{fontSize:"clamp(15px,2vw,20px)",fontWeight:700,marginBottom:"clamp(6px,1vw,10px)",fontFamily:"var(--fh)",color:"var(--text)"}}>{$(it.title)}</h3><p style={{fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div><div style={{textAlign:"right",paddingTop:4}}><span style={{fontSize:"clamp(2rem,5vw,4rem)",fontWeight:900,fontFamily:"var(--fh)",color:`${acc}22`}}>{String(i+1).padStart(2,"0")}</span></div></div>}/>)}</div></section>;

    // F25 — checklist columns (pricing-card style)
    case "checklist-cols": return <section id="features" style={{padding:sp}}><div className="mx">{H(true)}<div className="g3">{[0,1,2].map(col=><A key={col} t="as" d={col*80} ch={<div style={{padding:"clamp(24px,3.5vw,36px)",borderRadius:isBrut?2:24,border:`1px solid ${col===1?acc+"66":border}`,background:col===1?`linear-gradient(135deg,${acc}14,${hi}0a)`:cardBg,position:"relative"}}>{col===1&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(90deg,${acc},${hi})`,color:"#000",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:"0 0 12px 12px",letterSpacing:".08em",textTransform:"uppercase" as const}}>POPULAR</div>}<div style={{marginBottom:24}}><IBox name={$(items[safe(col*2)]?.icon||"check")} c={ctx} lg/><h3 style={{fontFamily:"var(--fh)",fontSize:"clamp(16px,2vw,20px)",fontWeight:800,marginBottom:8,color:"var(--text)"}}>{$(items[safe(col*2)]?.title)}</h3></div><div style={{display:"flex",flexDirection:"column" as const,gap:12}}>{items.slice(safe(col*2),safe(col*2)+2).map((it,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:20,height:20,borderRadius:"50%",background:`${acc}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><SvgIcon name="check" size={12} color={acc} sw={2.5}/></div><p style={{fontSize:"clamp(12px,1.4vw,14px)",lineHeight:1.6,color:"var(--mu)",margin:0}}>{$(it.description)}</p></div>)}</div></div>}/>)}</div></div></section>;

    // F26 — icon dominant (large icon fills card)
    case "icon-dominant": return <section id="features" style={{padding:sp,background:isLight?`${acc}06`:`${acc}07`}}><div className="mx">{H(true)}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,18vw,220px),1fr))",gap:"clamp(2px,0.5vw,4px)"}}>{items.map((it,i)=><A key={i} t="as" d={i*40} ch={<HCard base={{aspectRatio:"1",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",gap:12,background:isLight?"rgba(255,255,255,.6)":"rgba(255,255,255,.03)",border:`1px solid ${border}`,cursor:"default",padding:"clamp(16px,3vw,24px)",textAlign:"center"}} hover={{background:`${acc}18`,borderColor:acc+"44"}}><SvgIcon name={$(it.icon)} size={40} color={acc} sw={1.25}/><span style={{fontSize:"clamp(11px,1.3vw,13px)",fontWeight:700,fontFamily:"var(--fh)",color:"var(--text)",lineHeight:1.3}}>{$(it.title)}</span></HCard>}/>)}</div></div></section>;

    // default fallback
    default: return <section id="features" style={{padding:sp,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,${acc}09,transparent 60%)`,pointerEvents:"none"}}/><div className="mx">{H()}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*55} ch={<FCard it={it} ctx={ctx}/>}/>)}</div></div></section>;
  }
}

// ━━━ ABOUT (14 variants) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function About({d,ctx}:{d:Rec;ctx:TC}) {
  const {ref,v:iv}=useInView();
  const bullets=$a(d.bullets), stats=$o(d.stats), media=$m(d);
  const layout=$(d.layout_variant,"split-media");
  const {acc,hi,isBrut,border,cardBg}=ctx;
  const sp="clamp(60px,8vw,120px) clamp(16px,4vw,32px)";
  const Bl=()=><div style={{display:"flex",flexDirection:"column" as const,gap:"clamp(8px,1.5vw,12px)",margin:"clamp(20px,3vw,28px) 0 clamp(20px,3vw,32px)"}}>{bullets.map((b,i)=><div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:isBrut?"10px 0":"clamp(10px,1.5vw,12px) 16px",borderRadius:isBrut?0:12,borderBottom:isBrut?`1px solid ${border}`:"none",background:isBrut?"none":cardBg,border:isBrut?"none":`1px solid ${border}`}}><SvgIcon name="check" size={16} color={acc} sw={2.5}/><span style={{fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.65,color:"var(--text)"}}>{b}</span></div>)}</div>;
  const St=()=>stats.length>0?<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,gap:"clamp(10px,1.5vw,16px)"}}>{stats.map((st,i)=><Ctr key={i} value={$(st.value)} label={$(st.label)} run={iv} c={ctx}/>)}</div>:null;
  const Im=({h="clamp(280px,35vw,440px)"}:{h?:string})=><div style={{position:"relative"}}><div style={{position:"absolute",inset:"-20px",background:`radial-gradient(ellipse,${acc}14,${hi}10 60%,transparent 80%)`,filter:"blur(30px)",borderRadius:"50%",zIndex:-1}}/><Media src={$(media?.url)} alt={$(media?.alt)} h={h} c={ctx}/></div>;

  switch(layout) {
    case "split-media": return <section id="about" style={{padding:sp}}><div className="mx"><div className="g2 two-col-about" ref={ref}><div className={`al ${iv?"v":""}`}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/><Bl/><St/></div><div className={`ar ${iv?"v":""} d2`}><Im/></div></div></div></section>;
    case "timeline": return <section id="about" style={{padding:sp}}><div className="mx"><A t="ai" sx={{marginBottom:"clamp(32px,5vw,56px)",textAlign:"center"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center/>}/><div style={{position:"relative",maxWidth:800,margin:"0 auto"}}><div style={{position:"absolute",left:"clamp(16px,3vw,20px)",top:0,bottom:0,width:2,background:`linear-gradient(180deg,${acc},${hi})`,opacity:.4}}/>{bullets.map((b,i)=><A key={i} t="ai" d={i*80} ch={<div style={{display:"flex",gap:"clamp(20px,3.5vw,40px)",alignItems:"flex-start",marginBottom:"clamp(24px,4vw,40px)"}}><div style={{width:"clamp(32px,5vw,40px)",height:"clamp(32px,5vw,40px)",borderRadius:"50%",background:`linear-gradient(135deg,${acc},${hi})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,boxShadow:`0 0 20px ${acc}55`}}><span style={{fontSize:13,fontWeight:800,color:"#000"}}>{i+1}</span></div><p style={{fontSize:"clamp(14px,1.8vw,17px)",lineHeight:1.7,color:"var(--text)",margin:"clamp(4px,1vw,8px) 0 0"}}>{b}</p></div>}/>)}</div>{stats.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,gap:"clamp(12px,2vw,16px)",marginTop:"clamp(32px,5vw,56px)"}}>{stats.map((st,i)=><Ctr key={i} value={$(st.value)} label={$(st.label)} run={iv} c={ctx}/>)}</div>}</div></section>;
    case "stats-left": return <section id="about" style={{padding:sp}}><div className="mx"><div className="g2c" ref={ref}><div className={`al ${iv?"v":""}`}>{stats.map((st,i)=><A key={i} t="al" d={i*80} ch={<div style={{padding:"clamp(16px,2.5vw,22px) 0",borderBottom:`1px solid ${border}`}}><div className="gt" style={{fontSize:"clamp(2rem,4vw,2.8rem)",fontWeight:800,fontFamily:"var(--fh)"}}>{$(st.value)}</div><div style={{fontSize:13,color:"var(--mu)",marginTop:5}}>{$(st.label)}</div></div>}/>)}</div><div className={`ar ${iv?"v":""} d2`}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/><Bl/></div></div></div></section>;
    case "full-width-card": return <section id="about" style={{padding:sp}}><div className="mx" ref={ref}><A t="as" ch={<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderRadius:isBrut?4:28,overflow:"hidden",border:`1px solid ${border}`}} className="two-col-about"><div style={{padding:"clamp(32px,5vw,60px) clamp(24px,4vw,52px)",background:cardBg}}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/><Bl/></div><div>{$(media?.url)?<img src={$(media?.url)} alt={$(media?.alt)} style={{width:"100%",height:"100%",minHeight:"clamp(280px,35vw,400px)",objectFit:"cover",display:"block"}}/>:<div style={{height:"100%",minHeight:"clamp(280px,35vw,400px)",background:`linear-gradient(135deg,${acc}18,${hi}12)`,display:"flex",alignItems:"center",justifyContent:"center"}}><St/></div>}</div></div>}/></div></section>;
    case "centered-prose": return <section id="about" style={{padding:sp}}><div style={{maxWidth:860,margin:"0 auto",textAlign:"center",padding:"0 clamp(16px,4vw,32px)"}}><A t="ai" ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center/>}/>{$(media?.url)&&<A t="as" d={100} sx={{margin:"clamp(24px,4vw,48px) 0"}} ch={<Media src={$(media?.url)} alt={$(media?.alt)} h="clamp(200px,28vw,400px)" c={ctx}/>}/>}{stats.length>0&&<A t="ai" d={200} ch={<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,gap:16,marginTop:48}}>{stats.map((st,i)=><Ctr key={i} value={$(st.value)} label={$(st.label)} run={iv} c={ctx}/>)}</div>}/>}</div></section>;
    case "dark-feature-card": return <section id="about" style={{padding:sp}}><div className="mx"><A t="as" ch={<div style={{borderRadius:isBrut?4:32,background:`linear-gradient(135deg,${acc}18,${hi}10)`,border:`1px solid ${acc}33`,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",top:-60,right:-60,width:"clamp(200px,30vw,300px)",height:"clamp(200px,30vw,300px)",borderRadius:"50%",background:`radial-gradient(circle,${acc}22,transparent 70%)`,filter:"blur(40px)",pointerEvents:"none"}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}} className="two-col-about" ref={ref}><div style={{padding:"clamp(32px,5vw,60px) clamp(24px,4vw,52px)"}}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/><Bl/></div><div>{$(media?.url)?<img src={$(media?.url)} alt={$(media?.alt)} style={{width:"100%",height:"100%",minHeight:"clamp(300px,40vw,500px)",objectFit:"cover",display:"block"}}/>:<div style={{height:"100%",minHeight:"clamp(300px,40vw,500px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const,gap:32,padding:48}}>{stats.map((st,i)=><div key={i} style={{textAlign:"center"}}><div className="gt" style={{fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:900,fontFamily:"var(--fh)"}}>{$(st.value)}</div><div style={{fontSize:13,color:"var(--mu)",marginTop:4}}>{$(st.label)}</div></div>)}</div>}</div></div></div>}/></div></section>;
    case "manifesto": return <section id="about" style={{padding:sp,borderTop:`1px solid ${border}`,borderBottom:`1px solid ${border}`}}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"clamp(120px,15vw,200px) 1fr",gap:"clamp(32px,5vw,80px)",alignItems:"start"}} className="two-col-about"><div style={{position:"sticky",top:"clamp(60px,10vw,100px)"}}><Badge text={$(d.eyebrow)} c={ctx}/>{stats.map((st,i)=><div key={i} style={{marginBottom:"clamp(16px,2.5vw,24px)"}}><div className="gt" style={{fontSize:"clamp(1.8rem,3.5vw,2.5rem)",fontWeight:900,fontFamily:"var(--fh)"}}>{$(st.value)}</div><div style={{fontSize:12,color:"var(--mu)"}}>{$(st.label)}</div></div>)}</div><div><A t="ar" ch={<h2 style={{fontFamily:"var(--fh)",fontSize:"clamp(2rem,4.5vw,3.8rem)",fontWeight:ctx.headW,lineHeight:1.05,letterSpacing:ctx.headLS,color:"var(--text)",margin:"0 0 clamp(20px,3vw,32px)",fontStyle:ctx.isEdit?"italic":"normal"}}>{$(d.title)}</h2>}/><A t="ar" d={80} ch={<p style={{fontSize:"clamp(1rem,2vw,1.25rem)",lineHeight:1.8,color:"var(--mu)",marginBottom:"clamp(20px,3vw,32px)"}}>{$(d.description)}</p>}/><div style={{display:"flex",flexDirection:"column" as const,gap:"clamp(8px,1.5vw,14px)"}}>{bullets.map((b,i)=><A key={i} t="ar" d={i*60} ch={<p style={{fontSize:"clamp(13px,1.6vw,16px)",lineHeight:1.7,color:"var(--text)",margin:0,paddingLeft:"clamp(16px,2.5vw,24px)",borderLeft:`2px solid ${acc}55`}}>{b}</p>}/>)}</div></div></div></div></section>;
    case "mosaic": return <section id="about" style={{padding:sp}} ref={ref}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"auto auto",gap:"clamp(10px,1.5vw,16px)"}} className="g3"><div className={`al ${iv?"v":""}`} style={{gridColumn:"1 / 3",padding:"clamp(24px,4vw,48px)",borderRadius:isBrut?4:24,background:`linear-gradient(135deg,${acc}14,${hi}08)`,border:`1px solid ${acc}33`}}><Badge text={$(d.eyebrow)} c={ctx}/><h2 style={{fontFamily:"var(--fh)",fontSize:"clamp(1.8rem,4vw,3rem)",fontWeight:ctx.headW,lineHeight:1.06,letterSpacing:ctx.headLS,color:"var(--text)",margin:"0 0 clamp(12px,2vw,20px)"}}>{$(d.title)}</h2><p style={{fontSize:"clamp(13px,1.6vw,16px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(d.description)}</p></div><div className={`ar ${iv?"v":""} d2`} style={{borderRadius:isBrut?4:24,overflow:"hidden",minHeight:"clamp(200px,28vw,360px)"}}>{$(media?.url)?<img src={$(media?.url)} alt={$(media?.alt)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{height:"100%",background:`linear-gradient(135deg,${acc}22,${hi}18)`}}/>}</div>{stats.slice(0,3).map((st,i)=><A key={i} t="as" d={i*60} ch={<div style={{padding:"clamp(20px,3vw,32px)",borderRadius:isBrut?4:20,border:`1px solid ${border}`,background:cardBg,textAlign:"center"}}><div className="gt" style={{fontSize:"clamp(1.8rem,3.5vw,2.5rem)",fontWeight:900,fontFamily:"var(--fh)"}}>{$(st.value)}</div><div style={{fontSize:13,color:"var(--mu)",marginTop:6}}>{$(st.label)}</div></div>}/>)}</div></div></section>;
    case "counter-showcase": return <section id="about" style={{padding:sp}} ref={ref}><div className="mx"><A t="ai" sx={{textAlign:"center",marginBottom:"clamp(40px,6vw,80px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center/>}/>{stats.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,3)},1fr)`,gap:"clamp(1px,.3vw,2px)",background:border,marginBottom:"clamp(40px,6vw,80px)"}}>{stats.map((st,i)=><div key={i} style={{padding:"clamp(32px,5vw,60px) clamp(20px,3vw,40px)",background:"var(--bg)",textAlign:"center"}}><Ctr value={$(st.value)} label={$(st.label)} run={iv} c={ctx}/></div>)}</div>}<div className="g2 two-col-about"><A t="al" ch={<div style={{display:"flex",flexDirection:"column" as const,gap:"clamp(10px,1.5vw,14px)"}}>{bullets.map((b,i)=><div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"clamp(12px,2vw,16px)",borderRadius:isBrut?2:14,border:`1px solid ${border}`,background:cardBg}}><div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${acc},${hi})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><SvgIcon name="check" size={14} color="#000" sw={2.5}/></div><span style={{fontSize:"clamp(13px,1.6vw,15px)",lineHeight:1.65,color:"var(--text)",paddingTop:3}}>{b}</span></div>)}</div>}/>{$(media?.url)&&<A t="ar" d={100} ch={<Media src={$(media?.url)} alt={$(media?.alt)} h="clamp(200px,25vw,280px)" c={ctx}/>}/>}</div></div></section>;
    case "full-bleed": return <section id="about" style={{position:"relative",overflow:"hidden",minHeight:"clamp(500px,70vh,800px)",display:"flex",alignItems:"center"}}>{$(media?.url)?<img src={$(media?.url)} alt={$(media?.alt)} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.35)"}}/>:<div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${acc}22,${hi}14)`}}/>}<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.2) 60%,transparent 100%)"}}/><div className="mx" style={{position:"relative",zIndex:1,padding:sp}}><div style={{maxWidth:"clamp(300px,45vw,560px)"}}><Badge text={$(d.eyebrow)} c={ctx}/><h2 style={{fontFamily:"var(--fh)",fontSize:"clamp(1.8rem,4.5vw,3.5rem)",fontWeight:ctx.headW,lineHeight:1.06,letterSpacing:ctx.headLS,color:"#fff",margin:"0 0 clamp(16px,2.5vw,24px)"}}>{$(d.title)}</h2><p style={{fontSize:"clamp(14px,1.8vw,17px)",lineHeight:1.75,color:"rgba(255,255,255,.75)",marginBottom:"clamp(20px,3vw,32px)"}}>{$(d.description)}</p><div style={{display:"flex",flexDirection:"column" as const,gap:12}}>{bullets.map((b,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center"}}><SvgIcon name="check" size={16} color={acc} sw={2.5}/><span style={{fontSize:"clamp(13px,1.6vw,15px)",color:"rgba(255,255,255,.85)"}}>{b}</span></div>)}</div></div></div></section>;
    case "story-card": return <section id="about" style={{padding:sp}}><div className="mx"><A t="as" ch={<div ref={ref} style={{borderRadius:isBrut?4:30,padding:"clamp(32px,5vw,60px)",background:cardBg,border:`${isBrut?"2px":"1px"} solid ${border}`,position:"relative",overflow:"hidden"}}>{$(media?.url)&&<div style={{position:"absolute",top:0,right:0,width:"40%",height:"100%",zIndex:0,overflow:"hidden"}}><img src={$(media?.url)} alt={$(media?.alt)} style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${ctx.isLight?"rgba(255,255,255,1)":"var(--bg)"} 0%,transparent 40%)`}}/></div>}<div style={{position:"relative",zIndex:1,maxWidth:"55%"}}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/><Bl/><St/></div></div>}/></div></section>;
    default: return <section id="about" style={{padding:sp}}><div className="mx"><div className="g2 two-col-about" ref={ref}><div className={`al ${iv?"v":""}`}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/><Bl/><St/></div><div className={`ar ${iv?"v":""} d2`}><Im/></div></div></div></section>;
  }
}

// ━━━ TESTIMONIAL CARD (extracted) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TCard({item,big=false,ctx}:{item:Rec;big?:boolean;ctx:TC}) {
  const [h,setH]=useState(false);
  const {acc,hi,isBrut,border,cardBg,cardHov}=ctx;
  return <div style={{padding:big?"clamp(20px,3vw,36px)":"clamp(14px,2.5vw,24px)",borderRadius:isBrut?2:22,height:"100%",cursor:"default",background:h?cardHov:cardBg,border:`1px solid ${h&&!isBrut?acc+"44":border}`,transition:"all .25s"}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
    <div style={{display:"flex",gap:2,marginBottom:14}}>{[1,2,3,4,5].map(s=><SvgIcon key={s} name="star" size={13} color={acc}/>)}</div>
    <p style={{fontSize:big?"clamp(14px,1.8vw,17px)":"clamp(12px,1.5vw,14px)",lineHeight:1.8,color:"var(--text)",fontStyle:"italic",marginBottom:18}}>&ldquo;{$(item.quote)}&rdquo;</p>
    <div style={{display:"flex",alignItems:"center",gap:12,borderTop:`1px solid ${border}`,paddingTop:14}}>
      <div style={{width:36,height:36,borderRadius:isBrut?2:"50%",background:`linear-gradient(135deg,${acc}99,${hi}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>{$(item.name,"?")[0].toUpperCase()}</div>
      <div><div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{$(item.name)}</div><div style={{fontSize:11,color:"var(--mu)"}}>{$(item.role)}{item.company?` · ${$(item.company)}`:""}</div></div>
    </div>
  </div>;
}

// ━━━ TESTIMONIALS (10 variants) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Testimonials({d,ctx}:{d:Rec;ctx:TC}) {
  const items=$o(d.items), layout=$(d.layout_variant,items.length>=5?"marquee":"grid");
  const {acc,hi,border,cardBg,isBrut}=ctx;
  const sp="clamp(60px,8vw,120px) clamp(16px,4vw,32px)";
  const H=(c=false)=><A t="ai" sx={{marginBottom:"clamp(32px,5vw,56px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center={c}/>}/>;

  switch(layout) {
    case "grid": return <section id="testimonials" style={{padding:sp,position:"relative"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 100%,${hi}0a,transparent 60%)`,pointerEvents:"none"}}/><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*75} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></section>;
    case "marquee":{const dbl=[...items,...items];return <section id="testimonials" style={{padding:`${sp} 0`,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 100%,${hi}0b,transparent 60%)`,pointerEvents:"none"}}/><div className="mx" style={{paddingBottom:"clamp(32px,5vw,56px)"}}>{H()}</div><div style={{overflow:"hidden"}}><div style={{display:"flex",gap:16,width:"max-content",animation:"mq 32s linear infinite",padding:"6px 18px"}} onMouseEnter={e=>(e.currentTarget.style.animationPlayState="paused")} onMouseLeave={e=>(e.currentTarget.style.animationPlayState="running")}>{dbl.map((it,i)=><div key={i} style={{width:"clamp(280px,28vw,360px)",flexShrink:0}}><TCard item={it} ctx={ctx}/></div>)}</div></div></section>;}
    case "spotlight": return items.length>0?<section id="testimonials" style={{padding:sp}}><div className="mx">{H()}<div className="g2a" style={{alignItems:"stretch"}}><A t="al" ch={<TCard item={items[0]} big ctx={ctx}/>}/><div className="stack">{items.slice(1).map((it,i)=><A key={i} t="ar" d={i*70} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></div></section>:null;
    case "stacked": return <section id="testimonials" style={{padding:sp}}><div style={{maxWidth:840,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)"}}>{H(true)}<div className="stack">{items.map((it,i)=><A key={i} t="as" d={i*65} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></section>;
    case "masonry": return <section id="testimonials" style={{padding:sp}}><div className="mx">{H(true)}<div style={{columns:3,columnGap:"clamp(12px,2vw,18px)"}}>{items.map((it,i)=><A key={i} t="as" d={i*60} sx={{breakInside:"avoid" as any,marginBottom:"clamp(12px,2vw,18px)",display:"block"}} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></section>;
    case "quote-large": return items.length>0?<section id="testimonials" style={{padding:sp,background:`linear-gradient(135deg,${acc}0a,${hi}06)`}}><div style={{maxWidth:900,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)",textAlign:"center"}}><A t="ai" ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} c={ctx} center/>}/><A t="as" d={100} ch={<div style={{padding:"clamp(32px,5vw,60px) 0"}}><div style={{fontSize:"clamp(60px,10vw,100px)",lineHeight:.8,color:acc,fontFamily:"var(--fh)",marginBottom:"clamp(16px,3vw,28px)",opacity:.4}}>&ldquo;</div><p style={{fontSize:"clamp(1.2rem,2.5vw,2rem)",lineHeight:1.5,color:"var(--text)",fontFamily:"var(--fh)",fontStyle:"italic",marginBottom:"clamp(24px,4vw,40px)"}}>{$(items[0].quote)}</p><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16}}><div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${acc},${hi})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#000"}}>{$(items[0].name,"?")[0]}</div><div style={{textAlign:"left"}}><div style={{fontWeight:700,color:"var(--text)",fontSize:"clamp(14px,1.8vw,16px)"}}>{$(items[0].name)}</div><div style={{fontSize:13,color:"var(--mu)"}}>{$(items[0].role)}</div></div></div></div>}/>{items.length>1&&<div className="g3" style={{marginTop:"clamp(24px,4vw,40px)"}}>{items.slice(1).map((it,i)=><A key={i} t="as" d={i*70} ch={<TCard item={it} ctx={ctx}/>}/>)}</div>}</div></section>:null;
    case "side-by-side": return <section id="testimonials" style={{padding:sp}}><div className="mx">{H(true)}<div className="g2" style={{alignItems:"stretch",marginBottom:"clamp(12px,2vw,18px)"}}>{items.slice(0,2).map((it,i)=><A key={i} t={i===0?"al":"ar"} d={i*80} ch={<TCard item={it} big ctx={ctx}/>}/>)}</div>{items.length>2&&<div className="gauto">{items.slice(2).map((it,i)=><A key={i} t="as" d={i*55} ch={<TCard item={it} ctx={ctx}/>}/>)}</div>}</div></section>;
    case "logo-wall": return <section id="testimonials" style={{padding:sp}}><div className="mx"><A t="ai" sx={{marginBottom:"clamp(24px,4vw,48px)",textAlign:"center"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center/>}/><div style={{display:"flex",justifyContent:"center",gap:"clamp(24px,4vw,48px)",flexWrap:"wrap" as const,marginBottom:"clamp(32px,5vw,56px)",opacity:.5}}>{items.map((it,i)=><div key={i} style={{fontSize:"clamp(13px,1.8vw,16px)",fontWeight:800,fontFamily:"var(--fh)",color:"var(--text)",letterSpacing:"-.02em",whiteSpace:"nowrap" as const}}>{$(it.company,$(it.name))}</div>)}</div><div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*75} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></section>;
    case "split-panel": return <section id="testimonials" style={{overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"clamp(260px,30vw,380px) 1fr"}} className="two-col-about"><div style={{padding:"clamp(48px,7vw,80px) clamp(24px,4vw,48px)",background:`linear-gradient(135deg,${acc}1a,${hi}10)`,display:"flex",flexDirection:"column" as const,justifyContent:"center"}}><Badge text={$(d.eyebrow)} c={ctx}/><h2 style={{fontFamily:"var(--fh)",fontSize:"clamp(1.6rem,3.5vw,2.8rem)",fontWeight:ctx.headW,lineHeight:1.06,letterSpacing:ctx.headLS,color:"var(--text)",margin:"0 0 clamp(12px,2vw,20px)"}}>{$(d.title)}</h2><p style={{fontSize:"clamp(13px,1.6vw,15px)",lineHeight:1.75,color:"var(--mu)"}}>{$(d.description)}</p><div style={{marginTop:"clamp(20px,3vw,32px)",display:"flex",gap:4}}>{[1,2,3,4,5].map(s=><SvgIcon key={s} name="star" size={20} color={acc}/>)}</div></div><div style={{padding:"clamp(32px,5vw,60px) clamp(24px,4vw,40px)",display:"flex",flexDirection:"column" as const,gap:"clamp(14px,2vw,20px)"}}>{items.map((it,i)=><A key={i} t="ar" d={i*60} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></section>;
    default: return <section id="testimonials" style={{padding:sp,position:"relative"}}><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 100%,${hi}0a,transparent 60%)`,pointerEvents:"none"}}/><div className="mx">{H(true)}<div className="g3">{items.map((it,i)=><A key={i} t="as" d={i*75} ch={<TCard item={it} ctx={ctx}/>}/>)}</div></div></section>;
  }
}

// ━━━ FAQ (7 variants) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Faq({d,ctx}:{d:Rec;ctx:TC}) {
  const items=$o(d.items), layout=$(d.layout_variant,"accordion");
  const [open,setOpen]=useState<number|null>(0);
  const [tabQ,setTabQ]=useState(0);
  const {acc,hi,isBrut,border,cardBg,cardHov}=ctx;
  const sp="clamp(60px,8vw,120px) clamp(16px,4vw,32px)";
  const AI=({item,i}:{item:Rec;i:number})=>{const isO=open===i;return <A t="ai" d={i*45} ch={<div style={{borderRadius:isBrut?2:16,border:`${isBrut?"2px":"1px"} solid ${isO?acc+"55":border}`,overflow:"hidden",marginBottom:10,background:isO&&!isBrut?cardBg:"transparent",transition:"border-color .25s"}}><button onClick={()=>setOpen(isO?null:i)} style={{width:"100%",padding:"clamp(14px,2vw,18px) clamp(16px,2.5vw,22px)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",textAlign:"left" as const,gap:14,fontFamily:"var(--fb)"}}><span style={{fontSize:"clamp(13px,1.7vw,15px)",fontWeight:600,color:"var(--text)",fontFamily:"var(--fh)"}}>{$(item.question)}</span><span style={{width:26,height:26,borderRadius:isBrut?2:"50%",background:isO?`linear-gradient(135deg,${acc},${hi})`:cardBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:isO?"#000":"var(--mu)",flexShrink:0,transition:"all .25s",transform:isO?"rotate(45deg)":"none"}}>+</span></button><div className={`fqb ${isO?"open":""}`}><p style={{padding:"0 clamp(16px,2.5vw,22px) clamp(14px,2vw,18px)",fontSize:"clamp(13px,1.6vw,15px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(item.answer)}</p></div></div>}/>;};

  switch(layout) {
    case "accordion": return <section id="faq" style={{padding:sp}}><div style={{maxWidth:760,margin:"0 auto"}}><A t="ai" sx={{marginBottom:"clamp(28px,4.5vw,52px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/>}/>{items.map((it,i)=><AI key={i} item={it} i={i}/>)}</div></section>;
    case "two-column": return <section id="faq" style={{padding:sp}}><div style={{maxWidth:1180,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)"}}><A t="ai" sx={{marginBottom:"clamp(28px,4.5vw,52px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center/>}/><div className="g2 two-col-faq">{items.map((it,i)=><AI key={i} item={it} i={i}/>)}</div></div></section>;
    case "side-question": return <section id="faq" style={{padding:sp}}><div className="mx"><A t="ai" sx={{marginBottom:"clamp(28px,4.5vw,52px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/>}/><div style={{display:"grid",gridTemplateColumns:"clamp(200px,30vw,340px) 1fr",border:`1px solid ${border}`,borderRadius:isBrut?4:24,overflow:"hidden"}} className="g-side-faq"><div style={{borderRight:`1px solid ${border}`,background:cardBg}}>{items.map((it,i)=><button key={i} onClick={()=>setTabQ(i)} style={{width:"100%",padding:"clamp(14px,2vw,18px) clamp(16px,2.5vw,24px)",textAlign:"left" as const,background:tabQ===i?cardHov:"transparent",border:"none",borderBottom:`1px solid ${border}`,cursor:"pointer",borderLeft:tabQ===i?`3px solid ${acc}`:"3px solid transparent",fontFamily:"var(--fb)"}}><span style={{fontSize:"clamp(12px,1.5vw,14px)",fontWeight:tabQ===i?700:500,color:tabQ===i?"var(--text)":"var(--mu)",fontFamily:"var(--fh)"}}>{$(it.question)}</span></button>)}</div><div style={{padding:"clamp(24px,4vw,40px)"}}>{items[tabQ]&&<A t="ai" ch={<><h3 style={{fontSize:"clamp(16px,2vw,20px)",fontWeight:700,color:"var(--text)",fontFamily:"var(--fh)",marginBottom:16}}>{$(items[tabQ].question)}</h3><p style={{fontSize:"clamp(14px,1.8vw,16px)",lineHeight:1.8,color:"var(--mu)"}}>{$(items[tabQ].answer)}</p></>}/>}</div></div></div></section>;
    case "numbered-accordion": return <section id="faq" style={{padding:sp}}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(32px,5vw,80px)"}} className="two-col-about"><A t="al" sx={{alignSelf:"start",position:"sticky" as any,top:"clamp(60px,10vw,100px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} xl/>}/><div>{items.map((it,i)=>{const isO=open===i;return <A key={i} t="ar" d={i*55} ch={<div style={{borderBottom:`1px solid ${border}`}}><button onClick={()=>setOpen(isO?null:i)} style={{width:"100%",padding:"clamp(16px,2.5vw,22px) 0",display:"flex",alignItems:"center",gap:20,background:"none",border:"none",cursor:"pointer",textAlign:"left" as const,fontFamily:"var(--fb)"}}><span style={{fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:900,color:isO?acc:`${acc}33`,fontFamily:"var(--fh)",minWidth:"clamp(36px,5vw,52px)",transition:"color .25s"}}>0{i+1}</span><span style={{fontSize:"clamp(14px,1.8vw,16px)",fontWeight:600,color:"var(--text)",flex:1}}>{$(it.question)}</span><span style={{color:"var(--mu)",transform:isO?"rotate(45deg)":"none",transition:"transform .25s",fontSize:20}}>+</span></button><div className={`fqb ${isO?"open":""}`}><p style={{padding:"0 0 clamp(14px,2vw,20px) clamp(48px,7vw,72px)",fontSize:"clamp(13px,1.6vw,15px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.answer)}</p></div></div>}/>;})}</div></div></div></section>;
    case "minimal-list": return <section id="faq" style={{padding:sp}}><div style={{maxWidth:760,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)"}}><A t="ai" sx={{marginBottom:"clamp(28px,4.5vw,52px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/>}/>{items.map((it,i)=>{const isO=open===i;return <A key={i} t="ai" d={i*40} ch={<div style={{borderTop:i===0?"2px solid var(--text)":`1px solid ${border}`}}><button onClick={()=>setOpen(isO?null:i)} style={{width:"100%",padding:"clamp(16px,2.5vw,20px) 0",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--fb)"}}><span style={{fontSize:"clamp(14px,2vw,16px)",fontWeight:600,color:"var(--text)",fontFamily:"var(--fh)",textAlign:"left" as const}}>{$(it.question)}</span><span style={{color:acc,fontSize:22,flexShrink:0,transform:isO?"rotate(45deg)":"none",transition:"transform .25s"}}>+</span></button><div className={`fqb ${isO?"open":""}`}><p style={{paddingBottom:"clamp(14px,2vw,20px)",fontSize:"clamp(13px,1.6vw,15px)",lineHeight:1.75,color:"var(--mu)",margin:0}}>{$(it.answer)}</p></div></div>}/>;})}<div style={{borderTop:"2px solid var(--text)"}}/></div></section>;
    case "cards-grid": return <section id="faq" style={{padding:sp}}><div className="mx"><A t="ai" sx={{marginBottom:"clamp(28px,4.5vw,52px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center/>}/><div className="g2">{items.map((it,i)=><A key={i} t="as" d={i*55} ch={<HCard base={{padding:"clamp(18px,3vw,28px)",borderRadius:isBrut?2:20,background:cardBg,border:`1px solid ${border}`,cursor:"default"}} hover={{background:cardHov,borderColor:acc+"44"}}><div style={{fontSize:"clamp(1.4rem,3vw,2rem)",fontWeight:900,fontFamily:"var(--fh)",color:acc,marginBottom:10}}>Q{i+1}</div><h3 style={{fontSize:"clamp(13px,1.7vw,15px)",fontWeight:700,color:"var(--text)",marginBottom:8,fontFamily:"var(--fh)"}}>{$(it.question)}</h3><p style={{fontSize:"clamp(12px,1.4vw,14px)",lineHeight:1.7,color:"var(--mu)",margin:0}}>{$(it.answer)}</p></HCard>}/>)}</div></div></section>;
    default: return <section id="faq" style={{padding:sp}}><div style={{maxWidth:760,margin:"0 auto"}}><A t="ai" sx={{marginBottom:"clamp(28px,4.5vw,52px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx}/>}/>{items.map((it,i)=><AI key={i} item={it} i={i}/>)}</div></section>;
  }
}

// ━━━ CONTACT (8 variants + inline form embed) ━━━━━━━━━━━━━━━━
function Contact({d,brand,ctx,pageId}:{d:Rec;brand:string;ctx:TC;pageId?:string}) {
  const links=$o(d.links), layout=$(d.layout_variant,"split");
  const {acc,hi,isBrut,isLight,border,cardBg}=ctx;
  const yr=new Date().getFullYear();
  const sp="clamp(60px,8vw,120px) clamp(16px,4vw,32px)";

  // ── Inline contact form ────────────────────────────────────────
  const InlineForm=()=>{
    const [form,setForm]=useState<Rec|null>(null);
    const [vals,setVals]=useState<Record<string,string>>({});
    const [errs,setErrs]=useState<Record<string,string>>({});
    const [sending,setSending]=useState(false);
    const [done,setDone]=useState(false);
    useEffect(()=>{
      if(!pageId) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/`).then(r=>r.json()).then(d=>{if(d?.fields_config?.length)setForm(d);}).catch(()=>{});
    },[]);
    if(!form) return null;
    const fields=$o(form.fields_config);
    const btnColor=$(form.button_color,"#22d3ee");
    async function submit(e:React.FormEvent){e.preventDefault();const ne:Record<string,string>={};fields.forEach(f=>{if(f.required&&!vals[$(f.label)]?.trim())ne[$(f.label)]=`${$(f.label)} is required`;});if(Object.keys(ne).length){setErrs(ne);return;}setSending(true);try{const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/form/submit/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:vals})});const data=await r.json();if(data.success)setDone(true);else setErrs({_:data.error||"Failed"});}catch{setErrs({_:"Network error"});}finally{setSending(false);};}
    const inp:React.CSSProperties={width:"100%",padding:"10px 14px",borderRadius:10,fontSize:14,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"var(--text)",outline:"none",fontFamily:"inherit"};
    if(done) return <div style={{textAlign:"center",padding:"clamp(24px,4vw,40px)",borderRadius:isBrut?4:20,border:`1px solid ${btnColor}44`,background:`${btnColor}08`}}><div style={{fontSize:40,marginBottom:12}}>✅</div><h3 style={{fontSize:20,fontWeight:800,color:"var(--text)",margin:"0 0 8px"}}>{$(form.success_message,"Sent!")}</h3></div>;
    return <form onSubmit={submit} noValidate style={{borderRadius:isBrut?4:20,border:`1px solid ${border}`,background:cardBg,padding:"clamp(20px,3vw,32px)"}}>
      <h3 style={{fontSize:"clamp(16px,2vw,22px)",fontWeight:800,color:"var(--text)",margin:"0 0 6px",fontFamily:"var(--fh)"}}>{$(form.title,"Get In Touch")}</h3>
      {$(form.subtitle)&&<p style={{color:"var(--mu)",fontSize:14,margin:"0 0 20px"}}>{$(form.subtitle)}</p>}
      {fields.map((f,i)=><div key={i} style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:12,fontWeight:600,color:"var(--text)",marginBottom:6}}>{$(f.label)}{f.required&&<span style={{color:"#f87171",marginLeft:3}}>*</span>}</label>
        {$(f.type)==="textarea"?<textarea style={{...inp,minHeight:80,resize:"vertical" as const}} placeholder={$(f.placeholder)} value={vals[$(f.label)]||""} onChange={e=>setVals(v=>({...v,[$(f.label)]:e.target.value}))}/>
        :$(f.type)==="dropdown"?<select style={{...inp,cursor:"pointer"}} value={vals[$(f.label)]||""} onChange={e=>setVals(v=>({...v,[$(f.label)]:e.target.value}))}><option value="">Select…</option>{$a(f.options).map((o,j)=><option key={j}>{o}</option>)}</select>
        :<input type={$(f.type)==="phone"?"tel":$(f.type)||"text"} style={inp} placeholder={$(f.placeholder)} value={vals[$(f.label)]||""} onChange={e=>setVals(v=>({...v,[$(f.label)]:e.target.value}))}/>}
        {errs[$(f.label)]&&<p style={{fontSize:11,color:"#f87171",marginTop:4}}>{errs[$(f.label)]}</p>}
      </div>)}
      {errs._&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(239,68,68,.1)",color:"#f87171",fontSize:13,marginBottom:14}}>{errs._}</div>}
      <button type="submit" disabled={sending} style={{width:"100%",padding:12,borderRadius:isBrut?2:100,fontWeight:700,fontSize:15,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${btnColor},${btnColor}cc)`,color:"#000",opacity:sending?.7:1}}>{sending?"Sending…":$(form.submit_label,"Send Message")}</button>
    </form>;
  };

  const CTAs=({center=false})=><div style={{display:"flex",flexWrap:"wrap" as const,gap:"clamp(10px,1.5vw,14px)",marginTop:"clamp(24px,3.5vw,32px)",justifyContent:center?"center":"flex-start"}}><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"clamp(12px,1.8vw,14px) clamp(22px,3.5vw,32px)",borderRadius:isBrut?2:100,fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",background:`linear-gradient(135deg,${acc},${hi})`,color:"#000",display:"inline-block"}}>{$(d.primary_cta,"Get In Touch")}</a><a href="#hero" style={{padding:"clamp(12px,1.8vw,14px) clamp(22px,3.5vw,32px)",borderRadius:isBrut?2:100,fontWeight:600,fontSize:"clamp(13px,1.6vw,15px)",border:`1px solid ${border}`,color:"var(--text)",display:"inline-block"}}>{$(d.secondary_cta,"Learn More")}</a></div>;
  const LP=()=><div style={{padding:"clamp(20px,3vw,30px)",borderRadius:isBrut?4:22,border:`1px solid ${border}`,background:cardBg,minWidth:"clamp(180px,22vw,240px)"}}><div style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".1em",color:acc,marginBottom:8,fontWeight:600}}>Email</div><div style={{fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:22}}>{$(d.email,"hello@example.com")}</div>{links.length>0&&<><div style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".1em",color:acc,marginBottom:10,fontWeight:600}}>Links</div>{links.map((lk,i)=><a key={i} href={$(lk.href,"#")} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--mu)",marginBottom:10}}><SvgIcon name="link" size={11} color={acc}/>{$(lk.label)}</a>)}</>}<div style={{borderTop:`1px solid ${border}`,marginTop:18,paddingTop:14,fontSize:12,color:"var(--mu)"}}>© {yr} {brand}</div></div>;
  const Wrap=({ch}:{ch:React.ReactNode})=><section id="contact" style={{padding:`clamp(50px,7vw,80px) clamp(16px,4vw,32px) clamp(60px,8vw,120px)`}}><div className="mx"><A t="as" ch={<div style={{position:"relative",borderRadius:isBrut?4:34,padding:"clamp(36px,5vw,72px) clamp(24px,5vw,72px)",background:`linear-gradient(135deg,${acc}18,${hi}10,${cardBg})`,border:`1px solid ${acc}2e`,overflow:"hidden"}}><div style={{position:"absolute",top:"-80px",right:"-80px",width:"clamp(200px,30vw,380px)",height:"clamp(200px,30vw,380px)",borderRadius:"50%",background:`radial-gradient(circle,${acc}22,transparent 70%)`,filter:"blur(48px)",pointerEvents:"none"}}/><div style={{position:"relative"}}>{ch}</div></div>}/></div></section>;

  switch(layout) {
    // split with inline form
    case "split": return <Wrap ch={<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"clamp(24px,5vw,56px)",alignItems:"start"}} className="g-contact"><div><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} xl/><CTAs/></div><LP/></div>}/>;
    // centered with inline form embed below
    case "centered": return <Wrap ch={<div><div style={{textAlign:"center",maxWidth:580,margin:"0 auto"}}><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center xl/><CTAs center/></div>{pageId&&<div style={{maxWidth:540,margin:"clamp(24px,4vw,40px) auto 0"}}><InlineForm/></div>}</div>}/>;
    case "minimal-cta": return <section id="contact" style={{padding:`clamp(32px,5vw,56px) clamp(16px,4vw,32px)`,borderTop:`1px solid ${border}`}}><div className="mx" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:24}}><div><Badge text={$(d.eyebrow)} c={ctx}/><h2 style={{fontFamily:"var(--fh)",fontSize:"clamp(1.4rem,3vw,2.4rem)",fontWeight:ctx.headW,letterSpacing:ctx.headLS,margin:0,color:"var(--text)"}}>{$(d.title)}</h2></div><CTAs/></div></section>;
    case "full-width-dark": return <section id="contact" style={{padding:sp,background:isLight?"var(--bg)":`linear-gradient(135deg,${acc}12,${hi}08)`,borderTop:`1px solid ${border}`}}><div style={{maxWidth:700,margin:"0 auto",textAlign:"center",padding:"0 clamp(16px,4vw,32px)"}}><A t="ai" ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center xl/>}/><A t="ai" d={100} ch={<CTAs center/>}/><A t="ai" d={180} ch={<div style={{marginTop:32,display:"flex",justifyContent:"center",gap:"clamp(16px,3vw,24px)",flexWrap:"wrap" as const}}>{links.map((lk,i)=><a key={i} href={$(lk.href,"#")} style={{fontSize:14,color:acc,display:"flex",alignItems:"center",gap:6}}><SvgIcon name="link" size={12} color={acc}/>{$(lk.label)}</a>)}</div>}/></div></section>;
    case "newsletter": return <section id="contact" style={{padding:sp}}><div style={{maxWidth:660,margin:"0 auto",textAlign:"center",padding:"0 clamp(16px,4vw,32px)"}}><A t="ai" ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center xl/>}/><A t="ai" d={100} ch={<div style={{display:"flex",gap:10,marginTop:32,background:isLight?"rgba(0,0,0,.05)":"rgba(255,255,255,.06)",borderRadius:isBrut?4:100,padding:"6px 6px 6px clamp(16px,3vw,24px)",border:`1px solid ${border}`,flexWrap:"wrap" as const}}><input type="email" placeholder="Enter your email" style={{flex:1,background:"none",border:"none",outline:"none",fontSize:15,color:"var(--text)",minWidth:"clamp(140px,25vw,200px)",fontFamily:"inherit"}}/><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{borderRadius:isBrut?2:100,padding:"10px 22px",fontSize:14,background:`linear-gradient(135deg,${acc},${hi})`,color:"#000",fontWeight:700,whiteSpace:"nowrap" as const,display:"inline-block"}}>{$(d.primary_cta,"Subscribe")}</a></div>}/>{pageId&&<A t="ai" d={200} ch={<div style={{marginTop:32}}><InlineForm/></div>}/>}</div></section>;
    case "social-cta": return <section id="contact" style={{padding:sp,borderTop:`1px solid ${border}`}}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"clamp(24px,5vw,60px)",alignItems:"end",marginBottom:"clamp(24px,4vw,40px)"}} className="g-contact"><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} xl/><a href="#" onClick={e=>{e.preventDefault();triggerPopup();}} style={{padding:"clamp(12px,1.8vw,14px) clamp(22px,3.5vw,32px)",borderRadius:isBrut?2:100,fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",background:`linear-gradient(135deg,${acc},${hi})`,color:"#000",display:"inline-block",flexShrink:0}}>{$(d.primary_cta,"Get In Touch")}</a></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap" as const,gap:16,borderTop:`1px solid ${border}`,paddingTop:"clamp(20px,3vw,32px)"}}><div style={{fontSize:12,color:"var(--mu)"}}>© {yr} {brand}</div><div style={{display:"flex",gap:"clamp(14px,2.5vw,24px)",flexWrap:"wrap" as const}}>{links.map((lk,i)=><a key={i} href={$(lk.href,"#")} style={{fontSize:13,color:"var(--mu)"}}>{$(lk.label)}</a>)}</div></div></div></section>;
    case "newspaper": return <section id="contact" style={{borderTop:"2px solid var(--text)",padding:sp}}><div className="mx"><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(180px,22vw,280px),1fr))",gap:"clamp(24px,4vw,48px)",paddingBottom:"clamp(24px,4vw,40px)",borderBottom:"2px solid var(--text)",marginBottom:"clamp(16px,3vw,24px)"}}><div><div style={{fontSize:"clamp(1.4rem,3vw,2rem)",fontWeight:900,fontFamily:"var(--fh)",marginBottom:8}}>{brand}</div><p style={{fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.6,color:"var(--mu)",margin:"0 0 16px"}}>{$(d.description)}</p><a href={`mailto:${$(d.email)}`} style={{fontSize:13,color:acc,fontWeight:600}}>{$(d.email)}</a></div>{links.length>0&&<div><div style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".12em",marginBottom:16,fontWeight:700}}>Quick Links</div><div style={{display:"flex",flexDirection:"column" as const,gap:10}}>{links.map((lk,i)=><a key={i} href={$(lk.href,"#")} style={{fontSize:13,color:"var(--mu)"}}>{$(lk.label)}</a>)}</div></div>}<div><div style={{fontSize:11,textTransform:"uppercase" as const,letterSpacing:".12em",marginBottom:16,fontWeight:700}}>Contact Us</div>{pageId?<InlineForm/>:<CTAs/>}</div></div><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--mu)",flexWrap:"wrap" as const,gap:8}}><span>© {yr} {brand}. All rights reserved.</span><span style={{color:acc}}>Made with ♥</span></div></div></section>;
    // form-embed variant — full inline form as main content
    case "form-embed": return <section id="contact" style={{padding:sp}}><div style={{maxWidth:640,margin:"0 auto",padding:"0 clamp(16px,4vw,32px)"}}><A t="ai" sx={{textAlign:"center",marginBottom:"clamp(24px,4vw,40px)"}} ch={<Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} center xl/>}/><A t="as" d={100} ch={<InlineForm/>}/></div></section>;
    default: return <Wrap ch={<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"clamp(24px,5vw,56px)",alignItems:"center"}} className="g-contact"><div><Hdg ey={$(d.eyebrow)} ti={$(d.title)} de={$(d.description)} c={ctx} xl/><CTAs/></div><LP/></div>}/>;
  }
}
