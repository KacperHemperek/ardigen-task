import type { User } from "./user";

export type Commit = {
  sha: string;
  message: string;
  author: User;
};
