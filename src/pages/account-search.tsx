import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Timeout } from "../types/utils";
import type { UserWithRepos } from "../types/repo";
import { UserItem } from "../components/user-item";
import { Button } from "../components/ui/button";
import { indexRoute } from "../router";
import { CircleMinusIcon } from "../components/ui/icons/circle-minus";
import { Banner } from "../components/ui/banner";
import { LoadingIcon } from "../components/ui/icons/loading";
import { WarnIcon } from "../components/ui/icons/warn";
import {
  getTotalNumberOfPages,
  repoFromResponse,
  userFromResponse,
} from "../lib/utils";

const SEARCH_LIMIT = 10;
const REPO_PREVIEW_LIMIT = 2;

type UserWithReposCount = UserWithRepos & { totalRepoCount: number };

type UserSearchResponse = {
  totalCount: number;
  items: UserWithReposCount[];
  page: number;
};

export function AccountSearch() {
  const searchParams = indexRoute.useSearch();
  const navigate = indexRoute.useNavigate();

  const [search, setSearch] = React.useState(searchParams.q);
  const deboundceTimeout = React.useRef<Timeout | null>(null);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
    ...rest
  } = useInfiniteQuery<UserSearchResponse>({
    queryKey: ["accounts", "search", search],
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.totalCount > SEARCH_LIMIT * lastPage.page
        ? lastPage.page + 1
        : undefined;
    },
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam !== "number")
        throw new Error("Invalid page parameter");

      const res = await api.rest.search.users({
        q: search,
        per_page: SEARCH_LIMIT,
        page: pageParam,
      });

      const respositoryRequests = res.data.items.map((user) => {
        return api.request("GET /users/{username}/repos", {
          username: user.login,
          per_page: REPO_PREVIEW_LIMIT,
          page: 1,
          sort: "updated",
        });
      });

      const reposResults = await Promise.all(respositoryRequests);

      const items: UserWithReposCount[] = res.data.items.map((user, index) => {
        const repos = reposResults[index];
        let reposLeft = 0;
        if (repos.data.length > 0) {
          const totalPages = getTotalNumberOfPages(repos);
          reposLeft = totalPages * REPO_PREVIEW_LIMIT;
        }
        return {
          ...userFromResponse(user),
          repos: reposResults[index].data.map(repoFromResponse),
          totalRepoCount: reposLeft,
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

  const isEmpty = !isLoading && data?.pages[0].items.length === 0;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">GitHub User Search</h1>
      <input
        className="border rounded-md border-gray-300 px-2 py-1 mb-4 placeholder-gray-400"
        onChange={debouncedSearch}
        defaultValue={searchParams.q}
        placeholder="Search GitHub users..."
      />
      {isLoading && (
        <Banner
          title="Searching for users"
          icon={<LoadingIcon className="w-6 h-6 text-gray-700" />}
        />
      )}
      {isEmpty && (
        <Banner
          icon={<CircleMinusIcon className="w-6 h-6 text-gray-700" />}
          title="No users found"
          subtitle="No users match your search maybe try different username?"
        />
      )}
      {isError && (
        <Banner
          title="Something went wrong"
          icon={<WarnIcon className="w-6 h-6 text-gray-700" />}
        />
      )}
      {data?.pages
        .flatMap((page) => page.items)
        .map((user) => (
          <UserItem
            key={user.id}
            reposLeft={user.totalRepoCount - REPO_PREVIEW_LIMIT}
            user={user}
          />
        ))}
      {hasNextPage && (
        <Button
          disabled={isFetchingNextPage}
          className="max-w-fit mx-auto mt-4 flex items-center"
          type="button"
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? <LoadingIcon className="w-4 h-4 mr-2" /> : null}
          Load More
        </Button>
      )}
    </>
  );
}
