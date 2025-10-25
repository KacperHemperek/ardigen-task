import { isLowIssueCount } from "../lib/stats";
import type { DetailedRepo } from "../types/repo";
import { ArchiveIcon } from "./ui/icons/archive";
import { BugFreeIcon } from "./ui/icons/bug-free";
import { GitBranchIcon } from "./ui/icons/git-branch-icon";
import { GitForkIcon } from "./ui/icons/git-fork";
import { Pill } from "./ui/pill";

export function RepoTags({ repo }: { repo: DetailedRepo }) {
  return (
    <div className="flex gap-2 mb-2">
      <Pill className="border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700">
        <GitBranchIcon className="w-3 h-3 mr-0.5" />
        {repo.defaultBranch}
      </Pill>
      {repo.archived && (
        <Pill className="border-rose-300 bg-rose-100 text-rose-700">
          <ArchiveIcon className="w-3 h-3 mr-0.5" />
          Archived
        </Pill>
      )}
      {repo.forked && (
        <Pill className="border-blue-300 bg-blue-100 text-blue-700">
          <GitForkIcon className="w-3 h-3 mr-0.5" />
          Forked
        </Pill>
      )}
      {isLowIssueCount(repo.openIssuesCount, repo.stargazersCount) && (
        <Pill className="border-emerald-300 bg-emerald-100 text-emerald-700">
          <BugFreeIcon className="w-3 h-3 mr-0.5" />
          Low Issue Count
        </Pill>
      )}
    </div>
  );
}
