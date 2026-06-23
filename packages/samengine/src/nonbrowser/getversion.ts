import fs from "fs";
import path from "path";

/**
 * Reads the installed version of an npm package from its `package.json`.
 *
 * The CLI uses this to write the installed samengine version into generated
 * HTML/JS metadata and into `window.__samengine__`. The optional `projectRoot`
 * parameter makes the lookup reusable for tests or tools that need to inspect a
 * different project directory.
 *
 * @throws If the package cannot be found in `node_modules`.
 * @throws If the package manifest cannot be parsed as JSON.
 * @throws If the package manifest does not contain a `version` field.
 */
export function getPackageVersion(
  packageName: string,
  projectRoot: string = process.cwd()
): string {
  const packageJsonPath = path.join(
    projectRoot,
    "node_modules",
    packageName,
    "package.json"
  );

  let raw: string;

  try {
    raw = fs.readFileSync(packageJsonPath, "utf-8");
  } catch (err) {
    throw new Error(`Package '${packageName}' was not found in node_modules`);
  }

  let packageJson: { version?: string };

  try {
    packageJson = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Invalid package.json for '${packageName}'`
    );
  }

  if (!packageJson.version) {
    throw new Error(`No version field found in package.json of '${packageName}'`);
  }

  return packageJson.version;
}
