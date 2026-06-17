unsafe extern "C" {
    fn tags_main() -> i32;
}

fn main() {
    unsafe {
        tags_main();
    }
}
