import { useQuery } from "@tanstack/react-query";
import { accountDetailsRoute } from "../router";
import { api } from "../api";
import type { User } from "../types/user";
import { Avatar } from "../components/ui/avatar";
import { Banner } from "../components/ui/banner";
import { LoadingIcon } from "../components/ui/icons/loading";
import type { DetailedRepo } from "../types/repo";
import {
  formatBigNumber,
  repoFromResponse,
  userFromResponse,
} from "../lib/utils";
import { GitForkIcon } from "../components/ui/icons/git-fork";
import { StarIcon } from "../components/ui/icons/star";
import { GitHubIcon } from "../components/ui/icons/github";
import { LanguageStats } from "../components/language-stats";
import { Heading } from "../components/ui/heading";
import { IconCard } from "../components/ui/icon-card";
import { RepoList } from "../components/repo-list";
import { CircleMinusIcon } from "../components/ui/icons/circle-minus";

type UserDetails = User & {
  followers: number;
  following: number;
};

type TotalsCardProps = {
  label: string;
  description: string;
  count: number;
  icon: React.ReactNode;
};

export function TotalsCard({
  label,
  count,
  description,
  icon,
}: TotalsCardProps) {
  return (
    <IconCard icon={icon}>
      <div>
        <h4 className="text-lg font-semibold">{formatBigNumber(count)}</h4>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </IconCard>
  );
}

export function AccountDetails() {
  const params = accountDetailsRoute.useParams();
  const { data: user, isLoading: isLoadingBaseUserInfo } =
    useQuery<UserDetails>({
      queryKey: ["accounts", params.username],
      queryFn: async () => {
        const res = await api.rest.users.getByUsername({
          username: params.username,
        });
        return {
          ...userFromResponse(res.data),
          followers: res.data.followers,
          following: res.data.following,
        };
      },
    });

  const { data: repos, isLoading: isLoadingRepos } = useQuery<DetailedRepo[]>({
    queryKey: ["accounts", params.username, "repos"],
    queryFn: async () => {
      if (!user) throw new Error("User is required to fetch repositories");

      const res = await api.request("GET /users/{username}/repos", {
        username: user.login,
        sort: "updated",
      });
      const languagesRequests = res.data.map(async (r) => {
        const languageResponse = await api.request(
          "GET /repos/{owner}/{repo}/languages",
          {
            owner: user.login,
            repo: r.name,
          },
        );

        return { ...repoFromResponse(r), languages: languageResponse.data };
      });

      return await Promise.all(languagesRequests);
    },
    enabled: !!user,
  });

  if (isLoadingBaseUserInfo || isLoadingRepos) {
    return (
      <div className="min-h-screen mx-auto flex items-center justify-center">
        <Banner title="Loading user details" icon={<LoadingIcon />} />
      </div>
    );
  }

  const totals = {
    repos: repos?.length ?? 0,
    starts: repos?.reduce((acc, repo) => acc + repo.stargazersCount, 0) ?? 0,
    forks: repos?.reduce((acc, repo) => acc + repo.forksCount, 0) ?? 0,
  };

  return (
    <>
      <header className="flex items-center mb-6 min-w-0">
        <Avatar src={user?.avatarUrl ?? ""} alt={user?.login} size="lg" />
        <div className="flex flex-col pl-4 min-w-0">
          <h1 className="text-xl font-semibold truncate min-w-0">
            {params.username}
          </h1>
          <div className="text-xs text-gray-600">
            {user?.followers} followers · {user?.following} following
          </div>
        </div>
      </header>
      {!!repos?.length && (
        <>
          <Heading>Totals</Heading>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6">
            <TotalsCard
              label="Repositories"
              description="Number of all public user's repositories"
              count={totals.repos}
              icon={<GitHubIcon />}
            />
            <TotalsCard
              label="Stars"
              description="Number of stars across all user's repositories"
              count={totals.starts}
              icon={<StarIcon />}
            />
            <TotalsCard
              label="Forks"
              description="Number of forks across all user's repositories"
              count={totals.forks}
              icon={<GitForkIcon />}
            />
          </section>
          <section className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3">
              <RepoList repos={repos} username={params.username} />
            </div>
            <div className="sm:col-span-2 order-first">
              <LanguageStats repos={repos} />
            </div>
          </section>
        </>
      )}
      {!repos?.length && (
        <Banner
          icon={<CircleMinusIcon className="w-6 h-6 text-gray-700" />}
          title="No repositories"
          subtitle="This user does not have any repositories"
        />
      )}
    </>
  );
}
