import type { Repo } from "./repo";

export type UserWithRepos = {
  id: number;
  login: string;
  avatarUrl: string;
  repos: Repo[];
};
