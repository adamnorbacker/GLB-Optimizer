import { Options } from "yargs";

export const flagOptions: Record<string, Options> = {
  input: {
    alias: "i",
    describe: "Path to the glb file.",
    type: "string",
    normalize: true,
    demandOption: true,
  },
  output: {
    alias: "o",
    describe: "Output path of the glb file.",
    type: "string",
    normalize: true,
    default: "./",
  },
};
