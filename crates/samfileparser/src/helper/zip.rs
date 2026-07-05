use std::fs::File;
use std::io::{Read, Write};
use walkdir::WalkDir;
use zip::write::FileOptions;
use zip::ZipWriter;

pub fn zip_current_dir(output_file: &str) -> zip::result::ZipResult<()> {
    let cwd = std::env::current_dir().expect("Failed to get current dir");

    let file = File::create(output_file).expect("Could not create zip file");
    let mut zip = ZipWriter::new(file);

    let options: FileOptions<'_, ()> = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    let walkdir = WalkDir::new(&cwd).into_iter();

    for entry in walkdir {
        let entry = entry.expect("WalkDir failed");
        let path = entry.path();

        let name = path.strip_prefix(&cwd).unwrap();

        if path.is_file() {
            zip.start_file(name.to_string_lossy(), options)?;

            let mut f = File::open(path).expect("Failed to open file");
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer).expect("Failed to read file");

            zip.write_all(&buffer)?;
        } else if path.is_dir() && !name.as_os_str().is_empty() {
            zip.add_directory(name.to_string_lossy(), options)?;
        }
    }

    zip.finish()?;
    Ok(())
}
