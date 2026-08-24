const fs = require("fs");
const path = require("path");

const iconCache = {};
function readIcon(name) {
  if (!iconCache[name]) {
    const file = path.join(__dirname, "assets", "icons", name + ".svg");
    iconCache[name] = fs.readFileSync(file, "utf8");
  }
  return iconCache[name];
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets/css");
  eleventyConfig.addPassthroughCopy("assets/brand");
  eleventyConfig.addPassthroughCopy("assets/icons");

  eleventyConfig.addShortcode("icon", function (name, size) {
    size = size || 20;
    return '<span class="gfn-icon" style="width:' + size + "px;height:" + size + 'px" aria-hidden="true">' + readIcon(name) + "</span>";
  });

  eleventyConfig.addShortcode("logo", function (height, variant) {
    const file = variant === "stacked" ? "gfnai-logo-default.png" : "gfnai-logo-horizontal.png";
    return (
      '<img src="/assets/brand/' + file + '" alt="GameFlowNews.Ai" class="gfn-logo-img" style="height:' +
      height +
      'px">'
    );
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
