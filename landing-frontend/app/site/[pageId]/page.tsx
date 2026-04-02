"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LandingRenderer from "../../components/LandingRenderer";
import Loading from "./loading";
import { parseApiResponse } from "../../../lib/api";
import type { LandingPageResponse } from "../../../lib/landing";

export default function Page() {
  const params = useParams();
  const pageId = params.pageId as string;
  const [data, setData] = useState<LandingPageResponse | null>(null);

  useEffect(() => {
    if (!pageId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/`)
      .then((res) => parseApiResponse<LandingPageResponse>(res))
      .then(setData)
      .catch((err) => {
        console.error(err);
      });
  }, [pageId]);

  if (!data) return <Loading />;

  return <LandingRenderer page={data} />;
}
