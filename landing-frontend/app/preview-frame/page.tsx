"use client";

import { useEffect, useState } from "react";
import LandingRenderer from "../components/LandingRenderer";
import type { LandingPageResponse } from "../../lib/landing";

export default function PreviewFramePage() {
  const [page, setPage] = useState<LandingPageResponse | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }

      if (data.type === "landing-preview:update" && data.payload) {
        setPage(data.payload as LandingPageResponse);
      }
    }

    window.addEventListener("message", handleMessage);
    window.parent?.postMessage({ type: "landing-preview:ready" }, window.location.origin);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617,#020617_12%,#081226_100%)] text-white">
      {page ? (
        <LandingRenderer page={page} />
      ) : (
        <div className="flex min-h-screen items-center justify-center px-6 text-sm text-slate-400">
          Loading preview...
        </div>
      )}
    </div>
  );
}
