/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import * as Babel from "@babel/standalone";
import { FallbackSection } from "../../../lib/fallback-section";

export default function DynamicSection({
  name,
  code,
  assets = {},
  strategy = {},
  categories = [],
  products = [],
}: {
  name: string;
  code: string;
  assets?: Record<string, unknown>;
  strategy?: Record<string, unknown>;
  categories?: any[];
  products?: any[];
}) {
  const { Component, error } = useMemo(() => {
    if (!code) return { Component: null, error: "Missing section code" };
    try {
      let cleanedCode = code.replace(/import.*?;\n?/g, "");
      cleanedCode = cleanedCode.replace(/^\s*return\s+([A-Za-z0-9_]+)\s*;?\s*$/gm, "exports.default = $1;");
      cleanedCode = cleanedCode.replace(/^\s*function\s+([A-Za-z0-9_]+)\s*\(/m, "exports.default = function $1(");

      const transformed = Babel.transform(cleanedCode, {
        filename: "section.tsx",
        presets: ["react", "typescript"],
        plugins: ["transform-modules-commonjs"],
      }).code as string;

      const exports: any = {};
      const fn = new Function("React", "exports", "IMAGE_ASSETS", "SECTION_STRATEGY", `
          const { useState, useEffect, useRef, useMemo, useLayoutEffect, useId } = React;
          ${transformed}
          if (exports.default) return exports.default;
          const keys = Object.keys(exports);
          return keys.length ? exports[keys[0]] : null;
      `);

      return { Component: fn(React, exports, assets, strategy), error: null };
    } catch (err) {
      console.error("DynamicSection Error:", err);
      return {
        Component: null,
        error: err instanceof Error ? err.message : "Section render failed",
      };
    }
  }, [code, assets, strategy]);

  if (!Component) {
    console.error(`Fallback render used for section "${name}":`, error);
    return <FallbackSection name={name} assets={assets} strategy={strategy} />;
  }

  return (
    <Component
      categories={Array.isArray(categories) ? categories : []}
      products={Array.isArray(products) ? products : []}
    />
  );
}
