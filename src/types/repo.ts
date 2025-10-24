export type Repo = {
  id: number;
  name: string;
  stargazersCount: number;
  forksCount: number;
  forked: boolean;
  archived: boolean;
  description?: string;
};
