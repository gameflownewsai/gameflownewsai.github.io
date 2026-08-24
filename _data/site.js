module.exports = {
  url: "https://gameflownewsai.github.io",
  title: "GameFlowNews.Ai",
  description:
    "Sua dose semanal de conteúdo selecionado sobre IA aplicada à indústria de games: produto, design, desenvolvimento, QA e marketing. Toda terça, 9h BRT.",
  linkedinFollowUrl: "https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7495120711884210179",
  beats: {
    produto: { label: "Produto & Game Design", color: "var(--beat-produto)", icon: "package", copy: "Economia, balanceamento, monetização híbrida, regras." },
    design: { label: "Design & Arte", color: "var(--beat-design)", icon: "palette", copy: "UI/UX, concept art, pipelines 2D/3D, ControlNet, LoRAs." },
    dev: { label: "Desenvolvimento & Engenharia", color: "var(--beat-dev)", icon: "cpu", copy: "Godot, Unity, MCP servers, editores assistidos, IA procedural." },
    qa: { label: "QA & Testes Automatizados", color: "var(--beat-qa)", icon: "bug", copy: "Playtesting autônomo, detecção de bugs, CI/CD." },
    marketing: { label: "Marketing & User Acquisition (UA)", color: "var(--beat-marketing)", icon: "megaphone", copy: "ASO, playables, compra de mídia, métricas mobile." },
    ia: { label: "Pesquisa & IA", color: "var(--beat-ia)", icon: "sparkles", copy: "" },
  },
  beatOrder: ["produto", "design", "dev", "qa", "marketing"],
};
