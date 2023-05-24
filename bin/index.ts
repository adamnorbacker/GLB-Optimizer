#!/usr/bin/env node
import fs from "fs";
import yargs from "yargs";

import { optimizer } from "../src";
import { flagOptions } from "./flagOptions";
import { outputFilePath } from "./utils";

const argv = yargs(process.argv.slice(2))
  .usage("Usage: glb-optimizer -i inputPath -o outputPath")
  .example("glb-optimizer", "-i /Users/user/Documents/models/original")
  .example(
    "glb-optimizer",
    "-i /Users/user/Documents/models/original -o /Users/user/Documents/models/optimized"
  )
  .help("h")
  .alias("h", "help")
  .options(flagOptions)
  .parseSync();

console.log("argv.input", argv.input);

fs.readdir(argv.input as string, function (error, files) {
  //handling error
  if (error) {
    return console.error("Unable to scan directory: " + error);
  }
  //list all GLB files
  files.forEach(function (file) {
    if (!file.includes(".glb")) {
      return;
    }

    console.log(file);

    const glb = fs.readFileSync(`${argv.input}/${file}` as string);

    void optimizer.node(glb).then((result) => {
      const { dir, fileName } = outputFilePath(argv, file);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      fs.writeFileSync(`${dir}/${fileName}`, result);
    });
  });
});
