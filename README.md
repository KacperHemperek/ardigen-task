# Ardigen Task

This repo contains the code for the recruitment task for Adrigen.

## Requirements

- Node.js v22.x or higher
- npm v9.x or higher
- Github's fine-grained personal access token with no additional permissions [how to create one](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)

## Setup
1. Clone the repo:

```bash
git clone repo_url
```
2. Navigate to the project directory:

```bash
cd ardigen-task
```

3. Install dependencies:

```bash
npm install
```

4. Copy the `.env.example` file to `.env` and set your GitHub token:

```bash
cp .env.example .env
```

5. Open the `.env` file and fill the `VITE_GITHUB_TOKEN` variable with your GitHub personal access token:

## Usage

To run the application, use the dev command to open it in development mode:

```bash
npm run dev
```

Or you can also preview the production build with:

```bash
npm run preview
```
