import { test } from "node:test";
import assert from "node:assert/strict";
import { href, resolveRoute, routes, locales } from "../lib/i18n/config.ts";
import { renderMarkdown } from "../lib/markdown.ts";
import { buildIcs } from "../lib/ics.ts";

test("jede Route ist in jeder Sprache auflösbar und eindeutig", () => {
  for (const l of locales) {
    const seen = new Set<string>();
    for (const id of Object.keys(routes) as (keyof typeof routes)[]) {
      const path = href(l, id);
      assert.ok(!seen.has(path), `Doppelter Pfad ${path}`);
      seen.add(path);
      const segs = path.split("/").filter(Boolean).slice(1);
      assert.equal(resolveRoute(l, segs)?.id, id);
    }
  }
});

test("Sprachwechsel behält die Seite", () => {
  assert.equal(href("en", "municipalities"), "/en/municipalities");
  assert.equal(href("fr", "investors"), "/fr/investisseurs");
  assert.equal(href("de", "home"), "/de");
});

test("Markdown escaped HTML und blockiert javascript:-Links", () => {
  const { html, toc } = renderMarkdown("## Titel\n<script>alert(1)</script>\n[x](javascript:alert(1)) [ok](https://cooler.city)");
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(html.includes('href="https://cooler.city"'));
  assert.equal(toc[0].id, "titel");
});

test("ICS enthält Start, Ende und UID", () => {
  const ics = buildIcs({ uid: "abc", title: "Test, Webinar", start: "2027-05-01T08:00:00Z", durationMinutes: 45 });
  assert.match(ics, /DTSTART:20270501T080000Z/);
  assert.match(ics, /DTEND:20270501T084500Z/);
  assert.match(ics, /SUMMARY:Test\\, Webinar/);
});
