import * as core from '@actions/core';
import { gte, inc, parse, ReleaseType, SemVer, valid } from 'semver';
import {
  getLatestTag,
  getValidTags,
} from './utils';
import { createTag } from './github';

export default async () => {
  try {
    const versionType = core.getInput('version_type') as ReleaseType;

    const { GITHUB_REF, GITHUB_SHA } = process.env;

    if (!GITHUB_REF) {
      core.setFailed('Missing GITHUB_REF.');
      return;
    }

    if (!GITHUB_SHA) {
      core.setFailed('Missing GITHUB_SHA.');
      return;
    }

    const validTags = await getValidTags();
    const latestTag = getLatestTag(validTags);

    let newVersion: string;

    let previousTag: SemVer | null;
    previousTag = parse(latestTag.name);

    if (!previousTag) {
      core.setFailed('Could not parse previous tag.');
      return;
    }

    core.info(`Previous tag was ${previousTag}.`);
    core.setOutput('previous_tag', previousTag.version);

    const releaseType: ReleaseType = versionType;

    const incrementedVersion = inc(previousTag, releaseType);

    if (!incrementedVersion) {
      core.setFailed('Could not increment version.');
      return;
    }

    if (!valid(incrementedVersion)) {
      core.setFailed(`${incrementedVersion} is not a valid semver.`);
      return;
    }

    newVersion = incrementedVersion;
    
    core.info(`New version is ${newVersion}.`);
    core.setOutput('new_version', newVersion);

    const newTag = `v${newVersion}`;
    core.info(`New tag after applying prefix is ${newTag}.`);
    core.setOutput('new_tag', newTag);

    if (validTags.map((tag) => tag.name).includes(newTag)) {
      core.info('This tag already exists. Skipping the tag creation.');
      return;
    }

    await createTag(newTag, false, GITHUB_SHA);
  } catch (error) {
    core.setFailed(error.message);
  }
};
