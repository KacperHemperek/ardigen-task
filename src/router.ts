import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AccountSearch } from "./pages/account-search";
import { AccountDetails } from "./pages/account-details";
import { RepoDetails } from "./pages/repo-details";
import { BaseLayout } from "./pages/layouts/base";

const rootRoute = createRootRoute();

const baseLayout = createRoute({
  id: "base-layout",
  getParentRoute: () => rootRoute,
  component: BaseLayout,
});

export const indexRoute = createRoute({
  getParentRoute: () => baseLayout,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    q: search.q ? String(search.q) : "",
  }),
  component: AccountSearch,
});

export const accountDetailsRoute = createRoute({
  getParentRoute: () => baseLayout,
  path: "accounts/$username",
  component: AccountDetails,
});

export const repositoryDetailsRoute = createRoute({
  getParentRoute: () => baseLayout,
  path: "accounts/$username/repos/$repoName",
  component: RepoDetails,
});

const routeTree = rootRoute.addChildren([
  baseLayout.addChildren([
    indexRoute,
    accountDetailsRoute,
    repositoryDetailsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
