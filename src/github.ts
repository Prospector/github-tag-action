import { context, GitHub } from '@actions/github';
import * as core from '@actions/core';

let octokitSingleton;

export function getOctokitSingleton() {
  if (octokitSingleton) {
    return octokitSingleton;
  }
  const githubToken = core.getInput('github_token');
  octokitSingleton = new GitHub(githubToken);
  return octokitSingleton;
}

export async function listTags() {
  const octokit = getOctokitSingleton();

  const tags = await octokit.repos.listTags({
    ...context.repo,
    per_page: 100,
  });

  return tags.data;
}

export async function compareCommits(sha: string) {
  const octokit = getOctokitSingleton();

  const commits = await octokit.repos.compareCommits({
    ...context.repo,
    base: sha,
    head: 'HEAD',
  });

  return commits.data.commits;
}

export async function createTag(newTag: string, GITHUB_SHA: string) {
  const octokit = getOctokitSingleton();
  core.debug(`Pushing new tag to the repo.`);
  await octokit.git.createRef({
    ...context.repo,
    ref: `refs/tags/${newTag}`,
    sha: GITHUB_SHA,
  });
}
