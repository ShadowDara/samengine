use serde::Deserialize;
use anyhow::{Context, Result};
use directories::ProjectDirs;
use std::fs;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub repo_url: String,
    pub cache_size: u64,
}

pub fn load_settings() -> Result<Settings> {
    let proj_dirs = ProjectDirs::from(
        "de",      // Qualifier
        "@shadowdara",  // Organisation
        "pkgx",     // Anwendung
    )
    .context("Could not determine cache directory")?;

    let settings_path = proj_dirs.cache_dir().join("settings.toml");

    let content = fs::read_to_string(&settings_path)
        .with_context(|| format!(
            "Could not read {}",
            settings_path.display()
        ))?;

    let settings: Settings = toml::from_str(&content)
        .context("Invalid settings.toml")?;

    Ok(settings)
}
