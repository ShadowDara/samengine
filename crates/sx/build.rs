fn main() {
    cxx_build::bridge("src/bridge.rs")
        .file("cpp/rustffi/ffi.cpp")
        .include("cpp")
        .flag_if_supported("/std:c++20")   // MSVC
        .flag_if_supported("-std=c++20")   // GCC/Clang fallback
        .compile("sx");

    println!("cargo:rerun-if-changed=src/bridge.rs");
    println!("cargo:rerun-if-changed=cpp/rustffi/ffi.cpp");
    println!("cargo:rerun-if-changed=cpp/rustffi/ffi.hpp");
}
