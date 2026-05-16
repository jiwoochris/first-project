const PAGE_FETCH_TIMEOUT_MS = 8_000;
const OPENROUTER_TIMEOUT_MS = 12_000;
const MAX_PAGE_BYTES = 200 * 1024;
const MAX_PAGE_CHARS = 6_000;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-3.1-flash-lite";

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagContent(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]).trim() || null : null;
}

function extractMetaDescription(html: string): string | null {
  const match = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  return match ? match[1].trim() || null : null;
}

function extractMetaContent(html: string, attr: "property" | "name", key: string): string | null {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["'][^>]*>`,
    "i",
  );
  const m = html.match(re) ?? html.match(re2);
  return m ? m[1].trim() || null : null;
}

function extractLinkHref(html: string, rel: string): string | null {
  const re = new RegExp(
    `<link[^>]+rel=["']${rel}["'][^>]*href=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const re2 = new RegExp(
    `<link[^>]+href=["']([^"']*)["'][^>]*rel=["']${rel}["'][^>]*>`,
    "i",
  );
  const m = html.match(re) ?? html.match(re2);
  return m ? m[1].trim() || null : null;
}

function extractFirstImg(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1].trim() || null : null;
}

function resolveUrl(candidate: string, baseUrl: string): string | null {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

function pickImageFromHtml(html: string, baseUrl: string): string | null {
  const candidates = [
    extractMetaContent(html, "property", "og:image:secure_url"),
    extractMetaContent(html, "property", "og:image:url"),
    extractMetaContent(html, "property", "og:image"),
    extractMetaContent(html, "name", "og:image"),
    extractMetaContent(html, "name", "twitter:image"),
    extractMetaContent(html, "name", "twitter:image:src"),
    extractLinkHref(html, "image_src"),
    extractLinkHref(html, "apple-touch-icon"),
    extractFirstImg(html),
  ];
  for (const c of candidates) {
    if (!c) continue;
    const resolved = resolveUrl(c, baseUrl);
    if (resolved && /^https?:\/\//i.test(resolved)) return resolved;
  }
  return null;
}

export type PageInfo = {
  text: string | null;
  imageUrl: string | null;
};

export async function fetchPageInfo(url: string): Promise<PageInfo> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(PAGE_FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProjectGalleryBot/1.0)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
      },
    });
    if (!res.ok || !res.body) {
      console.warn(`[summarize] fetch ${url} returned status ${res.status}`);
      return { text: null, imageUrl: null };
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(contentType)) {
      console.warn(`[summarize] skipping non-text content-type: ${contentType}`);
      return { text: null, imageUrl: null };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    let collected = "";
    let bytes = 0;
    while (bytes < MAX_PAGE_BYTES) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      collected += decoder.decode(value, { stream: true });
    }
    try {
      await reader.cancel();
    } catch {
      // ignore
    }
    collected += decoder.decode();

    const finalUrl = res.url || url;
    const imageUrl = pickImageFromHtml(collected, finalUrl);
    const title = extractTagContent(collected, "title");
    const metaDesc = extractMetaDescription(collected);
    const body = stripHtml(collected);

    const parts: string[] = [];
    if (title) parts.push(`제목: ${title}`);
    if (metaDesc) parts.push(`메타 설명: ${metaDesc}`);
    parts.push(`본문: ${body}`);
    const combined = parts.join("\n");
    return { text: combined.slice(0, MAX_PAGE_CHARS), imageUrl };
  } catch (err) {
    console.warn(`[summarize] fetchPageInfo failed for ${url}:`, err);
    return { text: null, imageUrl: null };
  }
}

export async function fetchPageText(url: string): Promise<string | null> {
  const info = await fetchPageInfo(url);
  return info.text;
}

type SummarizeInput = {
  title: string;
  url: string;
  pageText: string;
};

export async function summarizeWithGemini(
  input: SummarizeInput,
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[summarize] OPENROUTER_API_KEY is not set");
    return null;
  }

  const systemPrompt =
    "당신은 웹 프로젝트를 3줄로 요약하는 한국어 어시스턴트입니다. " +
    "정확히 세 줄로 응답하고, 각 줄은 한 문장이며, 줄바꿈(\\n)으로 구분합니다. " +
    "마크다운, 번호, 불릿, 따옴표를 쓰지 마세요. " +
    "사이트 내용에 충실하게 작성하고, 정보가 부족하면 추측하지 말고 일반적인 사실만 진술하세요.";

  const userPrompt =
    `프로젝트 제목: ${input.title}\n` +
    `URL: ${input.url}\n\n` +
    `사이트 내용:\n${input.pageText}`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost",
        "X-Title": "Project Gallery",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 240,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(
        `[summarize] OpenRouter returned ${res.status}: ${errText.slice(0, 300)}`,
      );
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      console.warn("[summarize] OpenRouter response missing content");
      return null;
    }
    const cleaned = raw
      .split("\n")
      .map((line) => line.replace(/^[-*\d.\s)]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3)
      .join("\n");
    return cleaned || null;
  } catch (err) {
    console.warn("[summarize] summarizeWithGemini failed:", err);
    return null;
  }
}
