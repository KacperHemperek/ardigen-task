import React from "react";
import { Cell, Pie, PieChart, type PieLabelRenderProps } from "recharts";
import { filterLowUsageLanguages, getLangColor } from "../lib/stats";
import type { DetailedRepo } from "../types/repo";
import { Heading } from "./ui/heading";
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

export function LanguageStats({ repos }: RepoStatsProps) {
  const languageStatsDict: Record<string, number> = React.useMemo(() => {
    const languageDict: Record<string, number> = {};
    for (const r of repos) {
      for (const [name, bytes] of Object.entries(r.languages)) {
        languageDict[name] = (languageDict[name] || 0) + bytes;
      }
    }
    return languageDict;
  }, [repos]);

  const languageStatsWithDampedOutliers = React.useMemo(
    () => filterLowUsageLanguages(languageStatsDict),
    [languageStatsDict],
  );

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
      <Heading>Language Stats</Heading>
      <div className="grid grid-cols-1 gap-4">
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
      <div className="flex max-h-min">
        <PieChart responsive style={{ width: "100%", height: "100%" }}>
          <Pie
            dataKey="bytes"
            data={languageStatsWithDampedOutliers}
            cornerRadius={4}
            outerRadius={"60%"}
            label={PieLabel}
          >
            {languageStatsWithDampedOutliers.map((entry, idx, langs) => (
              <Cell key={entry.name} fill={getLangColor(langs, idx)} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
}
