// Deterministic synthetic command outputs used by the benchmarks.

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const hex = (i: number, len = 7) =>
  ((i * 2654435761) >>> 0).toString(16).padStart(8, "0").slice(0, len);

/** Output of `git branch -a --no-color` */
export const gitBranchOutput = (count: number): string =>
  [
    "* main",
    "+ feature/worktree-checkout",
    "  remotes/origin/HEAD -> origin/main",
    ...range(count).map((i) =>
      i % 3 === 0
        ? `  remotes/origin/feature/branch-${i % (count / 2)}`
        : `  feature/branch-${i}`
    ),
  ].join("\n");

/** Output of `git log --oneline` */
export const gitLogOutput = (count: number): string =>
  range(count)
    .map((i) => `${hex(i)} feat(scope-${i % 17}): implement change number ${i}`)
    .join("\n");

/** Output of `git status --short` */
export const gitStatusOutput = (count: number): string =>
  range(count)
    .map((i) => {
      const status = ["M ", " M", "A ", "??", "MM"][i % 5];
      const dir = `src/module-${Math.floor(i / 8)}/sub-${i % 3}`;
      const ext = ["ts", "js", "json", "md"][i % 4];
      return `${status} ${dir}/file-${i}.${ext}`;
    })
    .join("\n");

/** Output of `git remote -v` */
export const gitRemoteOutput = (count: number): string =>
  range(count)
    .flatMap((i) => {
      const host = ["github.com", "gitlab.com", "heroku.com", "example.org"][
        i % 4
      ];
      const url = `git@${host}:org/repo-${i}.git`;
      return [`remote-${i}\t${url} (fetch)`, `remote-${i}\t${url} (push)`];
    })
    .join("\n");

/** Output of `docker ps --format '{{ json . }}'` */
export const dockerPsOutput = (count: number): string =>
  range(count)
    .map((i) =>
      JSON.stringify({
        Command: '"docker-entrypoint.s…"',
        CreatedAt: "2024-01-01 00:00:00 +0000 UTC",
        ID: hex(i, 12),
        Image: `registry.example.com/service-${i % 10}:latest`,
        Labels: `com.example.service=service-${i}`,
        Names: `container-${i}`,
        Ports: "0.0.0.0:8080->80/tcp",
        State: "running",
        Status: "Up 2 hours",
      })
    )
    .join("\n");

/** Output of `docker image ls --format '{{ json . }}'` */
export const dockerImagesOutput = (count: number): string =>
  range(count)
    .map((i) =>
      JSON.stringify({
        Containers: "N/A",
        CreatedAt: "2024-01-01 00:00:00 +0000 UTC",
        ID: hex(i, 12),
        Repository: `registry.example.com/image-${i}`,
        Size: "120MB",
        Tag: "latest",
      })
    )
    .join("\n");

/** A package.json with many scripts and dependencies */
export const packageJson = (count: number): string =>
  JSON.stringify({
    name: "bench-package",
    scripts: Object.fromEntries(
      range(count).map((i) => [`script:${i}`, `node scripts/task-${i}.js`])
    ),
    fig: Object.fromEntries(
      range(count / 4).map((i) => [
        `script:${i * 4}`,
        { description: `Custom description ${i}`, priority: 80 },
      ])
    ),
    dependencies: Object.fromEntries(
      range(count).map((i) => [`dep-${i}`, `^${i}.0.0`])
    ),
    devDependencies: Object.fromEntries(
      range(count).map((i) => [`dev-dep-${i}`, `^${i}.0.0`])
    ),
    optionalDependencies: Object.fromEntries(
      range(count / 4).map((i) => [`opt-dep-${i}`, `^${i}.0.0`])
    ),
  });

/** A fake `executeShellCommand` that always returns the given stdout */
export const mockExecute =
  (stdout: string): Fig.ExecuteCommandFunction =>
  async () => ({ stdout, stderr: "", status: 0 });
