import type { DetailedRepo } from "../types/repo";
import { Heading } from "./ui/heading";
import { StarIcon } from "./ui/icons/star";
import { Link } from "@tanstack/react-router";
import { LanguageLineGraph } from "./language-line-graph";
import { RepoTags } from "./repo-tags";

export function RepoList({
  repos,
  username,
}: {
  repos: DetailedRepo[];
  username: string;
}) {
  return (
    <>
      <Heading>Repositories</Heading>
      {repos.map((r) => (
        <Link
          to="/accounts/$username/repos/$repoName"
          params={{ repoName: r.name, username: username }}
          key={r.id}
        >
          <div className="mb-4 py-2 border-b border-gray-200">
            <div className="flex justify-between">
              <h6 className="font-medium">{r.name}</h6>
              <div className="flex items-center text-xs text-yellow-500">
                {r.stargazersCount} <StarIcon className="ml-2 w-4 h-4" />
              </div>
            </div>
            <div className="pb-2">
              {r.description && (
                <p className="text-gray-600 text-xs">{r.description}</p>
              )}
              {!r.description && (
                <p className="text-gray-400 text-xs italic">No description</p>
              )}
            </div>

            <RepoTags repo={r} />
            <LanguageLineGraph languages={r.languages} />
          </div>
        </Link>
      ))}
    </>
  );
}
