fn main() {
    cc::Build::new()
        .file("c/ign/main.c")
        .file("c/ign/oscore.c")
        .compile("ign");

    cc::Build::new().file("c/tags/main.c").compile("tags");
}
