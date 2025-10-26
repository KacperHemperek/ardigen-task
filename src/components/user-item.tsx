import type { UserWithRepos } from "../types/repo";
import type { Repo } from "../types/repo";
import { Link } from "@tanstack/react-router";
import { Avatar } from "./ui/avatar";
import { RepoTags } from "./repo-tags";
import { StarIcon } from "./ui/icons/star";
import { cn } from "../lib/utils";

export type UserItemProps = {
  user: UserWithRepos;
  reposLeft?: number;
};

function RepoItem({ repo }: { repo: Repo }) {
  return (
    <div className="flex flex-col mr-2 mb-1 border-b border-gray-200 pb-1 nth-last-[2]:border-0 nth-last-[2]:pb-0">
      <div className="flex items-center justify-between min-w-0">
        <h5 className="text-sm truncate">{repo.name}</h5>
        <div className="flex items-center text-xs text-yellow-500 pl-1">
          {repo.stargazersCount} <StarIcon className="ml-2 w-4 h-4" />
        </div>
      </div>
      <p
        className={cn(
          "text-xs pb-1",
          !!repo.description ? "text-gray-600" : "text-gray-400 italic",
        )}
      >
        {repo.description ?? "No description"}
      </p>
      <p
        className={cn(
          "text-xs text-gray-600 pb-2",
          !repo.mainLanguage && "italic text-gray-400",
        )}
      >
        {repo.mainLanguage ?? "No language"}{" "}
      </p>
      <RepoTags repo={repo} />
    </div>
  );
}

export function UserItem({ user, reposLeft }: UserItemProps) {
  return (
    <Link
      to="/accounts/$username"
      params={{ username: user.login }}
      className="no-underline"
    >
      <div className="flex space-x-4 p-2 border-b border-gray-200">
        <Avatar src={user.avatarUrl} alt={`${user.login}'s avatar`} size="sm" />
        <div className="flex-1">
          <div className="font-semibold pb-1">{user.login}</div>
          <div className="grid grid-cols-1 mt-1 ">
            {user.repos.map((repo) => (
              <RepoItem key={repo.id} repo={repo} />
            ))}
            {reposLeft !== undefined && reposLeft > 0 && (
              <div className="text-xs text-gray-500">
                and {reposLeft} more repositories...
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
