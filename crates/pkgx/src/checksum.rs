use sha2::{Digest, Sha256};

pub fn sha256_file(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);

    format!("{:x}", hasher.finalize())
}

pub fn blake3_file(data: &[u8]) -> String {
    blake3::hash(data).to_hex().to_string()
}
