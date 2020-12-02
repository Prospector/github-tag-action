import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { rcompare, valid } from 'semver';
import { listTags } from './github';

export async function getValidTags() {
  const tags = await listTags();

  const invalidTags = tags
    .map((tag) => tag.name)
    .filter((name) => !valid(name));

  invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));

  const validTags = tags
    .filter((tag) => valid(tag.name))
    .sort((a, b) => rcompare(a.name, b.name));

  validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));

  return validTags;
}

export function getBranchFromRef(ref: string) {
  return ref.replace('refs/heads/', '');
}

export function getLatestTag(tags: Octokit.ReposListTagsResponseItem[]) {
  return tags[0];
}