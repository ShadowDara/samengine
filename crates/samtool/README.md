# samtool

The fast CLI Tool for samengine

## for Rust Users

```sh
cargo install samtool
```

## Build all targets

Install

```sh
rustup target add x86_64-unknown-linux-musl aarch64-unknown-linux-musl x86_64-unknown-linux-gnu  aarch64-unknown-linux-gnu x86_64-apple-darwin aarch64-apple-darwin x86_64-pc-windows-msvc x86_64-pc-windows-gnu
```

Compile

```sh
cargo zigbuild --release --target x86_64-unknown-linux-musl
cargo zigbuild --release --target aarch64-unknown-linux-musl

cargo zigbuild --release --target x86_64-unknown-linux-gnu
cargo zigbuild --release --target aarch64-unknown-linux-gnu

cargo zigbuild --release --target x86_64-pc-windows-gnu

cargo build --release --target x86_64-pc-windows-msvc
```
