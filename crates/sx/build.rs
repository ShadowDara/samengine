fn main() {
    cxx_build::bridge("src/bridge.rs")
        .file("cpp/rustffi/ffi.cpp")
        .file("cpp/sx/sx.cpp")
        .file("cpp/sx_lib/sx_lib_oscore.cpp")
        .file("cpp/sx_lib/sx_lib.cpp")
        .file("cpp/kvp/kvp.cpp")
        // .file("cpp/sx/sx.cpp")
        .include("cpp")
        .flag_if_supported("/std:c++20")   // MSVC
        .flag_if_supported("-std=c++20")   // GCC/Clang fallback
        .compile("sx");

    println!("cargo:rerun-if-changed=src/bridge.rs");

    println!("cargo:rerun-if-changed=cpp/rustffi/ffi.cpp");
    println!("cargo:rerun-if-changed=cpp/rustffi/ffi.hpp");

    println!("cargo:rerun-if-changed=cpp/sx/sx.hpp");
    println!("cargo:rerun-if-changed=cpp/sx/sx.cpp");
    println!("cargo:rerun-if-changed=cpp/sx/sx_config.hpp");

    println!("cargo:rerun-if-changed=cpp/sx_lib/sx_lib_oscore.hpp");
    println!("cargo:rerun-if-changed=cpp/sx_lib/sx_lib_oscore.cpp");
    println!("cargo:rerun-if-changed=cpp/sx_lib/sx_lib.hpp");
    println!("cargo:rerun-if-changed=cpp/sx_lib/sx_lib.cpp");
    println!("cargo:rerun-if-changed=cpp/sx_lib/ansicolors.hpp");

    println!("cargo:rerun-if-changed=cpp/kvp/kvp.hpp");
    println!("cargo:rerun-if-changed=cpp/kvp/kvp.cpp");
    println!("cargo:rerun-if-changed=cpp/kvp/kvp2.hpp");
}
