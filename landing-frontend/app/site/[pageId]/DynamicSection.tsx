"use client";

import React, { useMemo } from "react";
import * as Babel from "@babel/standalone";

export default function DynamicSection({
  code,
  categories = [],
  products = [],
}: {
  code: string;
  categories?: any[];
  products?: any[];
}) {
  const Component = useMemo(() => {
    if (!code) return null;
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
      const fn = new Function("React", "exports", `
          const { useState, useEffect, useRef, useMemo } = React;
          ${transformed}
          if (exports.default) return exports.default;
          const keys = Object.keys(exports);
          return keys.length ? exports[keys[0]] : null;
      `);

      return fn(React, exports);
    } catch (err) {
      console.error("DynamicSection Error:", err);
      return null;
    }
  }, [code]);

  if (!Component) return null;

  return (
    <Component
      categories={Array.isArray(categories) ? categories : []}
      products={Array.isArray(products) ? products : []}
    />
  );
}