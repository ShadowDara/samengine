

export function getTemplateZipUrl(version: string, username: string, reponame: string) {
    const base = `https://codeload.github.com/${username}/${reponame}/zip`;

    if (version) {
        return `${base}/refs/tags/${version}`;
    }

    return `${base}/refs/heads/main`;
}
