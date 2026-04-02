/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const, react-hooks/exhaustive-deps, @next/next/no-img-element */
"use client";

import React, { useMemo, useState, useEffect } from "react";
import * as Babel from "@babel/standalone";
import { toast } from "sonner";
import { FallbackSection } from "../../../lib/fallback-section";

interface Props {
  code: string;
  editable: boolean;
  onCodeChange: (code: string) => void;
  assets?: Record<string, unknown>;
  strategy?: Record<string, unknown>;
  categories?: any[];
  products?: any[];
  sectionName: string; // 🚀 ADDED
}

export default function DynamicSectionEditor({
  code,
  editable,
  onCodeChange,
  assets = {},
  strategy = {},
  categories = [],
  products = [],
  sectionName,        // 🚀 ADDED
}: Props) {
  const [draft, setDraft] = useState(code);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [selection, setSelection] = useState<{ tag: string; index: number; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  type DeviceMode = "laptop" | "mobile";
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("laptop");
  const getDevicePrefix = (mode: DeviceMode) => {
    return mode === "laptop" ? "md:" : ""; // mobile = base, laptop = md:
  };
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stockQuery, setStockQuery] = useState("");
  const [stockResults, setStockResults] = useState<any[]>([]);
  const [isSearchingStock, setIsSearchingStock] = useState(false);
  const BRAND_PALETTE = [
    "#ffffff", "#f8fafc", "#1e293b", "#4f46e5", "#ec4899", 
    "#e11d48", "#10b981", "#f59e0b", "#000000"
  ];

  type EditorTag =
    | "h1" | "h2" | "h3"
    | "p" | "span"
    | "a" | "button"
    | "img"
    | "div"

  type ControlGroup =
    | "typography"
    | "spacing"
    | "border"
    | "background"
    | "image"
    | "effects"
    | "color"
  const hexToRgba = (hex: string, opacity: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const TAG_CONTROLS: Record<EditorTag, ControlGroup[]> = {
    h1: ["typography", "spacing", "color"],
    h2: ["typography", "spacing", "color"],
    h3: ["typography", "spacing", "color"],

    p: ["typography", "spacing", "color"],
    span: ["typography", "color", "background"],

    a: ["typography", "spacing", "color", "effects", "background"],
    button: ["typography", "spacing", "border", "background", "color", "effects"],

    img: ["image", "spacing", "border", "effects"],

    div: ["background", "spacing", "border", "background"],
  };

  const allowedControls = selection
    ? TAG_CONTROLS[selection.tag as EditorTag] || []
    : []
  
  const fontOptions = [
    "caveat", "lexand", "inconsolata", "dancing", "dmsans", "dongle", "fredoka", 
    "indie", "lato", "manjari", "merriweather", "mina", "miriam", "oswald", 
    "ptserif", "raleway", "alumni", "poiret", "outfit", "redhat", "montserratAlt",
    "anaheim", "lunasima", "darker", "rubikDirt", "jolly", "mystery", "kranky",
    "peralta", "annie", "meow", "borel", "dynapuff", "pinyon", "lavishly", "greatvibes",
    "badscript", "carattere", "orbitron", "anta"
  ];

  const spacingValues = [0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64];

 
  const fontMapping: Record<string, string> = {
      caveat: 'Caveat', lexand: 'Lexend', inconsolata: 'Inconsolata', dancing: 'Dancing Script',
      dmsans: 'DM Sans', dongle: 'Dongle', fredoka: 'Fredoka', indie: 'Indie Flower',
      lato: 'Lato', manjari: 'Manjari', merriweather: 'Merriweather', mina: 'Mina',
      miriam: 'Miriam Libre', oswald: 'Oswald', ptserif: 'PT Serif', raleway: 'Raleway',
      alumni: 'Alumni Sans Pinstripe', poiret: 'Poiret One', outfit: 'Outfit', 
      redhat: 'Red Hat Display', montserratAlt: 'Montserrat Alternates', anaheim: 'Anaheim',
      lunasima: 'Lunasima', darker: 'Darker Grotesque', rubikDirt: 'Rubik Dirt', jolly: 'Jolly Lodger',
      mystery: 'Mystery Quest', kranky: 'Kranky', peralta: 'Peralta', annie: 'Annie Use Your Telescope',
      meow: 'Meow Script', borel: 'Borel', dynapuff: 'DynaPuff', pinyon: 'Pinyon Script', 
      lavishly: 'Lavishly Yours', greatvibes: 'Great Vibes', badscript: 'Bad Script',
      carattere: 'Carattere', orbitron: 'Orbitron', anta: 'Anta'
    };
  // 1. Move fontMapping outside the component if it isn't already 
  // to ensure it doesn't trigger unnecessary re-renders.

  useEffect(() => {
    // Use a unique ID to prevent duplicate injections during hot-reloads
    const FONT_LINK_ID = "google-fonts-preview";
    const STYLE_TAG_ID = "font-mapping-styles";

    // 1. Correct URL Construction
    const fontNames = Object.values(fontMapping)
      .map(f => `family=${f.replace(/\s+/g, '+')}:wght@300;400;700`)
      .join('&');
    
    if (!document.getElementById(FONT_LINK_ID)) {
      const googleLink = document.createElement('link');
      googleLink.id = FONT_LINK_ID;
      googleLink.rel = 'stylesheet';
      googleLink.href = `https://fonts.googleapis.com/css2?${fontNames}&display=swap`;
      document.head.appendChild(googleLink);
    }

    // 2. Add rules for both base and responsive (md:) classes
    if (!document.getElementById(STYLE_TAG_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      const classRules = Object.entries(fontMapping).map(([cls, family]) => `
        .${cls} { font-family: "${family}", sans-serif !important; }
        .md\\:${cls} { font-family: "${family}", sans-serif !important; }
      `).join('\n');

      style.innerHTML = `
        ${classRules}
        [contenteditable="true"] { box-shadow: inset 0 0 0 2px #3b82f6 !important; background: transparent !important; }
        [data-section-overlay] { position: relative; }
        [data-section-overlay]::before {
          content: ""; position: absolute; inset: 0;
          background-color: var(--overlay-color, transparent);
          opacity: var(--overlay-opacity, 0);
          pointer-events: none; z-index: 0;
        }
        [data-section-overlay] > * { position: relative; z-index: 1; }
      `;
      document.head.appendChild(style);
    }

    // We don't necessarily want to remove these on unmount in the editor 
    // because multiple sections depend on them simultaneously.
  }, []);

  useEffect(() => { setDraft(code); }, [code]);
  const updateSectionStyle = (prefix: string, value: string) => {
    setDraft((currentCode) => {
      // Find the very first className in the code (usually the wrapper)
      const regex = /(className=["'])([^"']*?)(["'])/i;
      const updatedCode = currentCode.replace(regex, (match, open, classString, close) => {
        let classes = classString.split(/\s+/).filter(Boolean);
        
        // Fix: Explicitly type 'c' as string
        classes = classes.filter((c: string) => !c.startsWith(prefix));
        
        if (value) classes.push(value);
        return `${open}${classes.join(" ")}${close}`;
      });
      
      if (updatedCode !== currentCode) onCodeChange(updatedCode);
      return updatedCode;
    });
  };
  /**
   * THE TOGGLE-AWARE STYLE UPDATER
   */
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
  if (file && file.size > MAX_FILE_SIZE) {
    toast.error("Image is too large (Max 5MB). Please try a smaller image.");
    e.target.value = ""; 
    return;
  }

  if (!file || !selection) return;

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}landing-image-upload/`,
      {
        method: "POST",
        headers: {},
        body: formData,
      }
    );

    if (!res.ok) {
      if (res.status === 413) throw new Error("Image is too large for the server.");
      throw new Error("Server error during upload.");
    }

    const data = await res.json();

    if (data.url) {
      const s3Url = data.url;

      setDraft(prev => {
        let count = -1;

        if (selection.tag === 'img') {
          const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
          return prev.replace(imgRegex, (match) => {
            count++;
            return count === selection.index
              ? match.replace(/src=["']([^"']*)["']/, `src="${s3Url}"`)
              : match;
          });
        } else {
          const wrapperRegex = /(<div[^>]*)(>)/i;
          return prev.replace(wrapperRegex, (match, open, close) => {
            const styleRegex = /style=\{\{([^}]*)\}\}/;
            const styleMatch = open.match(styleRegex);
            let styleContent = styleMatch ? styleMatch[1] : "";

            // 1. Scrape existing RGBA safely
            const rgbaMatch = styleContent.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
            const r = rgbaMatch ? rgbaMatch[1] : "0";
            const g = rgbaMatch ? rgbaMatch[2] : "0";
            const b = rgbaMatch ? rgbaMatch[3] : "0";
            const a = rgbaMatch ? rgbaMatch[4] : "0.5";

            // 2. ULTRA-AGGRESSIVE CLEANUP
            // We remove everything that looks like a URL, RGBA, BackgroundImage, 
            // OR naked number/bracket fragments (e.g., "0, 0, 0.5)")
            let cleanStyle = styleContent
              .replace(/backgroundImage:\s*`[^`]*`/g, "")
              .replace(/backgroundImage:\s*'[^']*'/g, "")
              .replace(/backgroundImage:\s*"[^"]*"/g, "")
              .replace(/^,|,$/g, "")
              .trim();

            // 3. Rebuild the clean style
            const newRgba = `rgba(${r}, ${g}, ${b}, ${a})`;
            const bgStyle = `backgroundImage: \`linear-gradient(${newRgba}, ${newRgba}), url('${s3Url}')\``;
            const finalStyle = cleanStyle.trim() ? `${cleanStyle}, ${bgStyle}` : bgStyle;

            // Remove any old Tailwind background classes
            let cleanOpen = open
              .replace(/bg-\[[^\]]+\]/g, "")
              .replace(/\bbg-cover\b/g, "")
              .replace(/\bbg-center\b/g, "");


            if (styleMatch) {
              return cleanOpen.replace(styleRegex, `style={{${finalStyle}}}`) + close;
            } else {
              return `${cleanOpen} style={{${finalStyle}}}${close}`;
            }
          });
        }
      });

      toast.success("Section background updated!");
    }
  } catch (err: any) {
    toast.error(err.message === "Failed to fetch" ? "Network error. Image might be too large." : err.message);
  } finally {
    setIsUploading(false);
    e.target.value = "";
  }
};
  const generateImage = async () => {
    if (!aiPrompt || !selection) return;

    setIsGenerating(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}generate-image/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: aiPrompt }),
        }
      );

      const data = await res.json();

      if (!data.url) {
        toast.error("Image generation failed");
        return;
      }

      const s3Url = data.url;

      // Standardizing logic to match handleImageUpload
      setDraft((prev) => {
        let updatedCode = prev;
        let count = -1;

        if (selection.tag === "img") {
          const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
          updatedCode = prev.replace(imgRegex, (match) => {
            count++;
            const newSrc = 'src="' + s3Url + '"';
            return count === selection.index
              ? match.replace(/src=["']([^"']*)["']/, newSrc)
              : match;
          });
        } else {
          // Use the same regex and logic as handleImageUpload
          const wrapperRegex = /(<div[^>]*className=[\"'])([^\"']*?)([\"'])/i;
          
          updatedCode = prev.replace(wrapperRegex, (match, open, classString, close) => {
            let classes = classString
              .split(/\s+/)
              .filter((c: string) =>
                !c.startsWith('bg-[') &&
                !c.startsWith('bg-cover') &&
                !c.startsWith('bg-center') &&
                !c.startsWith('bg-gray') &&
                !c.startsWith('bg-white')
              );

            // We concatenate strings to prevent the bundler from seeing a template literal path
            const bgClass = "bg-[url('" + s3Url + "')]";
            classes.push(bgClass, 'bg-cover', 'bg-center');

            return open + classes.join(" ") + close;
          });
        }

        if (updatedCode !== prev) onCodeChange(updatedCode);
        return updatedCode;
      });

      toast.success("AI image generated!");
      setAiPrompt("");
    } catch (e) {
      toast.error("AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };
  const applyImageUrl = (assetUrl: string) => {
    if (!selection) return;

    setDraft((prev) => {
      let updatedCode = prev;
      let count = -1;

      if (selection.tag === "img") {
        const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
        updatedCode = prev.replace(imgRegex, (match) => {
          count++;
          const newSrc = 'src="' + assetUrl + '"';
          return count === selection.index
            ? match.replace(/src=["']([^"']*)["']/, newSrc)
            : match;
        });
      } else {
        const wrapperRegex = /(<div[^>]*className=[\"'])([^\"']*?)([\"'])/i;
        updatedCode = prev.replace(wrapperRegex, (match, open, classString, close) => {
          let classes = classString
            .split(/\s+/)
            .filter((c: string) =>
              !c.startsWith("bg-[") &&
              !c.startsWith("bg-cover") &&
              !c.startsWith("bg-center") &&
              !c.startsWith("bg-gray") &&
              !c.startsWith("bg-white")
            );

          const bgClass = "bg-[url('" + assetUrl + "')]";
          classes.push(bgClass, "bg-cover", "bg-center");

          return open + classes.join(" ") + close;
        });
      }

      if (updatedCode !== prev) onCodeChange(updatedCode);
      return updatedCode;
    });
  };
  const searchStockImages = async () => {
    if (!stockQuery.trim()) {
      toast.error("Add a stock image query");
      return;
    }

    setIsSearchingStock(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}stock-images/?query=${encodeURIComponent(stockQuery)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Stock search failed");
      }

      setStockResults(Array.isArray(data.results) ? data.results : []);

      if (!data.results?.length && data.hint) {
        toast.message(data.hint);
      }
    } catch (error) {
      console.error(error);
      toast.error("Stock image search failed");
    } finally {
      setIsSearchingStock(false);
    }
  };
const updateImageOverlay = (type: 'color' | 'opacity', value: string) => {
  setDraft((currentCode: string) => {
    // 1. Target only the FIRST div (the section wrapper)
    const regex = /(<div[^>]*)(>)/i;

    return currentCode.replace(regex, (match: string, open: string, close: string) => {
      const styleRegex = /style=\{\{([^}]*)\}\}/;
      const styleMatch = open.match(styleRegex);
      let styleContent = styleMatch ? styleMatch[1] : "";

      // 2. FIND THE URL (And only the URL)
      // We look for the image link regardless of where it is in the mess
      const urlMatch = styleContent.match(/url\(['"]([^'"]+)['"]\)/);
      const currentUrl = urlMatch ? urlMatch[1] : "";

      if (!currentUrl) return match;

      // 3. CALCULATE RGBA
      // We extract the existing RGBA from the current code to maintain state
      const rgbaMatch = styleContent.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      
      let r = rgbaMatch ? rgbaMatch[1] : "0";
      let g = rgbaMatch ? rgbaMatch[2] : "0";
      let b = rgbaMatch ? rgbaMatch[3] : "0";
      let a = rgbaMatch ? rgbaMatch[4] : "0.5";

      if (type === 'opacity') {
        a = value;
      } else {
        const rHex = parseInt(value.slice(1, 3), 16);
        const gHex = parseInt(value.slice(3, 5), 16);
        const bHex = parseInt(value.slice(5, 7), 16);
        r = rHex.toString(); g = gHex.toString(); b = bHex.toString();
      }

      // 4. THE CLEANUP (The most important part)
      // Instead of splitting by comma (which breaks on gradients), 
      // we remove EVERYTHING that looks like backgroundImage or stray text fragments
      let cleanStyle = styleContent
        .replace(/backgroundImage:\s*[`'"].*?[`'"]/g, "") // Remove template literal version
        .replace(/backgroundImage:\s*['"].*?['"]/g, "")   // Remove quoted version
        .replace(/rgba\([^)]+\)/g, "")                   // Remove stray rgba fragments
        .replace(/url\([^)]+\)/g, "")                    // Remove stray url fragments
        .replace(/linear-gradient\([^)]+\)/g, "")        // Remove stray gradient fragments
        .replace(/[`'"]/g, "")                           // Remove stray quotes/backticks
        .replace(/https:\/\/[^,}\s]*/g, "")              // Remove stray naked URLs
        .replace(/,\s*,/g, ",")                          // Fix double commas
        .trim();

      // Clean up leading/trailing commas
      cleanStyle = cleanStyle.replace(/^,+|,+$/g, "").trim();

      // 5. RECONSTRUCT
      const newRgba = `rgba(${r}, ${g}, ${b}, ${a})`;
      const bgStyle = `backgroundImage: \`linear-gradient(${newRgba}, ${newRgba}), url('${currentUrl}')\``;
      
      const finalStyle = cleanStyle ? `${cleanStyle}, ${bgStyle}` : bgStyle;

      // Ensure data-section-overlay is on the tag for compatibility
      let newOpen = open;
      if (!newOpen.includes('data-section-overlay')) {
        newOpen = newOpen.replace(/<div/, '<div data-section-overlay');
      }

      if (styleMatch) {
        return newOpen.replace(styleRegex, `style={{${finalStyle}}}`) + close;
      } else {
        return `${newOpen} style={{${finalStyle}}}${close}`;
      }
    });
  });
};
  const updateSectionBackgroundColor = (color: string) => {
    setDraft((currentCode) => {
      // target FIRST wrapper div only
      const regex = /(<div[^>]*)(>)/i;

      const updatedCode = currentCode.replace(regex, (match, open, close) => {
        // remove existing backgroundColor from style if any
        const styleRegex = /style=\{\{([^}]*)\}\}/;

        if (styleRegex.test(open)) {
          let styleContent = open.match(styleRegex)?.[1] || "";

          // remove old backgroundColor
          styleContent = styleContent.replace(
            /backgroundColor:\s*['"][^'"]*['"],?/g,
            ""
          );

          // add new backgroundColor
          styleContent = `${styleContent.trim()}${styleContent.trim() ? "," : ""} backgroundColor: '${color}'`;

          return open.replace(styleRegex, `style={{${styleContent}}}`) + close;
        }

        // no style prop → add one
        return `${open} style={{ backgroundColor: '${color}' }}${close}`;
      });

      if (updatedCode !== currentCode) onCodeChange(updatedCode);
      return updatedCode;
    });
  };

  const updateCustomColor = ( property: 'color' | 'backgroundColor' | string, value: string) => {
  if (!selection) return;

  setDraft((currentCode) => {
    let occurrence = -1;
    const regex = new RegExp(`(<${selection.tag}[^>]*?)(/?>)`, "gi");

    const updatedCode = currentCode.replace(regex, (match, openTag, closeTag) => {
      occurrence++;
      if (occurrence !== selection.index) return match;

      let newTag = openTag;
      const styleRegex = /style=\{\{([^}]*)\}\}/;
      const styleMatch = newTag.match(styleRegex);

      if (styleMatch) {
        let styleContent = styleMatch[1];
        const propRegex = new RegExp(`${property}:\\s*['"][^'"]*['"]`);
        
        if (propRegex.test(styleContent)) {
          styleContent = styleContent.replace(propRegex, `${property}: '${value}'`);
        } else {
          styleContent = `${styleContent.trim()}${styleContent.trim().endsWith(',') ? '' : ','} ${property}: '${value}'`;
        }
        newTag = newTag.replace(styleRegex, `style={{${styleContent}}}`);
      } else {
        newTag = `${newTag} style={{${property}: '${value}'}}`;
      }

      const classRegex = /className=["']([^"']*)["']/;
      const classMatch = newTag.match(classRegex);
      if (classMatch && value !== '') {
        let classes = classMatch[1].split(/\s+/).filter(Boolean);
        const prefix = property === 'color' ? 'text-' : 'bg-';
        classes = classes.filter((c: string) => !c.startsWith(prefix));
        newTag = newTag.replace(classMatch[0], `className="${classes.join(' ')}"`);
      }

      return `${newTag}${closeTag}`;
    });

    // 🚀 THE FIX: Trigger save state in parent
    if (updatedCode !== currentCode) {
        onCodeChange(updatedCode);
    }
    return updatedCode;
  });
};
const updateStyle = (prefix: string, value: string, isFont: boolean = false) => {
  const devicePrefix = getDevicePrefix(deviceMode);
  const finalValue = value ? `${devicePrefix}${value}` : "";

  if (!selection) return;

  setDraft((currentCode) => {
    let occurrence = -1;
    const regex = new RegExp(`(<${selection.tag}[^>]*className=["'])([^"']*?)(["'])`, "gi");

    const updatedCode = currentCode.replace(regex, (match, open, classString, close) => {
      occurrence++;
      if (occurrence !== selection.index) return match;

      let classes = classString.split(/\s+/).filter(Boolean);
      
      // We check if the NEW value already exists to allow toggling
      const alreadyHasExactValue = classes.includes(finalValue);

      if (isFont) {
        classes = classes.filter((c: string) => {
          // remove base font
          if (fontOptions.includes(c.toLowerCase())) return false;

          // remove responsive fonts (md:lato, lg:raleway, etc)
          const parts = c.split(":");
          const last = parts[parts.length - 1].toLowerCase();
          if (fontOptions.includes(last)) return false;

          return true;
        });
      }
      else {
        classes = classes.filter((c: string) => {
          if (alreadyHasExactValue && c === value) return false;

          // 🚀 THE FIX: Enhanced logic to catch responsive and stacked classes
          
          // 1. HEIGHT CLEANUP: Catch h-80, lg:h-full, sm:h-auto, etc.
          if (value.startsWith('h-')) {
            // Remove existing height classes
            if (c.includes(':h-') || (c.startsWith('h-') && !c.includes(':'))) return false;
            
            // CRITICAL FIX: Remove 'absolute' and 'inset-0' so the section expands with the image
            if (c === 'absolute' || c === 'inset-0') return false;
          }

          // 2. WIDTH CLEANUP: Catch w-full, lg:w-1/2, etc.
          if (value.startsWith('w-') && (c.includes(':w-') || (c.startsWith('w-') && !c.includes(':')))) return false;
          
          // 3. OPACITY CLEANUP
          if (value.startsWith('opacity-') && c.includes('opacity-')) return false;

          // 4. BORDER RADIUS CLEANUP: Catch rounded, rounded-lg, md:rounded-full
          if (value.startsWith('rounded') && c.includes('rounded')) return false;

          // 5. TEXT COLOR & SIZE CLEANUP (Matches text-red-500, text-xl, etc.)
          if (value.startsWith('text-') && c.startsWith('text-')) {
             // If value is a size (text-xl), remove other sizes. If color, remove colors.
             const isSize = value.match(/text-(xs|sm|base|lg|[0-9]?xl)/);
             const cIsSize = c.match(/text-(xs|sm|base|lg|[0-9]?xl)/);
             if (isSize && cIsSize) return false;
             if (!isSize && !cIsSize) return false; // Both are likely colors
          }

          // MOBILE edits → touch ONLY base
          if (deviceMode === "mobile") {
            if (c.startsWith(prefix) && !c.includes(":")) return false;
          }

          // LAPTOP edits → touch ONLY md:
          if (deviceMode === "laptop") {
            if (c.startsWith(`md:${prefix}`)) return false;
          }
          return true;

        });
      }

      // Add the new class
      if (finalValue && !classes.includes(finalValue)) {
        classes.push(finalValue);
      }


      return `${open}${classes.join(" ")}${close}`;
    });

    if (updatedCode !== currentCode) onCodeChange(updatedCode);
    return updatedCode;
  });
};
const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();        // 🔥 BLOCK link & button
    e.stopPropagation();      // keep editor logic

    if (!editable || viewMode !== "visual") return;
    
    // Find the closest editable tag
    const target = (e.target as HTMLElement).closest("h1, h2, h3, h4, p, span, a, button, div, img") as HTMLElement;
    if (!target) return;

    const tag = target.tagName.toLowerCase();
    e.stopPropagation();

    const allOfTag = Array.from(e.currentTarget.querySelectorAll(tag));
    const index = allOfTag.indexOf(target);
    const currentText = target.innerText.trim();
    setSelection({ tag, index, text: currentText });
    if (tag !== "div" && tag !== "img") {
      target.contentEditable = "true";
      target.focus();
      const onBlur = () => {
        target.contentEditable = "false";
        const newText = target.innerText.trim();
        if (newText !== currentText) {
          setDraft(prev => {
            let tCount = -1;
            const tRegex = new RegExp(`(<${tag}[^>]*>)([\\s\\S]*?)(<\\/${tag}>)`, "gi");
            const updated = prev.replace(tRegex, (m, open, content, close) => {
              tCount++;
              return tCount === index ? `${open}${newText}${close}` : m;
            });
            onCodeChange(updated);
            return updated;
          });
        }
        target.removeEventListener('blur', onBlur);
      };
      target.addEventListener('blur', onBlur);
    }
  };

  const Component = useMemo(() => {
    try {
      let cleaned = draft.replace(/import[\s\S]*?;\n?/g, "").replace(/export\s+default\s+/g, "").replace(/export\s+/g, "");
      if (/function\s+([A-Za-z0-9_]+)/.test(cleaned)) {
        cleaned = cleaned.replace(/function\s+([A-Za-z0-9_]+)\s*\(/, "exports.default = function $1(");
      }
      const transformed = Babel.transform(cleaned, {
        filename: "section.tsx", presets: ["react", "typescript"], plugins: ["transform-modules-commonjs"],
      }).code as string;
      const fn = new Function(
        "React",
        "exports",
        "IMAGE_ASSETS",
        "SECTION_STRATEGY",
        `const { useState, useEffect, useMemo, useRef } = React; ${transformed}; return exports.default;`
      );
      const exports = { default: null };
      return fn(React, exports, assets, strategy);
    } catch (e) {
      console.error("DynamicSectionEditor Error:", e);
      return null;
    }
  }, [draft, assets, strategy]);

  return (
    <div data-editor-wrapper>
      {editable && selection && viewMode === "visual" && (
        <div className="fixed bottom-6 z-100 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 shadow-2xl rounded-3xl p-5 w-[96%] max-w-6xl flex items-start gap-6 overflow-x-auto max-h-[45vh]">

          {/* ================= BUTTON / LINK ================= */}
          {allowedControls.includes("effects") && (
            <div className="flex flex-col gap-2 border-r border-slate-700 pr-5 flex-shrink-0">
              {(['a', 'button', 'span'].includes(selection.tag)) && (
                <>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    Button Style
                  </span>

                  <div className="flex gap-2">
                    <select onChange={(e) => updateStyle('px-', e.target.value)} className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1 w-16">
                      <option value="">Width</option>
                      {[2,4,6,8,10,12,16].map(v => (
                        <option key={v} value={`px-${v}`}>px-{v}</option>
                      ))}
                    </select>

                    <select onChange={(e) => updateStyle('py-', e.target.value)} className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1 w-16">
                      <option value="">Height</option>
                      {[1,2,3,4,6,8].map(v => (
                        <option key={v} value={`py-${v}`}>py-{v}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => updateStyle('shadow-', 'shadow-xl')} className="text-[8px] bg-slate-800 p-1 rounded border border-slate-600">Glow</button>
                    <button onClick={() => updateStyle('transition-', 'transition-all hover:scale-105')} className="text-[8px] bg-slate-800 p-1 rounded border border-slate-600">Anim</button>
                  </div>
                </>
              )}
            </div>
          )}
          {/* ================= COLORS (WORDPRESS STYLE) ================= */}
          {/* ================= COLORS (PALETTE + CUSTOM) ================= */}
          {allowedControls.includes("color") && (
            <div className="flex flex-col gap-2 border-r border-slate-700 pr-5 flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Color Settings
                </span>
                <button
                  onClick={() => {
                    updateCustomColor("color", "");
                    updateCustomColor("backgroundColor", "");
                  }}
                  className="text-[8px] text-blue-400 hover:text-white uppercase"
                >
                  Reset
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* TEXT COLOR CONTROLS */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 w-8">Text:</span>
                  <div className="flex gap-1.5 flex-wrap max-w-[120px]">
                    {BRAND_PALETTE.map(hex => (
                      <button
                        key={hex}
                        onClick={() => updateCustomColor("color", hex)}
                        className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                    <input
                      type="color"
                      onChange={(e) => updateCustomColor("color", e.target.value)}
                      className="w-4 h-4 bg-transparent cursor-pointer rounded-full overflow-hidden border border-slate-700"
                    />
                  </div>
                </div>

                {/* BACKGROUND COLOR CONTROLS (Only if background allowed) */}
                {(allowedControls.includes("background") || allowedControls.includes("color")) && (
                  <div className="flex items-center gap-3 border-t border-slate-800 pt-2">
                    <span className="text-[9px] font-bold text-slate-400 w-8">BG:</span>
                    <div className="flex gap-1.5 flex-wrap max-w-[120px]">
                      {BRAND_PALETTE.map(hex => (
                        <button
                          key={hex}
                          onClick={() => updateCustomColor("backgroundColor", hex)}
                          className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                      <input
                        type="color"
                        onChange={(e) => updateCustomColor("backgroundColor", e.target.value)}
                        className="w-4 h-4 bg-transparent cursor-pointer rounded-full overflow-hidden border border-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ================= IMAGE ================= */}
          {allowedControls.includes("image") && (
            <div className="flex flex-col gap-2 border-r border-slate-700 pr-5 flex-shrink-0">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic mb-1">
                Image Studio
              </span>

              <div className="flex flex-row items-start gap-6">
                
                {/* COLUMN 1: MANUAL CONTROLS (UPLOAD & DIMENSIONS) */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="asset-upload"
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="asset-upload" 
                    className="text-[9px] font-bold py-1.5 px-3 rounded border border-dashed border-slate-600 cursor-pointer text-center hover:bg-slate-800 transition-colors bg-slate-900/50"
                  >
                    {isUploading ? "UPLOADING..." : "📷 UPLOAD NEW"}
                  </label>

                  {selection.tag === "img" && (
                    <div className="flex gap-1 mt-1">
                      <select 
                        onChange={(e) => updateStyle('h-', e.target.value)} 
                        className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1 w-full"
                      >
                        <option value="">Height</option>
                        {['h-24','h-48','h-64','h-full'].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>

                      <select 
                        onChange={(e) => updateStyle('w-', e.target.value)} 
                        className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1 w-full"
                      >
                        <option value="">Width</option>
                        {['w-24','w-48','w-64','w-full'].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* COLUMN 2: AI GENERATION */}
                <div className="flex flex-col gap-2 border-l border-slate-800 pl-6">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe image to generate..."
                      className="text-[10px] p-2 bg-slate-900 border border-slate-700 rounded resize-none w-56 h-[68px] focus:border-purple-500 outline-none"
                    />

                    <button
                      onClick={generateImage}
                      disabled={isGenerating}
                      className="text-[9px] font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white py-1.5 rounded hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {isGenerating ? "GENERATING..." : "✨ GENERATE WITH AI"}
                    </button>
                  </div>
                </div>

                <div className="flex min-w-[220px] flex-col gap-2 border-l border-slate-800 pl-6">
                  <textarea
                    value={stockQuery}
                    onChange={(e) => setStockQuery(e.target.value)}
                    placeholder="Search royalty-free images..."
                    className="text-[10px] p-2 bg-slate-900 border border-slate-700 rounded resize-none w-56 h-[68px] focus:border-cyan-500 outline-none"
                  />

                  <button
                    onClick={searchStockImages}
                    disabled={isSearchingStock}
                    className="text-[9px] font-bold bg-cyan-600 text-white py-1.5 rounded hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {isSearchingStock ? "SEARCHING..." : "Find royalty-free"}
                  </button>

                  {stockResults.length > 0 && (
                    <div className="grid max-h-36 grid-cols-2 gap-2 overflow-auto rounded border border-slate-800 bg-slate-950/80 p-2">
                      {stockResults.slice(0, 4).map((item, index) => (
                        <button
                          key={`${item.url}-${index}`}
                          onClick={() => applyImageUrl(item.url)}
                          className="overflow-hidden rounded border border-slate-700 text-left transition hover:border-cyan-400"
                          title={item.alt || "Stock image"}
                        >
                          <img
                            src={item.thumbnail || item.url}
                            alt={item.alt || "Stock image"}
                            className="h-16 w-full object-cover"
                          />
                          <div className="p-1 text-[8px] text-slate-300">
                            {item.provider}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}          
          {/* ================= BACKGROUND  ================= */}
          {allowedControls.includes("background") && (
            <div className="flex flex-col gap-3 border-r border-slate-700 pr-5 flex-shrink-0">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Section Base
              </span>

              {/* Tailwind preset backgrounds */}
              <select
                onChange={(e) => updateSectionStyle('bg-', e.target.value)}
                className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1 w-32"
              >
                <option value="">Preset BG</option>
                {[
                  'bg-white',
                  'bg-gray-50',
                  'bg-slate-900',
                  'bg-indigo-600',
                  'bg-rose-50',
                ].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              

              {/* Custom background color */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  onChange={(e) => updateSectionBackgroundColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer rounded"
                  title="Custom background color"
                />
                <span className="text-[9px] uppercase text-slate-400 font-bold">
                  Custom BG
                </span>
              </div>
            </div>
          )}
          {/* ================= BACKGROUND  ================= */}
          {allowedControls.includes("background") && (
            <div className="flex flex-col gap-3 border-r border-slate-700 pr-5 flex-shrink-0">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Image BG
              </span>

              {/* Upload background image */}
              <div className="flex flex-col gap-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="section-bg-upload"
                  disabled={isUploading}
                />

                <label
                  htmlFor="section-bg-upload"
                  className={`text-[9px] font-bold py-2 px-3 rounded border border-dashed border-slate-600 text-center cursor-pointer hover:border-blue-400 ${
                    isUploading ? "opacity-50" : ""
                  }`}
                >
                  {isUploading ? "UPLOADING..." : "🖼 Upload BG Image"}
                </label>
              </div>

              {/* Clear background image */}
              <button
                onClick={() =>
                  setDraft(code =>
                    code.replace(/backgroundImage:\s*`[^`]*`/g, "")
                  )
                }

                className="text-[8px] text-red-400 uppercase hover:text-red-300"
              >
                Clear BG Image
              </button>
            </div>
          )}

          {/* ================= image overlay ================= */}
          {allowedControls.includes("background") && (
            <div className="flex flex-col gap-3 border-r border-slate-700 pr-5 flex-shrink-0">              
              {/* Overlay controls (only when bg image exists) */}
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                  Image Overlay
                </span>

                {/* Overlay color */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    onChange={(e) => updateImageOverlay('color', e.target.value)}
                    className="w-8 h-8 cursor-pointer rounded"
                    title="Overlay color"
                  />
                  <span className="text-[8px] uppercase text-slate-400 font-bold">
                    Color
                  </span>
                </div>

                {/* Overlay opacity */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    defaultValue="0.4"
                    onChange={(e) => updateImageOverlay('opacity', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-[8px] uppercase text-slate-400 font-bold">
                    Opacity
                  </span>
                </div>

                {/* Clear overlay */}
                <button
                  onClick={() => {
                    updateCustomColor("--overlay-color" as any, "transparent");
                    updateCustomColor("--overlay-opacity" as any, "0");
                  }}
                  className="text-[8px] text-red-400 uppercase hover:text-red-300"
                >
                  Clear Overlay
                </button>
            </div>
          )}
          {/* ================= TYPOGRAPHY ================= */}
          {allowedControls.includes("typography") && (
            <div className="flex flex-col gap-2 border-r border-slate-700 pr-5 flex-shrink-0 min-w-[200px]">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Typography
              </span>

              {/* FONT FAMILY */}
              <select
                onChange={(e) => updateStyle("", e.target.value, true)}
                className="text-[11px] bg-slate-800 border border-slate-700 rounded p-2"
              >
                <option value="">Font</option>
                {fontOptions.map((f) => (
                  <option key={f} value={f} className={f}>
                    {f}
                  </option>
                ))}
              </select>

              {/* SIZE + WEIGHT */}
              <div className="flex gap-2">
                <select
                  onChange={(e) => updateStyle("text-", e.target.value)}
                  className="text-[11px] bg-slate-800 border border-slate-700 rounded p-2"
                >
                  <option value="">Size</option>
                  {["text-sm","text-base","text-lg","text-xl","text-2xl","text-4xl"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  onChange={(e) => updateStyle("font-", e.target.value)}
                  className="text-[11px] bg-slate-800 border border-slate-700 rounded p-2"
                >
                  <option value="">Weight</option>
                  {["font-light","font-normal","font-semibold","font-bold","font-black"].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ================= SPACING ================= */}
          {allowedControls.includes("spacing") && (
            <div className="flex flex-col gap-2 border-r border-slate-700 pr-5 flex-shrink-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Spacing
              </span>

              <div className="grid grid-cols-2 gap-2">
                <select onChange={(e) => updateStyle('py-', e.target.value)} className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1">
                  <option value="">Pad Y</option>
                  {[0,4,8,12,16,24,32].map(v => (
                    <option key={v} value={`py-${v}`}>{v}</option>
                  ))}
                </select>

                <select onChange={(e) => updateStyle('px-', e.target.value)} className="text-[10px] bg-slate-800 border border-slate-700 rounded p-1">
                  <option value="">Pad X</option>
                  {[0,4,8,12,16,24,32].map(v => (
                    <option key={v} value={`px-${v}`}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button onClick={() => setSelection(null)} className="ml-auto text-slate-500 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* HEADERBAR */}
      {editable && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200 px-5 py-3 flex justify-between items-center font-[lexend]">
          {/* DEVICE SWITCH */}
          <div className="flex bg-white/70 rounded-full border border-purple-200 p-1 gap-1">
            {[
              { key: "laptop", label: "💻 Laptop" },
              { key: "mobile", label: "📲 Mobile" },
            ].map(d => (
              <button
                key={d.key}
                onClick={() => setDeviceMode(d.key as DeviceMode)}
                className={`px-3 py-1 text-[9px] font-bold rounded-full transition ${
                  deviceMode === d.key
                    ? "bg-purple-300 text-gray-900 shadow"
                    : "text-purple-400 hover:bg-purple-100"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest italic text-purple-700">
              {selection ? `Editing: ${selection.tag}` : 'Visual Editor Active'}
            </span>
          </div>
          
          <div className="flex bg-white/50 backdrop-blur-sm border border-purple-200 rounded-full p-1 gap-1 shadow-inner">
            <button 
              onClick={() => setViewMode("visual")} 
              className={`px-5 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 ${
                viewMode === "visual" 
                  ? "bg-gradient-to-b from-purple-200 to-pink-300 text-gray-800 shadow-md scale-105" 
                  : "text-purple-400 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              VISUAL
            </button>
            <button 
              onClick={() => setViewMode("code")} 
              className={`px-5 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 ${
                viewMode === "code" 
                  ? "bg-gradient-to-b from-purple-200 to-pink-300 text-gray-800 shadow-md scale-105" 
                  : "text-purple-400 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              CODE
            </button>
          </div>
        </div>
      )}

      {/* WORKSPACE */}
      <div onClick={handlePreviewClick} className="bg-white">
        {editable && viewMode === "code" ? (
          <textarea
            value={draft}
            onChange={(e) => { setDraft(e.target.value); onCodeChange(e.target.value); }}
            className="w-full h-[550px] p-8 font-mono text-[12px] bg-slate-950 text-blue-300 outline-none border-none leading-relaxed"
            spellCheck={false}
          />
        ) : (
          <div className="min-h-[100px] transition-all duration-300">
            {Component ? (
              <Component categories={categories} products={products} />
            ) : (
              <FallbackSection
                name={sectionName}
                assets={assets}
                strategy={strategy}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
