import { Octokit } from "octokit";

if (
  !import.meta.env.VITE_GITHUB_TOKEN ||
  import.meta.env.VITE_GITHUB_TOKEN === ""
) {
  throw new Error("VITE_GITHUB_TOKEN is not set");
}

export const api = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});
