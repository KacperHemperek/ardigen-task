import type { UserWithRepos } from "../types/user";
import type { Repo } from "../types/repo";
import { Pill } from "./ui/pill";
import { StarIcon } from "./ui/icons/star";
import { Link } from "@tanstack/react-router";
import { GitForkIcon } from "./ui/icons/git-fork";
import { ArchiveIcon } from "./ui/icons/archive";
import { Avatar } from "./ui/avatar";

export type UserItemProps = {
  user: UserWithRepos;
};

function RepoItem({ repo }: { repo: Repo }) {
  return (
    <div className="flex flex-col mr-2 mb-1 ">
      <h5 className="text-sm truncate">{repo.name}</h5>
      <p className="text-xs text-gray-500 pb-1">{repo.description}</p>
      <div className="flex flex-wrap gap-1">
        <Pill className="border-yellow-300 bg-yellow-100 text-yellow-700">
          <StarIcon className="w-3 h-3 mr-0.5" /> {repo.stargazersCount} Stars
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
      </div>
    </div>
  );
}

export function UserItem({ user }: UserItemProps) {
  const REPOS_SHOWN = 2;

  const mostStarredRepos = [...user.repos].sort(
    (a, b) => b.stargazersCount - a.stargazersCount,
  );

  return (
    <Link
      to="/accounts/$username"
      params={{ username: user.login }}
      className="no-underline"
    >
      <div className="flex space-x-4 p-2 border-b border-gray-200 rounded-md">
        <Avatar src={user.avatarUrl} alt={`${user.login}'s avatar`} size="sm" />
        <div className="flex-1">
          <div className="font-semibold pb-1">{user.login}</div>
          <div className="grid grid-cols-1 mt-1 ">
            {mostStarredRepos.slice(0, REPOS_SHOWN).map((repo) => (
              <RepoItem key={repo.id} repo={repo} />
            ))}
            {user.repos.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                and {user.repos.length - REPOS_SHOWN} more repositories...
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
