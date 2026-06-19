#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#define popen _popen
#define pclose _pclose
#define DEVNULL "2>NUL"
#else
#define DEVNULL "2>/dev/null"
#endif

#define MAX_LINE 1024

int u_main(void)
{
    printf("Running git fetch...\n");
    system("git fetch --quiet");

    FILE *fp = popen(
        "git for-each-ref --format=\"%(refname:short)\" refs/heads/",
        "r"
    );

    if (!fp) {
        perror("popen");
        return 1;
    }

    char branch[MAX_LINE];
    int found = 0;

    while (fgets(branch, sizeof(branch), fp)) {
        branch[strcspn(branch, "\r\n")] = 0;

        /* Upstream ermitteln */
        char cmd[MAX_LINE];
        snprintf(
            cmd,
            sizeof(cmd),
            "git rev-parse --abbrev-ref \"%s@{upstream}\" %s",
            branch,
            DEVNULL
        );

        FILE *up_fp = popen(cmd, "r");
        if (!up_fp)
            continue;

        char upstream[MAX_LINE];

        if (!fgets(upstream, sizeof(upstream), up_fp)) {
            pclose(up_fp);
            continue; /* kein Upstream */
        }

        pclose(up_fp);

        upstream[strcspn(upstream, "\r\n")] = 0;

        snprintf(
            cmd,
            sizeof(cmd),
            "git rev-list --count \"%s..%s\"",
            upstream,
            branch
        );

        FILE *count_fp = popen(cmd, "r");
        if (!count_fp)
            continue;

        char count_str[64];

        if (fgets(count_str, sizeof(count_str), count_fp)) {
            int count = atoi(count_str);

            if (count > 0) {
                printf("%s: %d unpushed commit(s)\n",
                       branch,
                       count);
                found = 1;
            }
        }

        pclose(count_fp);
    }

    pclose(fp);

    if (!found)
    {
        printf("No branches with unpushed commits found.\n");
        return 0;
    }

    return 1;
}
