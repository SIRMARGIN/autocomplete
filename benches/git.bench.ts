import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { Bench } from "tinybench";
import { gitGenerators } from "../src/git";

// Representative `git log --oneline` output, used to benchmark
// gitGenerators.commits.postProcess.
const commitsOutput = Array.from(
  { length: 500 },
  (_, i) =>
    `${(i + 1).toString(16).padStart(7, "0")} Commit message number ${i}`
).join("\n");

// Representative `git branch -a --no-color --sort=-committerdate` output,
// used to benchmark gitGenerators.{localBranches,remoteLocalBranches}.postProcess.
const branchesOutput = [
  "* main",
  "  feature/add-login",
  "  feature/fix-bug-123",
  "  bugfix/null-pointer",
  "+ release/v2",
  ...Array.from({ length: 200 }, (_, i) => `  remotes/origin/branch-${i}`),
].join("\n");

// Representative `git status --short` output (filtered to modified/added
// files), used to benchmark gitGenerators.getStagedFiles.postProcess and
// gitGenerators.getChangedTrackedFiles.postProcess.
const trackedFilesOutput = Array.from(
  { length: 300 },
  (_, i) => `${i % 2 === 0 ? "M" : "A"}  src/some/nested/path/file-${i}.ts`
).join("\n");

const bench = withCodSpeed(new Bench());

bench
  .add("gitGenerators.commits.postProcess", () => {
    gitGenerators.commits.postProcess?.(commitsOutput, []);
  })
  .add("gitGenerators.localBranches.postProcess", () => {
    gitGenerators.localBranches.postProcess?.(branchesOutput, []);
  })
  .add("gitGenerators.remoteLocalBranches.postProcess", () => {
    gitGenerators.remoteLocalBranches.postProcess?.(branchesOutput, []);
  })
  .add("gitGenerators.getStagedFiles.postProcess", () => {
    gitGenerators.getStagedFiles.postProcess?.(trackedFilesOutput, []);
  })
  .add("gitGenerators.getChangedTrackedFiles.postProcess", () => {
    gitGenerators.getChangedTrackedFiles.postProcess?.(trackedFilesOutput, []);
  });

await bench.run();
console.table(bench.table());
