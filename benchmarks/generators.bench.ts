import { bench, describe } from "vitest";
import { keyValueList, valueList } from "@fig/autocomplete-generators";
import { dependenciesGenerator, npmScriptsGenerator } from "../src/npm";
import dockerSpec from "../src/docker";
import kubectlSpec from "../src/kubectl";
import {
  dockerImagesOutput,
  dockerPsOutput,
  mockExecute,
  packageJson,
  range,
} from "./fixtures";

const findGenerator = (
  spec: Fig.Subcommand,
  path: string[],
  argIndex = 0
): Fig.Generator => {
  let node: Fig.Subcommand = spec;
  for (const name of path) {
    const next = node.subcommands?.find((sub) =>
      Array.isArray(sub.name) ? sub.name.includes(name) : sub.name === name
    );
    if (!next) throw new Error(`Subcommand ${name} not found`);
    node = next;
  }
  const args = Array.isArray(node.args) ? node.args : [node.args];
  const generators = args[argIndex]?.generators;
  const generator = Array.isArray(generators) ? generators[0] : generators;
  if (!generator) throw new Error(`No generator for ${path.join(" ")}`);
  return generator;
};

const generatorContext = { searchTerm: "" } as Fig.GeneratorContext;

describe("npm generators", () => {
  const pkg = packageJson(500);
  const execute = mockExecute(pkg);
  const tokens = ["npm", "uninstall", "dep-1", "dev-dep-2"];

  bench("npmScriptsGenerator postProcess (500 scripts)", () => {
    npmScriptsGenerator.postProcess?.(pkg, ["npm", "run"]);
  });

  bench("dependenciesGenerator custom (1000+ dependencies)", async () => {
    await dependenciesGenerator.custom?.(tokens, execute, generatorContext);
  });
});

describe("docker generators postProcess", () => {
  const ps = dockerPsOutput(500);
  const images = dockerImagesOutput(500);
  const containers = findGenerator(dockerSpec as Fig.Subcommand, ["stop"]);
  const imageGenerator = findGenerator(dockerSpec as Fig.Subcommand, ["rmi"]);

  bench("containers (500 containers)", () => {
    containers.postProcess?.(ps, []);
  });

  bench("images (500 images)", () => {
    imageGenerator.postProcess?.(images, []);
  });
});

describe("kubectl generators postProcess", () => {
  const resources = findGenerator(kubectlSpec as Fig.Subcommand, ["get"]);
  const out = range(2000)
    .map((i) => `resource-${i}.apps.example.io`)
    .join("\n");

  bench("resource types (2000 resources)", () => {
    resources.postProcess?.(out, []);
  });
});

describe("@fig/autocomplete-generators", () => {
  const keys = range(200).map((i) => `key-${i}`);
  const values = range(200).map((i) => `value-${i}`);
  const kvList = keyValueList({ keys, values });
  const vList = valueList({ values });
  const execute = mockExecute("");
  const used = range(50)
    .map((i) => `key-${i}=value-${i}`)
    .join(",");

  bench("keyValueList keys (200 keys, 50 used)", async () => {
    await kvList.custom?.(["cmd", `${used},key-`], execute, generatorContext);
  });

  bench("valueList (200 values, 50 used)", async () => {
    await vList.custom?.(
      [
        "cmd",
        range(50)
          .map((i) => `value-${i}`)
          .join(",") + ",",
      ],
      execute,
      generatorContext
    );
  });
});
