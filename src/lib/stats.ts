import colors from "tailwindcss/colors";
import type { Language, LanguageWithPercent } from "../types/repo";

const COLOR_VARIANT = 500;

const LANG_MAPPED_COLORS: Record<string, string> = {
  java: colors.amber[COLOR_VARIANT],
  typescript: colors.sky[COLOR_VARIANT],
  javascript: colors.yellow[COLOR_VARIANT],
  python: colors.emerald[COLOR_VARIANT],
  go: colors.cyan[COLOR_VARIANT],
  "c++": colors.rose[COLOR_VARIANT],
  html: colors.orange[COLOR_VARIANT],
  css: colors.lime[COLOR_VARIANT],
  other: colors.indigo[COLOR_VARIANT],
};

const RANDOM_COLORS = [
  colors.violet[COLOR_VARIANT],
  colors.purple[COLOR_VARIANT],
  colors.teal[COLOR_VARIANT],
  colors.pink[COLOR_VARIANT],
  colors.fuchsia[COLOR_VARIANT],
];

export function getLangColor(langs: Language[], idx: number): string {
  const lang = langs[idx];
  return lang.name.toLowerCase() in LANG_MAPPED_COLORS
    ? LANG_MAPPED_COLORS[lang.name.toLowerCase()]
    : RANDOM_COLORS[idx % RANDOM_COLORS.length];
}

/**
 * Determine if the repository has a low issue count compared to stars.
 *
 * @param issues - The number of issues in the repository
 * @param stars - The number of stars in the repository
 * @returns true if the issue count is low, false otherwise
 */
export function isLowIssueCount(issues: number, stars: number): boolean {
  const issueToStarRatio = issues / stars;
  return issueToStarRatio < 0.05 && stars >= 150;
}

/**
 * Return total number of bytes across all languages.
 *
 * @param languages - A record of language names to byte counts
 * @returns The total number of bytes
 */
export function getTotalBytes(languages: Record<string, number>): number {
  return Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
}

/**
 * Filter out languages that make up less than 5% of the total bytes.
 * Aggregate these into an "Other" category.
 *
 * @param languages - A record of language names to byte counts
 * @returns An array of languages with their percentage and byte count
 */
export function filterLowUsageLanguages(
  languages: Record<string, number>,
): LanguageWithPercent[] {
  const totalBytes = getTotalBytes(languages);
  const filtered: LanguageWithPercent[] = [];
  let otherBytes = 0;
  for (const [name, bytes] of Object.entries(languages)) {
    if (bytes / totalBytes >= 0.05) {
      const percent = (bytes / totalBytes) * 100;
      filtered.push({ percent, name, bytes });
    } else {
      otherBytes += bytes;
    }
  }
  if (otherBytes > 0) {
    const percent = (otherBytes / totalBytes) * 100;
    filtered.push({ name: "Other", bytes: otherBytes, percent });
  }
  return filtered;
}
