import { bench, describe } from "vitest";
import gitSpec from "../src/git";
import dockerSpec from "../src/docker";
import kubectlSpec from "../src/kubectl";
import npmSpec from "../src/npm";

type Node = Fig.Subcommand;

const names = (name: string | string[]) =>
  Array.isArray(name) ? name : [name];

/** Walk every subcommand, option and arg of a spec, counting nodes */
const walk = (node: Node): number => {
  let count = 1;
  for (const option of node.options ?? []) {
    count += names(option.name).length;
  }
  if (node.args) {
    count += Array.isArray(node.args) ? node.args.length : 1;
  }
  for (const sub of node.subcommands ?? []) {
    count += walk(sub);
  }
  return count;
};

/** Resolve a list of tokens against a spec, like the autocomplete parser */
const resolve = (spec: Node, tokens: string[]) => {
  let node = spec;
  const options: Fig.Option[] = [];
  for (const token of tokens) {
    if (token.startsWith("-")) {
      const option = node.options?.find((o) => names(o.name).includes(token));
      if (option) options.push(option);
      continue;
    }
    const sub = node.subcommands?.find((s) => names(s.name).includes(token));
    if (!sub) break;
    node = sub;
  }
  return { node, options };
};

const specs: Record<string, Node> = {
  git: gitSpec as Node,
  docker: dockerSpec as Node,
  kubectl: kubectlSpec as Node,
  npm: npmSpec as Node,
};

describe("spec traversal", () => {
  for (const [name, spec] of Object.entries(specs)) {
    bench(`walk ${name} spec`, () => {
      walk(spec);
    });
  }
});

describe("spec token resolution", () => {
  bench("git commit --amend --no-edit", () => {
    resolve(specs.git, ["commit", "--amend", "--no-edit"]);
  });

  bench("docker container run --rm -it", () => {
    resolve(specs.docker, ["container", "run", "--rm", "-it"]);
  });

  bench("kubectl get pods -o", () => {
    resolve(specs.kubectl, ["get", "pods", "-o"]);
  });
});
