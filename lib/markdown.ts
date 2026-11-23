/**
 * Minimaler, sicherer Markdown-Renderer für CMS-Texte: escaped jedes HTML und erlaubt nur
 * Überschriften (##, ###), Absätze, Listen, Zitate, **fett**, *kursiv* und Links (http/https/relativ).
 */
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const u = url.replace(/&amp;/g, "&");
    const ok = /^(https?:\/\/|\/(?!\/))/i.test(u);
    if (!ok) return text;
    const ext = /^https?:\/\//i.test(u);
    return `<a href="${esc(u)}"${ext ? ' rel="noopener nofollow" target="_blank"' : ""}>${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return out;
}

export function renderMarkdown(src: string): { html: string; toc: { id: string; text: string }[] } {
  const lines = (src ?? "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const toc: { id: string; text: string }[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => { if (para.length) { html.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list.length) { html.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`); list = []; } };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^##\s+(.+)/)) && !line.startsWith("###")) {
      flushPara(); flushList();
      const id = slugify(m[1]);
      toc.push({ id, text: m[1] });
      html.push(`<h2 id="${id}">${inline(m[1])}</h2>`);
    } else if ((m = line.match(/^###\s+(.+)/))) {
      flushPara(); flushList();
      html.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = line.match(/^[-*]\s+(.+)/))) {
      flushPara();
      list.push(m[1]);
    } else if ((m = line.match(/^>\s?(.*)/))) {
      flushPara(); flushList();
      html.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara(); flushList();
  return { html: html.join("\n"), toc };
}
