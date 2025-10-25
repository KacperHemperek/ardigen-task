import type { User } from "./user";

export type Repo = {
  id: number;
  name: string;
  stargazersCount: number;
  forksCount: number;
  forked: boolean;
  archived: boolean;
  defaultBranch: string;
  openIssuesCount: number;
  description?: string;
};

export type UserWithRepos = User & {
  repos: Repo[];
};

export type Language = {
  name: string;
  bytes: number;
};

export type LanguageWithPercent = Language & {
  percent: number;
};

export type DetailedRepo = Repo & {
  languages: Record<string, number>;
};

export type Commit = {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  commitedAt: Date;
};

export type DetailedRepoWithBranches = DetailedRepo & {
  branches: string[];
};

export type MonthlyActivity = {
  month: string;
  commitCount: number;
};
