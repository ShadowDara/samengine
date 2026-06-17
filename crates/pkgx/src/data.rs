use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub id: String,
    pub pkgversion: i32,

    pub location: String,

    pub sha256: String,
    pub blake3: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageIndex {
    pub package: Vec<Package>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstalledPackage {
    pub name: String,
    pub version: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstalledDb {
    pub installed: Vec<InstalledPackage>,
}

pub fn load_index() -> anyhow::Result<PackageIndex> {
    let content = std::fs::read_to_string("packages.toml")?;

    let index: PackageIndex = toml::from_str(&content)?;

    Ok(index)
}
