// Parsing puro (sem DOM) dos arquivos de /edicoes — usado em build-time pelo Eleventy.
// Mesma lógica que rodava no navegador antes de migrarmos para geração estática.
"use strict";

function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const yaml = m[1];
  const body = m[2];
  const meta = {};
  const lines = yaml.split(/\r?\n/);
  let currentListKey = null;
  lines.forEach((line) => {
    const listMatch = /^\s*-\s*(.+)$/.exec(line);
    if (listMatch && currentListKey) {
      const val = listMatch[1].trim().replace(/^"(.*)"$/, "$1");
      meta[currentListKey].push(val);
      return;
    }
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (kv) {
      const key = kv[1];
      let val = kv[2].trim();
      if (val === "") {
        meta[key] = [];
        currentListKey = key;
      } else {
        meta[key] = val.replace(/^"(.*)"$/, "$1");
        currentListKey = null;
      }
    }
  });
  return { meta, body };
}

function extractSources(text) {
  const m = /\(Fontes?:\s*([\s\S]+?)\)\.?\s*$/.exec(text.trim());
  if (!m) return { text: text.trim(), sources: [] };
  const before = text.slice(0, m.index).trim();
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const sources = [];
  let lm;
  while ((lm = linkRe.exec(m[1]))) sources.push({ label: lm[1], href: lm[2] });
  return { text: before, sources };
}

function parseIssueBody(body) {
  const lines = body.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && !lines[i].trim().startsWith("# ")) i++;
  if (i < lines.length) i++;
  const intro = [];
  while (i < lines.length && lines[i].trim() !== "---") {
    const t = lines[i].trim();
    if (t) intro.push(t);
    i++;
  }
  i++;
  const sections = [];
  let current = null;
  let pendingItem = null;
  function flushItem() {
    if (!pendingItem) return;
    const parsed = extractSources(pendingItem);
    const idx = parsed.text.indexOf(": ");
    const title = idx > -1 ? parsed.text.slice(0, idx) : parsed.text;
    const desc = idx > -1 ? parsed.text.slice(idx + 2) : "";
    current.items.push({ title, text: desc, sources: parsed.sources });
    pendingItem = null;
  }
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === "---") {
      i++;
      break;
    }
    if (t.startsWith("### ")) {
      flushItem();
      current = { heading: t.slice(4).trim(), items: [] };
      sections.push(current);
    } else if (/^-\s+/.test(t)) {
      flushItem();
      pendingItem = t.replace(/^-\s+/, "");
    } else if (t) {
      pendingItem = pendingItem ? pendingItem + " " + t : t;
    }
    i++;
  }
  flushItem();
  return { intro, sections };
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function parseISODateLocal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDatePt(iso) {
  const dt = parseISODateLocal(iso);
  return WEEKDAYS[dt.getDay()] + ", " + dt.getDate() + " " + MONTHS[dt.getMonth()] + " " + dt.getFullYear();
}

function toISODate(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function padNumber(n) {
  return String(n).padStart(3, "0");
}

function estimateReadTime(body) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)) + " min";
}

function truncate(text, max) {
  if (!text || text.length <= max) return text || "";
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 0 ? lastSpace : max).trim() + "…";
}

function beatFromHeading(heading) {
  const h = heading.toLowerCase();
  if (h.includes("produto")) return "produto";
  if (h.includes("design") || h.includes("arte")) return "design";
  if (h.includes("desenvolvimento") || h.includes("engenharia")) return "dev";
  if (h.includes("qa") || h.includes("teste")) return "qa";
  if (h.includes("marketing") || h.includes("aquisi")) return "marketing";
  if (h.includes("ia") || h.includes("pesquisa")) return "ia";
  return "dev";
}

module.exports = {
  parseFrontmatter,
  extractSources,
  parseIssueBody,
  parseISODateLocal,
  formatDatePt,
  toISODate,
  padNumber,
  estimateReadTime,
  truncate,
  beatFromHeading,
};
