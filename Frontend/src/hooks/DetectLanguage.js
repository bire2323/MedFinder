// languageDetector.js

export function detectLanguage(text) {
  if (!text) return "en";

  // Amharic Unicode range
  const amharicRegex = /[\u1200-\u137F]/;

  const hasAmharic = amharicRegex.test(text);

  // optional: detect English letters
  const hasEnglish = /[a-zA-Z]/.test(text);

  if (hasAmharic && !hasEnglish) return "am";
  if (!hasAmharic && hasEnglish) return "en";

  // mixed language → choose dominant
  const amharicCount = (text.match(amharicRegex) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;

  return amharicCount >= englishCount ? "am" : "en";
}