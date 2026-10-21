export type EditorialIdea = {
  day: number;
  topic: string;
  angle: string;
  status: "draft_only";
};

const ANGLES = [
  "Compartilhe uma lição prática e verificável",
  "Explique um erro comum e como evitá-lo",
  "Mostre um exemplo concreto sem revelar dados privados",
  "Apresente um checklist que ajude seu público",
  "Faça uma pergunta aberta para incentivar a conversa"
] as const;

export function planContent(topic: string, count = 3): { topic: string; ideas: EditorialIdea[]; published: false } {
  const normalized = topic.trim();
  if (!normalized || normalized.length > 200) throw new Error("Tema inválido");
  if (!Number.isInteger(count) || count < 1 || count > 5) throw new Error("Quantidade inválida");
  return {
    topic: normalized,
    ideas: Array.from({ length: count }, (_, index) => ({
      day: index + 1,
      topic: normalized,
      angle: ANGLES[index],
      status: "draft_only" as const
    })),
    published: false
  };
}
