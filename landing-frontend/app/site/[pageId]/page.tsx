"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Loading from "./loading";

const DynamicSection = dynamic(
  () => import("./DynamicSection"),
  { ssr: false }
);

export default function Page() {

  const params = useParams();
  const pageId = params.pageId as string;

  const [data, setData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  useEffect(() => {

    if (!pageId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {

        if (!json) return;

        setData(json);

        const order =
          json.section_order ||
          Object.keys(json.sections || {});

        setSectionOrder(order);

      });

    if (!document.getElementById("tailwind-cdn")) {

      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => setIsReady(true);

      document.head.appendChild(script);

    } else {
      setIsReady(true);
    }

  }, [pageId]);

  if (!isReady || !data) return <Loading />;

  const sections = data.sections || {};

  return (
    <main>

      {sectionOrder.map((key) => {

        const section = sections[key];

        if (!section?.code) return null;

        return (
          <DynamicSection
            key={key}
            code={section.code}
          />
        );

      })}

    </main>
  );
}
