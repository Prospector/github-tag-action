"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const semver_1 = require("semver");
const utils_1 = require("./utils");
const github_1 = require("./github");
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const versionType = core.getInput('version_type');
        const { GITHUB_REF, GITHUB_SHA } = process.env;
        if (!GITHUB_REF) {
            core.setFailed('Missing GITHUB_REF.');
            return;
        }
        if (!GITHUB_SHA) {
            core.setFailed('Missing GITHUB_SHA.');
            return;
        }
        const validTags = yield utils_1.getValidTags();
        const latestTag = utils_1.getLatestTag(validTags);
        let newVersion;
        let previousTag;
        previousTag = semver_1.parse(latestTag.name);
        if (!previousTag) {
            core.setFailed('Could not parse previous tag.');
            return;
        }
        core.info(`Previous tag was ${previousTag}.`);
        core.setOutput('previous_tag', previousTag.version);
        const releaseType = versionType;
        const incrementedVersion = semver_1.inc(previousTag, releaseType);
        if (!incrementedVersion) {
            core.setFailed('Could not increment version.');
            return;
        }
        if (!semver_1.valid(incrementedVersion)) {
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
        yield github_1.createTag(newTag, false, GITHUB_SHA);
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
