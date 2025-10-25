import React from "react";
import { filterLowUsageLanguages, getLangColor } from "../lib/stats";
import { cn } from "../lib/utils";

type LanguageLineGraphProps = {
  languages: Record<string, number>;
  className?: string;
};

export function LanguageLineGraph({
  languages,
  className,
}: LanguageLineGraphProps) {
  const [hoveredLang, setHoveredLang] = React.useState<string | undefined>();

  const filteredLanguages = React.useMemo(
    () => filterLowUsageLanguages(languages),
    [languages],
  );

  const sortedFilteredLanguages = [...filteredLanguages].sort(
    (a, b) => b.bytes - a.bytes,
  );

  if (sortedFilteredLanguages.length === 0) {
    return <div className={cn("h-2 bg-gray-200 rounded-full", className)} />;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex rounded-full overflow-hidden">
        {sortedFilteredLanguages.map((lang, idx, langs) => (
          <div
            onMouseEnter={() => setHoveredLang(lang.name)}
            onMouseLeave={() => setHoveredLang(undefined)}
            onClick={(e) => {
              e.preventDefault();
              setHoveredLang(lang.name);
            }}
            className="h-1.5 cursor-pointer"
            key={lang.name}
            style={{
              width: `${lang.percent}%`,
              backgroundColor: getLangColor(langs, idx),
            }}
            title={`${lang.name}: ${lang.percent.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="text-xs pt-1">
        {hoveredLang ? hoveredLang : sortedFilteredLanguages[0]?.name}
      </div>
    </div>
  );
}
