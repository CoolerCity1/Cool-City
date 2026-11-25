import "server-only";

export function linkedinConfigured(): boolean {
  return !!(process.env.LINKEDIN_ACCESS_TOKEN && /^urn:li:(organization|person):\w+$/.test(process.env.LINKEDIN_AUTHOR_URN ?? ""));
}

/** LinkedIn „little text“: reservierte Zeichen in commentary müssen maskiert werden. */
const escapeLittleText = (s: string) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`);

/** Erstellt einen Link-Beitrag über die LinkedIn Posts API. */
export async function postToLinkedIn(p: { title: string; teaser: string | null; url: string }): Promise<{ id: string }> {
  const version = process.env.LINKEDIN_API_VERSION || "202611";
  const commentary = escapeLittleText([p.title, p.teaser].filter(Boolean).join("\n\n")).slice(0, 2900);
  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": version,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: process.env.LINKEDIN_AUTHOR_URN,
      commentary,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { article: { source: p.url, title: p.title.slice(0, 400), ...(p.teaser ? { description: p.teaser.slice(0, 4000) } : {}) } },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
    cache: "no-store",
  });
  if (res.status !== 201) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(`LinkedIn ${res.status}: ${body.message ?? res.statusText}`);
  }
  return { id: res.headers.get("x-restli-id") ?? "" };
}
