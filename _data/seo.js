// JSON-LD do site (Organization/WebSite/ItemList das edições) para a home.
// Cada edição carrega seu próprio NewsArticle (ver jsonLd em editions.js) —
// aqui só cobrimos o que é global ao site.
const site = require("./site.js");
const getEditions = require("./editions.js");

module.exports = function () {
  const editions = getEditions();

  const organization = {
    "@type": "Organization",
    name: site.title,
    url: site.url,
    logo: { "@type": "ImageObject", url: site.url + "/assets/brand/gfnai-logo-horizontal.png" },
    sameAs: [site.linkedinFollowUrl].filter(Boolean),
  };

  const homeGraph = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        {
          "@type": "WebSite",
          name: site.title,
          url: site.url,
          description: site.description,
          inLanguage: "pt-BR",
          publisher: organization,
        },
        {
          "@type": "ItemList",
          name: "Edições do GameFlowNews.Ai",
          itemListElement: editions.map((ed, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: site.url + ed.url,
            name: ed.titulo,
          })),
        },
      ],
    },
    null,
    2
  ).replace(/</g, "\\u003c");

  return { homeGraph };
};
