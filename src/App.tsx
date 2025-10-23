import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { api } from "./api";

const LIMIT = 10;

type SearchResponse = Awaited<
  ReturnType<typeof api.rest.search.users>
>["data"] & {
  page: number;
};

type Timeout = ReturnType<typeof setTimeout>;

export function App() {
  const [search, setSearch] = React.useState("");
  const deboundceTimeout = React.useRef<Timeout | null>(null);
  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery<SearchResponse>(
    {
      queryKey: ["search", search],
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.total_count > LIMIT * lastPage.page
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
        return { ...res.data, page: pageParam };
      },
      enabled: search.length >= 3,
    },
  );

  const debouncedSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (deboundceTimeout.current) {
      clearTimeout(deboundceTimeout.current);
    }

    deboundceTimeout.current = setTimeout(() => {
      setSearch(e.target.value);
    }, 300);
  };

  return (
    <div className="p-4 flex flex-col">
      <input
        className="border rounded-sm border-gray-300 px-2 py-1"
        onChange={debouncedSearch}
      />
      {data?.pages
        .flatMap((page) => page.items)
        .map((user) => (
          <div key={user.id}>
            <img
              src={user.avatar_url}
              alt={user.login}
              width={50}
              height={50}
            />
            <span>{user.login}</span>
          </div>
        ))}
      {hasNextPage && (
        <button type="button" onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}
