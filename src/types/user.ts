import type { Repo } from "./repo";

export type User = {
  id: number;
  login: string;
  avatarUrl: string;
};

export type UserWithRepos = User & {
  repos: Repo[];
};
