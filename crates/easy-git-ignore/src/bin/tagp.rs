use std::ffi::CString;
use std::os::raw::c_char;

unsafe extern "C" {
    fn tag_push_main(argc: i32, argv: *const *const c_char) -> i32;
}

fn main() {
    // 1. Args sammeln
    let args: Vec<CString> = std::env::args().map(|a| CString::new(a).unwrap()).collect();

    // 2. Pointer-Array bauen (argv)
    let argv: Vec<*const c_char> = args.iter().map(|a| a.as_ptr()).collect();

    // 3. C Funktion aufrufen
    unsafe {
        tag_push_main(argv.len() as i32, argv.as_ptr());
    }
}
