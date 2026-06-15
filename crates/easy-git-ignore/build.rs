fn main() {
    cc::Build::new()
        .file("src/main.c")
        .file("src/oscore.c")
        .compile("mein_tool");
}
