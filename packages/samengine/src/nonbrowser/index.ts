/**
 * Public utility entry point.
 *
 * This file exists so consumers can import helper functions from
 * `sanegine/nonbrowser` without depending on internal source paths.
 */

export { compressHTML } from "./utils.js";

export { getPackageVersion } from "./getversion.js"

export { type CLIArgs, parseArgs } from "./argparser.js";

export { getTemplateZipUrl } from "./ghresolver.js";
