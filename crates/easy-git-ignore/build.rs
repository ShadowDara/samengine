fn main() {
    cc::Build::new()
        .file("c/ign/main.c")
        .file("c/ign/oscore.c")
        .compile("ign");

    cc::Build::new().file("c/tags/main.c").compile("tags");

    cc::Build::new()
        .file("c/tag_push/main.c")
        .compile("tag_push");

    cc::Build::new().file("c/unpush/unpush.c").compile("unpush");
}
