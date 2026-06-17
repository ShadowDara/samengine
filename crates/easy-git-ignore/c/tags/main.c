#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <direct.h>
#define MKDIR(path) _mkdir(path)
#define POPEN _popen
#define PCLOSE _pclose
#else
#include <sys/stat.h>
#include <sys/types.h>
#define MKDIR(path) mkdir(path, 0755)
#define POPEN popen
#define PCLOSE pclose
#endif

int tags_main(void) {
    char repo_root[4096];

    // Git-Root ermitteln
    FILE *root = POPEN("git rev-parse --show-toplevel", "r");
    if (!root) {
        fprintf(stderr, "Failed to run git\n");
        return 1;
    }

    if (!fgets(repo_root, sizeof(repo_root), root)) {
        fprintf(stderr, "Not inside a git repository\n");
        PCLOSE(root);
        return 1;
    }

    PCLOSE(root);

    // Newline entfernen
    repo_root[strcspn(repo_root, "\r\n")] = '\0';

    // .samengine erstellen
    char samengine_dir[8192];
    snprintf(
        samengine_dir,
        sizeof(samengine_dir),
        "%s/.samengine",
        repo_root
    );

    MKDIR(samengine_dir);

    // tags.txt Pfad
    char tags_path[8192];
    snprintf(
        tags_path,
        sizeof(tags_path),
        "%s/tags.txt",
        samengine_dir
    );

    // Tags chronologisch abrufen
    FILE *git_tags = POPEN(
        "git for-each-ref "
        "--sort=creatordate "
        "--format=\"%(refname:short)|%(objectname:short)|%(creatordate:short)\" "
        "refs/tags",
        "r"
    );

    if (!git_tags) {
        fprintf(stderr, "Error while running git tag\n");
        return 1;
    }

    FILE *out = fopen(tags_path, "w");
    if (!out) {
        fprintf(stderr, "Failed to create %s\n", tags_path);
        PCLOSE(git_tags);
        return 1;
    }

    char buffer[4096];

    fprintf(out,
            "%-40s %-12s %-12s\n",
            "TAG",
            "COMMIT",
            "DATE");

    fprintf(out,
            "-----------------------------------------------------------------------\n");


    while (fgets(buffer, sizeof(buffer), git_tags)) {
        buffer[strcspn(buffer, "\r\n")] = '\0';

        char *tag = strtok(buffer, "|");
        char *commit = strtok(NULL, "|");
        char *date = strtok(NULL, "|");

        if (!tag || !commit || !date)
            continue;

        fprintf(out,
                "%-40s %-12s %-12s\n",
                tag,
                commit,
                date);
    }

    fclose(out);
    PCLOSE(git_tags);

    printf("Wrote tags to %s\n", tags_path);

    return 0;
}
