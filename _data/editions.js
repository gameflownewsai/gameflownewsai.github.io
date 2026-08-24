// Lê /edicoes/*.md diretamente (sem depender do index.json) e devolve as edições
// já parseadas para os templates. Fonte única de verdade: o front matter + corpo
// de cada markdown que a automação escreve semanalmente.
const fs = require("fs");
const path = require("path");
const {
  parseFrontmatter,
  parseIssueBody,
  parseISODateLocal,
  formatDatePt,
  toISODate,
  padNumber,
  estimateReadTime,
  truncate,
  beatFromHeading,
} = require("../_lib/parse.js");
const site = require("./site.js");

const EDICOES_DIR = path.join(__dirname, "..", "edicoes");

module.exports = function () {
  const files = fs.readdirSync(EDICOES_DIR).filter((f) => f.endsWith(".md"));
  const todayISO = new Date().toISOString().slice(0, 10);

  const editions = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(EDICOES_DIR, file), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      const parsed = parseIssueBody(body);
      const slug = path.basename(file, ".md");
      const numero = Number(meta.numero);
      const linkCount = (meta.links_publicados || []).length;

      const sections = parsed.sections.map((s) => {
        const beatKey = beatFromHeading(s.heading);
        const beat = site.beats[beatKey];
        return {
          heading: s.heading,
          beatKey,
          color: beat.color,
          items: s.items,
        };
      });

      const introBody = parsed.intro.length > 1 ? parsed.intro[1] : parsed.intro[0] || "";

      const nextDate = parseISODateLocal(meta.data);
      nextDate.setDate(nextDate.getDate() + 7);

      const url = "/edicoes/" + slug + "/";
      const resumo = truncate(introBody, 280);

      const jsonLd = JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          mainEntityOfPage: site.url + url,
          headline: meta.titulo,
          description: resumo,
          url: site.url + url,
          datePublished: meta.data,
          dateModified: meta.data,
          inLanguage: "pt-BR",
          image: [site.url + "/assets/brand/gfnai-banner.png"],
          articleSection: sections.map((s) => s.heading),
          isAccessibleForFree: true,
          author: { "@type": "Organization", name: site.title, url: site.url },
          publisher: {
            "@type": "Organization",
            name: site.title,
            url: site.url,
            logo: { "@type": "ImageObject", url: site.url + "/assets/brand/gfnai-logo-horizontal.png" },
          },
        },
        null,
        2
      ).replace(/</g, "\\u003c");

      return {
        slug,
        numero,
        titulo: meta.titulo,
        data: meta.data,
        dateFormatted: formatDatePt(meta.data),
        linkedinUrl: meta.linkedin_url || "",
        linkCount,
        readTime: estimateReadTime(body),
        resumo,
        intro: parsed.intro,
        sections,
        url,
        jsonLd,
        ctaNextNumero: padNumber(numero + 1),
        ctaNextDateFormatted: formatDatePt(toISODate(nextDate)),
      };
    })
    // esconde edições com data futura (ex.: rascunhos que a automação já deixou
    // na pasta antes da terça de publicação) até a data de fato chegar
    .filter((ed) => ed.data <= todayISO);

  editions.sort((a, b) => b.numero - a.numero);

  editions.forEach((ed, i) => {
    ed.newer = i > 0 ? editions[i - 1] : null;
    ed.older = i < editions.length - 1 ? editions[i + 1] : null;
  });

  if (editions.length) {
    const latest = editions[0];
    const nextDate = parseISODateLocal(latest.data);
    nextDate.setDate(nextDate.getDate() + 7);
    editions.nextIssue = {
      numeroPadded: padNumber(latest.numero + 1),
      dateFormatted: formatDatePt(toISODate(nextDate)),
    };
  }

  return editions;
};
