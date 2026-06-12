declare module "samengine-build-web/resources" {
  const resources: Record<string, string>;
  export default resources;
  export function getResource(path: string): string | null;
  export function loadResource(path: string): string | null;
}
