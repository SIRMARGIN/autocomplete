import { bench, describe } from "vitest";
import { gitGenerators } from "../src/git";
import {
  gitBranchOutput,
  gitLogOutput,
  gitRemoteOutput,
  gitStatusOutput,
} from "./fixtures";

const SIZE = 1000;
const branches = gitBranchOutput(SIZE);
const log = gitLogOutput(SIZE);
const status = gitStatusOutput(SIZE);
const remotes = gitRemoteOutput(100);
const context = ["git", "add", "src/module-1/sub-0/file-8.ts", "src/module-2*"];

const run = (generator: Fig.Generator, out: string, tokens: string[] = []) =>
  generator.postProcess?.(out, tokens);

describe("git generators postProcess", () => {
  bench("remoteLocalBranches (1000 branches)", () => {
    run(gitGenerators.remoteLocalBranches, branches);
  });

  bench("commits (1000 commits)", () => {
    run(gitGenerators.commits, log);
  });

  bench("revs (1000 revisions)", () => {
    run(gitGenerators.revs, log);
  });

  bench("files_for_staging (1000 files)", () => {
    run(gitGenerators.files_for_staging, status, context);
  });

  bench("getChangedTrackedFiles (1000 files)", () => {
    run(gitGenerators.getChangedTrackedFiles, status, context);
  });

  bench("remotes (100 remotes)", () => {
    run(gitGenerators.remotes, remotes);
  });
});
