export type PostReview = {
  text: string;
  characters: number;
  warnings: string[];
  published: false;
};

export function reviewPost(value: string): PostReview {
  const text = value.trim();
  if (text.length < 1 || text.length > 3000) {
    throw new Error("Post deve conter de 1 a 3000 caracteres");
  }
  const warnings: string[] = [];
  if (/https?:\/\/\S+/i.test(text)) warnings.push("Verifique os links antes de publicar");
  if (/(?:^|\s)#[\p{L}\p{N}_]+/gu.test(text) && (text.match(/#[\p{L}\p{N}_]+/gu) ?? []).length > 5) {
    warnings.push("Considere reduzir a quantidade de hashtags");
  }
  return { text, characters: Array.from(text).length, warnings, published: false };
}
