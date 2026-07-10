"use client";

// Stopwords comuns em português (acadêmico)
const STOPWORDS = new Set([
  "a", "à", "ao", "aos", "as", "às", "com", "como", "da", "das", "de", "do",
  "dos", "e", "é", "em", "entre", "era", "essa", "esse", "esta", "este",
  "eu", "foi", "isso", "já", "lhe", "lhes", "mais", "mas", "me", "meu",
  "meus", "minha", "minhas", "na", "nas", "não", "nem", "no", "nos", "nós",
  "num", "numa", "o", "os", "ou", "para", "pela", "pelas", "pelo", "pelos",
  "por", "qual", "quando", "que", "quem", "se", "sem", "seu", "seus", "sua",
  "suas", "são", "também", "te", "teu", "teus", "tu", "tua", "tuas", "um",
  "uma", "você", "vos", "isto", "aquilo", "está", "estamos", "estão",
  "outro", "outra", "outros", "outras", "ser", "tudo", "vocês",
  "sobre", "até", "desde", "durante", "após", "antes", "contra", "sob",
  "todos", "todas", "cada", "muito", "pouco", "algum", "alguma",
  "isso", "esteve", "estive", "estiveram", "estava", "estavam",
]);

// Abreviações acadêmicas ABNT que terminam com . mas NÃO quebram frase
const ABBREVIATIONS = new Set([
  "prof", "profa", "dr", "dra", "eng", "adv", "resp",
  "art", "p", "pp", "fig", "tab", "vol", "ed", "op", "cit",
  "ex", "etc", "nº", "n°", "apud", "al",
]);

/**
 * Remove acentos de uma string (só pra cálculo de TF-IDF, não pra exibição).
 * "ação" → "acao", "problema" → "problema"
 */
function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Verifica se uma palavra é abreviação (termina com . mas não quebra frase).
 */
function isAbbreviation(word: string): boolean {
  const lower = word.toLowerCase().replace(/\.$/, "");
  return ABBREVIATIONS.has(lower);
}

/**
 * Divide texto em frases, lidando com abreviações e números decimais.
 *
 * Regras:
 * - Ponto seguido de MAIÚSCULA = quebra de frase
 * - Ponto seguido de minúscula = provavelmente não quebra (ex: "2.5 metros")
 * - Abreviações ("Prof.", "art.", "Fig.") não quebram frase
 * - Números ("2.5", "10.000") não quebram frase
 */
export function splitSentences(text: string): string[] {
  if (!text.trim()) return [];

  const clean = text.replace(/\s+/g, " ").trim();

  // Texto curto: retorna como 1 frase
  if (clean.length < 100) return [clean];

  const sentences: string[] = [];
  let current = "";
  const words = clean.split(/(\s+)/);

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    current += w;

    if (!/[.!?]$/.test(w)) continue;

    // É abreviação? (Prof., art., Fig., etc.)
    if (isAbbreviation(w)) continue;

    // Ponto seguido de minúscula ou número → provavelmente decimal/número, não quebra
    const nextWord = (words[i + 1] || "").replace(/^\s+/, "");
    if (nextWord && /^[a-zà-öø-ÿ0-9]/.test(nextWord)) continue;

    // Verifica se há conteúdo significativo depois
    const remaining = words.slice(i + 1).join("").trim();
    if (remaining.length > 30 || sentences.length >= 4) {
      sentences.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) sentences.push(current.trim());
  return sentences.length > 0 ? sentences : [clean];
}

/**
 * Tokeniza texto: normaliza acentos, lowercase, remove stopwords.
 */
function tokenize(text: string): string[] {
  return stripAccents(text.toLowerCase())
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function tf(word: string, words: string[]): number {
  return words.filter((w) => w === word).length / words.length;
}

function idf(word: string, allSentenceWords: string[][]): number {
  const total = allSentenceWords.length;
  const containing = allSentenceWords.filter((ws) => ws.includes(word)).length;
  return Math.log(total / (containing + 1)) + 1;
}

function sentenceScore(words: string[], allSentenceWords: string[][]): number {
  if (words.length === 0) return 0;
  let score = 0;
  const counted = new Set<string>();
  for (const word of words) {
    if (counted.has(word)) continue;
    counted.add(word);
    score += tf(word, words) * idf(word, allSentenceWords);
  }
  return score / Math.sqrt(words.length);
}

/**
 * Sumarização extrativa: seleciona as N frases mais importantes.
 *
 * - Se ≤3 frases: usa texto completo truncado (seção curta)
 * - Se >3 frases: TF-IDF seleciona top N
 *
 * @param text - Texto da seção
 * @param maxBullets - Máximo de bullets (default 5)
 * @returns Texto formatado com bullets
 */
export function extractiveSummarize(text: string, maxBullets: number = 5): string {
  if (!text.trim()) return "";

  const sentences = splitSentences(text);

  // Seção curta: usa tudo truncado se muito longo
  if (sentences.length <= 3) {
    const full = sentences.join(" ");
    if (full.length <= 300) {
      return `• ${full.replace(/[.!?]$/, "")}`;
    }
    // Trunca em frase completa
    const truncated = full.slice(0, 297).replace(/[^ ]*$/, "").trim();
    return `• ${truncated}…`;
  }

  // TF-IDF: tokeniza todas as frases
  const allSentenceWords = sentences.map((s) => tokenize(s));

  const scored = sentences.map((s, i) => ({
    sentence: s,
    score: sentenceScore(allSentenceWords[i], allSentenceWords),
    index: i,
  }));

  // Ordena por score (maior primeiro)
  scored.sort((a, b) => b.score - a.score);

  // Pega top N e reordena por posição original
  const top = scored.slice(0, maxBullets);
  top.sort((a, b) => a.index - b.index);

  return top
    .map((t) => `• ${t.sentence.replace(/[.!?]$/, "")}`)
    .join("\n");
}
