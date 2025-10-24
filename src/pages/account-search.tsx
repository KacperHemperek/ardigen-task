import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Timeout } from "../types/utils";
import type { UserWithRepos } from "../types/user";
import { UserItem } from "../components/user-item";
import { Button } from "../components/ui/button";
import { indexRoute } from "../router";

const LIMIT = 10;

type UserSearchResponse = {
  totalCount: number;
  items: UserWithRepos[];
  page: number;
};

export function AccountSearch() {
  const searchParams = indexRoute.useSearch();
  const navigate = indexRoute.useNavigate();

  const [search, setSearch] = React.useState(searchParams.q);
  const deboundceTimeout = React.useRef<Timeout | null>(null);

  const { data, hasNextPage, fetchNextPage, isLoading } =
    useInfiniteQuery<UserSearchResponse>({
      queryKey: ["accounts", "search", search],
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.totalCount > LIMIT * lastPage.page
          ? lastPage.page + 1
          : undefined;
      },
      queryFn: async ({ pageParam }) => {
        if (typeof pageParam !== "number")
          throw new Error("Invalid page parameter");

        const res = await api.rest.search.users({
          q: search,
          per_page: LIMIT,
          page: pageParam,
        });

        const respositoryRequests = res.data.items.map((user) => {
          return api.request("GET /users/{username}/repos", {
            username: user.login,
          });
        });

        const reposResults = await Promise.all(respositoryRequests);

        const items: UserWithRepos[] = res.data.items.map((user, index) => {
          return {
            id: user.id,
            login: user.login,
            avatarUrl: user.avatar_url,
            description: user.bio ?? undefined,
            websiteUrl: user.blog ?? undefined,
            location: user.location ?? undefined,
            repos: reposResults[index].data.map((repo) => ({
              id: repo.id,
              name: repo.name,
              stargazersCount: repo.stargazers_count ?? 0,
              forksCount: repo.forks_count ?? 0,
              forked: repo.fork,
              archived: repo.archived ?? false,
              description: repo.description ?? undefined,
            })),
          };
        });

        return { items, page: pageParam, totalCount: res.data.total_count };
      },
      enabled: search.length >= 3,
    });

  const debouncedSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (deboundceTimeout.current) {
      clearTimeout(deboundceTimeout.current);
    }

    deboundceTimeout.current = setTimeout(() => {
      const newSearch = e.target.value;
      setSearch(newSearch);
      navigate({ search: { q: newSearch } });
    }, 300);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">GitHub User Search</h1>
      <input
        className="border rounded-md border-gray-300 px-2 py-1 mb-4 placeholder-gray-400"
        onChange={debouncedSearch}
        defaultValue={searchParams.q}
        placeholder="Search GitHub users..."
      />
      {data?.pages
        .flatMap((page) => page.items)
        .map((user) => <UserItem key={user.id} user={user} />)}
      {hasNextPage && (
        <Button
          disabled={isLoading}
          className="max-w-fit mx-auto mt-4"
          type="button"
          onClick={() => fetchNextPage()}
        >
          Load More
        </Button>
      )}
    </>
  );
}
