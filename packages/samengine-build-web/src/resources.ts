const resources: Record<string, string> = {};

export default resources;

export function getResource(path: string): string | null {
    return resources[path] ?? null;
}

export function loadResource(path: string): string | null {
    return getResource(path);
}
