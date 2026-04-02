
export async function parseApiResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");

  if (!isJson) {
    throw new Error(text?.slice(0, 200) || `Request failed with status ${res.status}`);
  }

  const data = JSON.parse(text) as T;

  if (!res.ok) {
    const message =
      (data as { error?: string; detail?: string })?.error ||
      (data as { error?: string; detail?: string })?.detail ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function getLanding(pageId: string) {

  if (!pageId) {
    throw new Error("Missing pageId");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/`
  );

  return parseApiResponse(res);
}
