fn main() {
    cc::Build::new()
        .file("c/main.c")
        .file("c/oscore.c")
        .compile("mein_tool");
}
