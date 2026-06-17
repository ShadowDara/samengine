use colored::*;
use std::{fs, path::Path, process::Command};

fn get_current_branch(repo_path: &Path) -> Option<String> {
    let output = Command::new("git")
        .args(["branch", "--show-current"])
        .current_dir(repo_path)
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let branch = String::from_utf8_lossy(&output.stdout).trim().to_string();

    if branch.is_empty() {
        None
    } else {
        Some(branch)
    }
}

fn main() {
    let current_dir = match std::env::current_dir() {
        Ok(dir) => dir,
        Err(err) => {
            eprintln!("Error while reading the current directory: {err}");
            return;
        }
    };

    let entries = match fs::read_dir(&current_dir) {
        Ok(entries) => entries,
        Err(err) => {
            eprintln!("Error while reading the directory: {err}");
            return;
        }
    };

    println!("{:<40} {}", "Repository".bold(), "Branch".bold());

    println!("{}", "-".repeat(60));

    for entry in entries.flatten() {
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        if !path.join(".git").exists() {
            continue;
        }

        let repo_name = path.file_name().unwrap_or_default().to_string_lossy();

        let branch = get_current_branch(&path).unwrap_or_else(|| "unknown".to_string());

        println!("{:<40} {}", repo_name.to_string().cyan(), branch.green());
    }
}
