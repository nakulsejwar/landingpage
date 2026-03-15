

export async function getLanding(pageId: string) {

  if (!pageId) {
    throw new Error("Missing pageId");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}page/${pageId}/`
  );

  return res.json();
}