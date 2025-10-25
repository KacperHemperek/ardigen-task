import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Commit, Repo } from "../types/repo";
import numeral from "numeral";
import type { User } from "../types/user";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transforms an API response from the GitHub SDK into a Repo object.
 *
 * @param res - The API reponse object to transform.
 * @returns A Repo object containing the relevant repository information.
 * @throws Will throw an error if the response is not an object or is null.
 */
export function repoFromResponse(res: unknown): Repo {
  if (typeof res !== "object" || res === null) {
    throw new Error("Invalid response format");
  }

  return {
    id: (res as any).id,
    name: (res as any).name,
    stargazersCount: (res as any).stargazers_count ?? 0,
    forksCount: (res as any).forks_count ?? 0,
    forked: (res as any).fork,
    archived: (res as any).archived ?? false,
    description: (res as any).description ?? undefined,
    defaultBranch: (res as any).default_branch,
    openIssuesCount: (res as any).open_issues_count ?? 0,
  };
}

/**
 * Transforms an API response from the GitHub SDK into a User object.
 *
 * @param res - The API response object to transform.
 * @returns A User object containing the relevant user information.
 * @throws Will throw an error if the response is not an object or is null.
 */
export function userFromResponse(res: unknown) {
  if (typeof res !== "object" || res === null) {
    throw new Error("Invalid user response format");
  }

  return {
    id: (res as any).id,
    login: (res as any).login,
    avatarUrl: (res as any).avatar_url,
  };
}

/**
 * Transforms an API response from the GitHub SDK into a Commit object.
 *
 * @param res - The API response object to transform.
 * @returns A Commit object containing the relevant commit information.
 * @throws Will throw an error if the response is not an object, is null, or lacks author information.
 */
export function commitFromResponse(res: unknown): Commit {
  if (typeof res !== "object" || res === null) {
    throw new Error("Invalid commit response format");
  }

  const commitAuthor = (res as any).commit?.author;
  return {
    sha: (res as any).sha,
    message: (res as any).commit?.message ?? "",
    commitedAt: new Date(commitAuthor?.date),
    author: {
      email: commitAuthor?.email ?? "unknown",
      name: commitAuthor?.name ?? "unknown",
    },
  };
}

/**
 * Formats a big number like 11,342 to a string 11.3k
 */
export function formatBigNumber(n: number): string {
  return numeral(n).format("0.[0]a");
}
