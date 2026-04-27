import fs from "fs";
import path from "path";

/**
 * Gibt die Version eines installierten npm-Pakets zurück.
 * Wirft einen Fehler, wenn das Paket nicht gefunden wird oder ungültig ist.
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
    throw new Error(`Paket '${packageName}' nicht gefunden in node_modules`);
  }

  let packageJson: { version?: string };

  try {
    packageJson = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Ungültige package.json für '${packageName}'`
    );
  }

  if (!packageJson.version) {
    throw new Error(`Keine Version in package.json von '${packageName}' gefunden`);
  }

  return packageJson.version;
}
