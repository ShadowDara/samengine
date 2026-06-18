unsafe extern "C" {
    fn u_main() -> i32;
}

fn main() {
    unsafe {
        u_main();
    }
}
