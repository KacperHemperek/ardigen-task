import { useQuery } from "@tanstack/react-query";
import type { OctokitResponse } from "@octokit/types";
import colors from "tailwindcss/colors";
import { repositoryDetailsRoute } from "../router";
import { api } from "../api";
import type { DetailedRepoWithBranches, MonthlyActivity } from "../types/repo";
import {
  cn,
  commitFromResponse,
  formatBigNumber,
  repoFromResponse,
} from "../lib/utils";
import { Button } from "../components/ui/button";
import React from "react";
import { Heading } from "../components/ui/heading";
import { Banner } from "../components/ui/banner";
import { CircleMinusIcon } from "../components/ui/icons/circle-minus";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StarIcon } from "../components/ui/icons/star";
import { GitHubIcon } from "../components/ui/icons/github";
import { LanguageLineGraph } from "../components/language-line-graph";
import { RepoTags } from "../components/repo-tags";
import { LoadingIcon } from "../components/ui/icons/loading";
import { DotsIcon } from "../components/ui/icons/dots";

const DEFAULT_BRANCH_LIMIT = 5;

function getAllPagesForPagination(response: OctokitResponse<any>) {
  const allRequests = [];
  const linkHeader = response.headers.link;
  if (linkHeader) {
    const pages = linkHeader
      .split(",")
      .map((part) => {
        const [url] = part.split(";");
        const urlObject = new URL(url.trim().slice(1, -1));
        return Number(urlObject.searchParams.get("page"));
      })
      .filter((v) => !isNaN(v));

    const totalPages = Math.max(...pages);
    for (let page = 2; page <= totalPages; page++) {
      allRequests.push(page);
    }
  }
  return allRequests;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("us-EN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function RepoDetails() {
  const params = repositoryDetailsRoute.useParams();
  const [branchName, setBranchName] = React.useState<string | undefined>();
  const [branchLimit, setBranchLimit] =
    React.useState<number>(DEFAULT_BRANCH_LIMIT);

  const { data: repoDetails, isLoading: isLoadingRepoDetails } =
    useQuery<DetailedRepoWithBranches>({
      queryKey: ["account", params.username, "repo", params.repoName],
      refetchOnWindowFocus: false,
      queryFn: async () => {
        const firstBranchesPageResponse = await api.request(
          "GET /repos/{owner}/{repo}/branches",
          {
            owner: params.username,
            repo: params.repoName,
            page: 1,
            per_page: 100,
          },
        );

        const allBranchPages = getAllPagesForPagination(
          firstBranchesPageResponse,
        );
        const allBranchRequests = Promise.all(
          allBranchPages.map((page) =>
            api.request("GET /repos/{owner}/{repo}/branches", {
              owner: params.username,
              repo: params.repoName,
              page,
              per_page: 100,
            }),
          ),
        );

        const repoReq = api.request("GET /repos/{owner}/{repo}", {
          owner: params.username,
          repo: params.repoName,
        });
        const langReq = api.request("GET /repos/{owner}/{repo}/languages", {
          owner: params.username,
          repo: params.repoName,
        });
        const [repoResponse, languagesResponse, allBranchReesponses] =
          await Promise.all([repoReq, langReq, allBranchRequests]);
        console.log("Refetched repo details");
        return {
          ...repoFromResponse(repoResponse.data),
          languages: languagesResponse.data,
          branches: [
            ...firstBranchesPageResponse.data,
            ...allBranchReesponses.map((res) => res.data).flat(),
          ].map((branch) => branch.name),
        };
      },
    });

  const selectedBranchName = React.useMemo(
    () => branchName ?? repoDetails?.defaultBranch,
    [branchName, repoDetails?.defaultBranch],
  );

  const { data: commits, isLoading: isLoadingCommits } = useQuery({
    queryKey: [
      "account",
      params.username,
      "repo",
      params.repoName,
      selectedBranchName,
      "commits",
    ],
    enabled: !!repoDetails,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const firstCommitsPageResponse = await api.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          sha: selectedBranchName,
          owner: params.username,
          repo: params.repoName,
          page: 1,
          per_page: 100,
        },
      );
      const allCommitPages = getAllPagesForPagination(firstCommitsPageResponse);
      const allCommitResponses = await Promise.all(
        allCommitPages.map((page) =>
          api.request("GET /repos/{owner}/{repo}/commits", {
            owner: params.username,
            repo: params.repoName,
            page,
            per_page: 100,
          }),
        ),
      );
      return [
        ...firstCommitsPageResponse.data.map(commitFromResponse),
        ...allCommitResponses
          .map((res) => res.data.map(commitFromResponse))
          .flat(),
      ];
    },
  });

  const {
    data: latestDetailedCommits,
    isLoading: isLoadingLatestDetailedCommits,
  } = useQuery({
    queryKey: [
      "account",
      params.username,
      "repo",
      params.repoName,
      selectedBranchName,
      "detailed-commits",
    ],
    enabled: !!commits,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!commits) throw new Error("Commits not loaded");
      if (commits.length === 0) return [];

      const detailedCommitRequests = commits.slice(0, 5).map((commit) =>
        api.request("GET /repos/{owner}/{repo}/commits/{ref}", {
          owner: params.username,
          repo: params.repoName,
          ref: commit.sha,
        }),
      );
      const detailedCommitResponses = await Promise.all(detailedCommitRequests);
      return detailedCommitResponses.map((res) => ({
        ...commitFromResponse(res.data),
        total: res.data.stats?.total ?? 0,
        additions: res.data.stats?.additions ?? 0,
        deletions: res.data.stats?.deletions ?? 0,
      }));
    },
  });

  const montlhyActivityData: MonthlyActivity[] = React.useMemo(() => {
    if (!commits) return [] as MonthlyActivity[];
    const monthlyActivityMap: Record<string, number> = {};
    commits.forEach((commit) => {
      const monthKey = `${commit.commitedAt.getFullYear()}-${(
        commit.commitedAt.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;
      monthlyActivityMap[monthKey] = (monthlyActivityMap[monthKey] || 0) + 1;
    });
    return Object.entries(monthlyActivityMap)
      .map(([month, commitCount]) => ({
        month,
        commitCount,
      }))
      .reverse();
  }, [commits]);

  const mostActiveContributors = React.useMemo(() => {
    if (!commits) return [];
    const contributorMap: Record<
      string,
      { login: string; commitCount: number }
    > = {};
    commits.forEach((commit) => {
      const authorLogin = commit.author.name;
      if (!contributorMap[authorLogin]) {
        contributorMap[authorLogin] = { login: authorLogin, commitCount: 0 };
      }
      contributorMap[authorLogin].commitCount += 1;
    });

    return Object.values(contributorMap)
      .sort((a, b) => b.commitCount - a.commitCount)
      .slice(0, 3);
  }, [commits]);

  const branchListLength = repoDetails?.branches.length || 0;
  // Filter out the default branch name from the count since it is shown at the top of the list
  const branchNamesShown =
    repoDetails?.branches
      .filter((branchName) => branchName !== repoDetails.defaultBranch)
      .slice(0, branchLimit - 1) || [];

  if (
    isLoadingCommits ||
    isLoadingRepoDetails ||
    isLoadingLatestDetailedCommits
  ) {
    return (
      <div className="flex items-center min-h-svh">
        <Banner title="Loading repository details" icon={<LoadingIcon />} />
      </div>
    );
  }

  if (!repoDetails) {
    return (
      <Banner
        icon={<CircleMinusIcon />}
        title="No repository data"
        subtitle="We could not find the repository you are looking for. It may have been deleted or made private."
      />
    );
  }

  return (
    <>
      <header className="flex min-w-0 mb-1 items-center justify-between">
        <h1
          className="text-2xl font-bold truncate min-w-0"
          title={repoDetails.name}
        >
          {repoDetails.name}
        </h1>
        <div className="flex items-center text-xs text-yellow-500 pl-2">
          <a
            href={`https://github.com/${params.username}/${params.repoName}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded hover:bg-gray-200 mr-2"
          >
            <GitHubIcon className="w-4 h-4 text-gray-500" />
          </a>
          {formatBigNumber(repoDetails.stargazersCount ?? 0)}{" "}
          <StarIcon className="ml-2 w-4 h-4" />
        </div>
      </header>

      <p className="mb-4 text-xs text-gray-500">
        Last updated{" "}
        {commits?.[0]?.commitedAt
          ? formatDate(commits?.[0]?.commitedAt)
          : "N/A"}
      </p>
      <p className="mb-4">{repoDetails.description}</p>
      <RepoTags repo={repoDetails} className="mb-4" />
      <LanguageLineGraph
        languages={repoDetails.languages}
        className="mb-4 max-w-sm"
      />
      <Heading>Branches</Heading>
      <p className="text-sm pb-2">
        Select a branch to view its stats and latest commits.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[repoDetails.defaultBranch, ...branchNamesShown].map((branchName) => (
          <Button
            className={cn(
              selectedBranchName === branchName &&
                "bg-sky-500 text-gray-50 border-sky-500",
            )}
            onClick={() => setBranchName(branchName)}
            key={branchName}
          >
            {branchName}
          </Button>
        ))}
        {branchLimit < repoDetails.branches.length && (
          <Button
            square
            onClick={() =>
              setBranchLimit((prevLimit) =>
                Math.min(prevLimit + DEFAULT_BRANCH_LIMIT, branchListLength),
              )
            }
          >
            <DotsIcon />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          <Heading>Latest Commits</Heading>
          {latestDetailedCommits && (
            <ul>
              {latestDetailedCommits.slice(0, 5).map((commit) => (
                <li
                  key={commit.sha}
                  className="mb-2 border-b pb-2 border-gray-200 min-w-0"
                >
                  <p
                    className="text-sm truncate font-semibold"
                    title={commit.message}
                  >
                    {commit.message}
                  </p>
                  <p className="text-xs">
                    changes:{" "}
                    <span className="text-emerald-500">
                      +{formatBigNumber(commit.additions)}
                    </span>{" "}
                    <span className="text-rose-500">-{commit.deletions}</span>{" "}
                    (Total: {formatBigNumber(commit.total)})
                  </p>
                  <p className="text-xs text-gray-500">
                    {commit.author.name} - {formatDate(commit.commitedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <Heading>Monthly Activity</Heading>
          {!montlhyActivityData.length && (
            <Banner
              icon={<CircleMinusIcon />}
              title="No activity found"
              subtitle="This repository does not have any commits so we cannot calculate activity"
            />
          )}
          {!!montlhyActivityData.length && (
            <div className="flex justify-center">
              <LineChart
                style={{
                  width: "100%",
                  height: "100%",
                  aspectRatio: "16 / 9",
                }}
                className="mx-auto text-xs"
                responsive
                data={montlhyActivityData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis width="auto" />
                <Tooltip />
                <Line
                  dataKey="commitCount"
                  type="monotone"
                  fill={colors.sky[500]}
                  activeDot={false}
                  dot={false}
                />
              </LineChart>
            </div>
          )}
        </section>
        <section>
          <Heading>Top Contributors</Heading>
          {!mostActiveContributors.length && (
            <Banner
              icon={<CircleMinusIcon />}
              title="No contributors found"
              subtitle="This repository does not have any commits so we cannot calculate contributors"
            />
          )}
          {!!mostActiveContributors.length && (
            <ul>
              {mostActiveContributors.slice(0, 5).map((contributor) => (
                <li
                  key={contributor.login}
                  className="mb-2 border-b pb-2 border-gray-200"
                >
                  <p className="text-sm font-semibold">{contributor.login}</p>
                  <p className="text-xs text-gray-500">
                    {formatBigNumber(contributor.commitCount)} commits
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
