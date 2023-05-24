import path from "path";

export function outputFilePath(argv: Record<string, unknown>, file: string) {
  let fileName = file.split(".glb")[0] as string;

  let directory = path.dirname(argv.output as string);

  directory = directory === "." ? `${argv.input}` : `${argv.output}`;

  fileName = directory === `${argv.input}` ? `${fileName}_optimized.glb` : file;

  return { dir: directory, fileName: fileName };
}
