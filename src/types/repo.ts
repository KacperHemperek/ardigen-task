export type Repo = {
  id: number;
  name: string;
  stargazersCount: number;
  forksCount: number;
  forked: boolean;
  archived: boolean;
  description?: string;
};

export type Language = {
  name: string;
  bytes: number;
};

export type DetailedRepo = Repo & {
  languages: Language[];
};
