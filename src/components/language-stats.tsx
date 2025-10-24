import React from "react";
import { Cell, Pie, PieChart, type PieLabelRenderProps } from "recharts";
import colors from "tailwindcss/colors";
import type { DetailedRepo, Language } from "../types/repo";
import { AccountDetailsHeading } from "./account-details-heading";
import { IconCard } from "./ui/icon-card";
import { formatBigNumber } from "../lib/utils";
import { LikeIcon } from "./ui/icons/like";
import { Dislike } from "./ui/icons/dislike";

export type RepoStatsProps = { repos: DetailedRepo[] };

function LanguageUsageCard({
  icon,
  title,
  name,
  bytes,
}: {
  icon: React.ReactNode;
  name: string;
  bytes: number;
  title: string;
}) {
  return (
    <IconCard icon={icon}>
      <div>
        <h5 className="text-xs text-gray-500 pb-1">{title}</h5>
        <p className="text-sm">
          {name}{" "}
          <span className="text-gray-500 font-medium">
            {formatBigNumber(bytes)} (bytes)
          </span>
        </p>
      </div>
    </IconCard>
  );
}

function PieLabel(props: PieLabelRenderProps) {
  const { x, y, cx } = props;
  if (cx !== undefined) {
    return (
      <text
        x={x}
        y={y}
        className="text-gray-900 text-[11px] md:text-[12px]"
        textAnchor={x > Number(cx) ? "start" : "end"}
        dominantBaseline="central"
      >
        {props.name}
      </text>
    );
  }
}

const COLOR_VARIANT = 500;

const LANG_MAPPED_COLORS: Record<string, string> = {
  java: colors.amber[COLOR_VARIANT],
  typescript: colors.sky[COLOR_VARIANT],
  javascript: colors.yellow[COLOR_VARIANT],
  python: colors.emerald[COLOR_VARIANT],
  go: colors.cyan[COLOR_VARIANT],
  other: colors.indigo[COLOR_VARIANT],
};

const RANDOM_COLORS = [
  colors.rose[COLOR_VARIANT],
  colors.cyan[COLOR_VARIANT],
  colors.fuchsia[COLOR_VARIANT],
  colors.lime[COLOR_VARIANT],
  colors.violet[COLOR_VARIANT],
  colors.purple[COLOR_VARIANT],
  colors.teal[COLOR_VARIANT],
];

function getLangColor(langs: Language[], idx: number): string {
  const lang = langs[idx];
  return lang.name.toLowerCase() in LANG_MAPPED_COLORS
    ? LANG_MAPPED_COLORS[lang.name.toLowerCase()]
    : RANDOM_COLORS[idx % RANDOM_COLORS.length];
}

export function LanguageStats({ repos }: RepoStatsProps) {
  const languageStatsDict: Record<string, number> = React.useMemo(() => {
    const languageDict: Record<string, number> = {};
    for (const r of repos) {
      for (const l of r.languages) {
        languageDict[l.name] = (languageDict[l.name] || 0) + l.bytes;
      }
    }
    return languageDict;
  }, [repos]);

  const languageStatsWithDampedOutliers = React.useMemo(() => {
    const total = Object.entries(languageStatsDict).reduce(
      (sum, [_, bytes]) => sum + bytes,
      0,
    );

    let otherBytes = 0;
    const results: Language[] = [];
    for (const [name, bytes] of Object.entries(languageStatsDict)) {
      if (bytes / total < 0.05) {
        otherBytes += bytes;
      } else {
        results.push({ name, bytes });
      }
    }
    if (otherBytes > 0) {
      results.push({ name: "Other", bytes: otherBytes });
    }
    return results;
  }, [languageStatsDict]);

  const { mostUsed, leastUsed, leastUsedBytes, mostUsedBytes } =
    React.useMemo(() => {
      let mostUsedBytes = -1;
      let mostUsed = undefined;
      let leastUsedBytes = Infinity;
      let leastUsed = undefined;
      for (const [name, bytes] of Object.entries(languageStatsDict)) {
        if (bytes > mostUsedBytes) {
          mostUsed = name;
          mostUsedBytes = bytes;
        }
        if (bytes < leastUsedBytes) {
          leastUsed = name;
          leastUsedBytes = bytes;
        }
      }
      return { mostUsed, mostUsedBytes, leastUsed, leastUsedBytes };
    }, [languageStatsDict]);

  return (
    <div className="flex flex-col">
      <AccountDetailsHeading>Language Stats</AccountDetailsHeading>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <LanguageUsageCard
          icon={<LikeIcon />}
          title="Most used"
          name={mostUsed ?? ""}
          bytes={mostUsedBytes}
        />

        <LanguageUsageCard
          icon={<Dislike />}
          title="Least used"
          name={leastUsed ?? ""}
          bytes={leastUsedBytes}
        />
      </div>
      <PieChart responsive style={{ width: "100%", height: "100%" }}>
        <Pie
          dataKey="bytes"
          data={languageStatsWithDampedOutliers}
          cornerRadius={4}
          outerRadius={"70%"}
          label={PieLabel}
        >
          {languageStatsWithDampedOutliers.map((entry, idx, langs) => (
            <Cell key={entry.name} fill={getLangColor(langs, idx)} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}
